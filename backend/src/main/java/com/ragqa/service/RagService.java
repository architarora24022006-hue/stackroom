package com.ragqa.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ragqa.dto.AskResponse;
import com.ragqa.dto.SourceDto;
import com.ragqa.entity.QaHistory;
import com.ragqa.entity.Repository;
import com.ragqa.entity.User;
import com.ragqa.repository.QaHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/** The retrieval-augmented generation pipeline: embed -> retrieve -> generate. */
@Service
public class RagService {

    private final OllamaClient ollamaClient;
    private final VectorStoreService vectorStoreService;
    private final QaHistoryRepository qaHistoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final int topK;

    public RagService(OllamaClient ollamaClient, VectorStoreService vectorStoreService,
                       QaHistoryRepository qaHistoryRepository,
                       @Value("${app.rag.top-k}") int topK) {
        this.ollamaClient = ollamaClient;
        this.vectorStoreService = vectorStoreService;
        this.qaHistoryRepository = qaHistoryRepository;
        this.topK = topK;
    }

    public AskResponse ask(Repository repository, User askedBy, String question) {
        float[] queryEmbedding = ollamaClient.embed(question);

        List<VectorStoreService.RetrievedChunk> retrieved =
                vectorStoreService.findSimilarChunks(repository.getId(), queryEmbedding, topK);

        if (retrieved.isEmpty()) {
            String answer = "This repository doesn't have any indexed documents yet, so I can't answer that. Upload some documents first.";
            return new AskResponse(answer, List.of());
        }

        String context = retrieved.stream()
                .map(c -> "Source: " + c.documentName() + "\n" + c.content())
                .collect(Collectors.joining("\n\n---\n\n"));

        String systemPrompt = """
            You are a helpful assistant answering questions using ONLY the provided context from the team's
            knowledge base. If the context does not contain the answer, say so plainly rather than guessing.
            Be concise and cite which document(s) you used when relevant.
            """;
        String userPrompt = "Context:\n" + context + "\n\nQuestion: " + question;

        String answer = ollamaClient.chat(systemPrompt, userPrompt);

        List<SourceDto> sources = retrieved.stream()
                .map(c -> new SourceDto(c.documentName(), truncate(c.content(), 240), round(c.similarity())))
                .toList();

        saveHistory(repository, askedBy, question, answer, sources);

        return new AskResponse(answer, sources);
    }

    private void saveHistory(Repository repository, User askedBy, String question, String answer, List<SourceDto> sources) {
        try {
            QaHistory history = new QaHistory();
            history.setRepository(repository);
            history.setAskedBy(askedBy);
            history.setQuestion(question);
            history.setAnswer(answer);
            history.setSources(objectMapper.writeValueAsString(sources));
            qaHistoryRepository.save(history);
        } catch (Exception ignored) {
            // history logging is best-effort; never fail the request because of it
        }
    }

    private String truncate(String text, int maxLen) {
        if (text.length() <= maxLen) return text;
        return text.substring(0, maxLen).trim() + "…";
    }

    private double round(double value) {
        return Math.round(value * 1000) / 1000.0;
    }
}
