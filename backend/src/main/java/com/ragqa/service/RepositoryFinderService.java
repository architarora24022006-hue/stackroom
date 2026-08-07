package com.ragqa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragqa.dto.FindRepositoryRequest;
import com.ragqa.dto.FindRepositoryResponse;
import com.ragqa.entity.Repository;
import com.ragqa.entity.Team;
import com.ragqa.repository.RepositoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RepositoryFinderService {

    private final RepositoryRepository repositoryRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RepositoryFinderService(RepositoryRepository repositoryRepository, GeminiClient geminiClient) {
        this.repositoryRepository = repositoryRepository;
        this.geminiClient = geminiClient;
    }

    public FindRepositoryResponse find(Team team, FindRepositoryRequest request) {
        List<Repository> repos = repositoryRepository.findByTeamIdOrderByCreatedAtDesc(team.getId());

        if (repos.isEmpty()) {
            return new FindRepositoryResponse(false, null, null,
                    "There aren't any repositories yet — create one first, then I can help you find things in it.");
        }

        Map<UUID, Repository> byId = repos.stream()
                .collect(Collectors.toMap(Repository::getId, r -> r));

        String repoList = repos.stream()
                .map(r -> "- id: " + r.getId() + " | name: \"" + r.getName() + "\" | description: " +
                        (r.getDescription() == null || r.getDescription().isBlank() ? "(none)" : r.getDescription()))
                .collect(Collectors.joining("\n"));

        String conversation = "";
        if (request.getHistory() != null) {
            conversation = request.getHistory().stream()
                    .map(t -> t.getRole() + ": " + t.getContent())
                    .collect(Collectors.joining("\n"));
        }

        String systemPrompt = """
            You are a friendly front-desk assistant inside a team knowledge base tool called Stackroom.
            Your job is to pick the single best-matching repository (topic area) from the list below for
            whatever the user is asking about — never ask a clarifying question, always pick your single
            best guess immediately, even if the match isn't perfect. If there's only one repository, or
            nothing seems to match well, just pick the closest/most likely one anyway.

            Available repositories for this team:
            %s

            Respond with ONLY a JSON object, no other text, no markdown formatting, in exactly this shape:
            {"resolved": true, "repositoryId": "<id>", "repositoryName": "<name>", "reply": "<a short, friendly one-line sentence>"}

            "resolved" must always be true. Always fill in a real repositoryId and repositoryName from the
            list above — never invent one, and never leave them null. Keep "reply" brief, e.g.
            "Checking <name> for that." Never ask the user a question in your reply.
            """.formatted(repoList);

        String userPrompt = (conversation.isBlank() ? "" : "Conversation so far:\n" + conversation + "\n\n")
                + "Latest message: " + request.getMessage();

        String raw = geminiClient.chat(systemPrompt, userPrompt);

        return parseResponse(raw, byId, repos.get(0));
    }

    private FindRepositoryResponse parseResponse(String raw, Map<UUID, Repository> byId, Repository fallback) {
        try {
            String cleaned = raw.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```[a-zA-Z]*\\n?", "").replaceAll("```$", "").trim();
            }
            JsonNode node = objectMapper.readTree(cleaned);
            String reply = node.path("reply").asText("Checking that for you.");

            if (!node.path("repositoryId").isNull()) {
                UUID id = UUID.fromString(node.path("repositoryId").asText());
                Repository repo = byId.get(id);
                if (repo != null) {
                    return new FindRepositoryResponse(true, repo.getId(), repo.getName(), reply);
                }
            }
            // AI didn't return a valid repository id — fall back rather than asking a question
            return new FindRepositoryResponse(true, fallback.getId(), fallback.getName(),
                    "Checking " + fallback.getName() + " for that.");
        } catch (Exception e) {
            return new FindRepositoryResponse(true, fallback.getId(), fallback.getName(),
                    "Checking " + fallback.getName() + " for that.");
        }
    }
}
