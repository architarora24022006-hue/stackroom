package com.ragqa.controller;

import com.ragqa.dto.AskRequest;
import com.ragqa.dto.AskResponse;
import com.ragqa.entity.Repository;
import com.ragqa.repository.RepositoryRepository;
import com.ragqa.service.RagService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Public (no login required) version of the "ask" endpoint, meant for
 * embedding a Stackroom-powered chat widget on an external website — e.g.
 * a customer support widget on an e-commerce site, answering questions
 * against one specific repository's documents.
 *
 * Deliberately unauthenticated: unlike /api/repositories/{id}/ask, this does
 * not check team membership — the repository id itself acts as the "key".
 * Only expose this for repositories you're comfortable making public.
 */
@RestController
@RequestMapping("/api/public/repositories/{repositoryId}")
public class PublicQaController {

    private final RepositoryRepository repositoryRepository;
    private final RagService ragService;

    public PublicQaController(RepositoryRepository repositoryRepository, RagService ragService) {
        this.repositoryRepository = repositoryRepository;
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    public AskResponse ask(@PathVariable UUID repositoryId, @Valid @RequestBody AskRequest req) {
        Repository repo = repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new ApiException(404, "This chatbot isn't available right now."));
        // saveToHistory=false: anonymous public questions don't need to clutter the team's QA history
        return ragService.ask(repo, null, req.getQuestion(), false);
    }
}
