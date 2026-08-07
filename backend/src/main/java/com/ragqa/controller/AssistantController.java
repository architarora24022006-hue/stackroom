package com.ragqa.controller;

import com.ragqa.dto.FindRepositoryRequest;
import com.ragqa.dto.FindRepositoryResponse;
import com.ragqa.entity.User;
import com.ragqa.service.RepositoryFinderService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final RepositoryFinderService repositoryFinderService;

    public AssistantController(RepositoryFinderService repositoryFinderService) {
        this.repositoryFinderService = repositoryFinderService;
    }

    @PostMapping("/find-repository")
    public FindRepositoryResponse findRepository(@AuthenticationPrincipal User user,
                                                   @Valid @RequestBody FindRepositoryRequest request) {
        return repositoryFinderService.find(user.getTeam(), request);
    }
}
