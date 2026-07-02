package com.ragqa.controller;

import com.ragqa.dto.AskRequest;
import com.ragqa.dto.AskResponse;
import com.ragqa.entity.Repository;
import com.ragqa.entity.User;
import com.ragqa.repository.RepositoryRepository;
import com.ragqa.service.RagService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/repositories/{repositoryId}")
public class QaController {

    private final RepositoryRepository repositoryRepository;
    private final RagService ragService;

    public QaController(RepositoryRepository repositoryRepository, RagService ragService) {
        this.repositoryRepository = repositoryRepository;
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    public AskResponse ask(@AuthenticationPrincipal User user, @PathVariable UUID repositoryId,
                            @Valid @RequestBody AskRequest req) {
        Repository repo = repositoryRepository.findByIdAndTeamId(repositoryId, user.getTeam().getId())
                .orElseThrow(() -> new ApiException(404, "Repository not found."));
        return ragService.ask(repo, user, req.getQuestion());
    }
}
