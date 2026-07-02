package com.ragqa.controller;

import com.ragqa.dto.RepositoryDto;
import com.ragqa.dto.RepositoryRequest;
import com.ragqa.entity.User;
import com.ragqa.repository.ChunkRepository;
import com.ragqa.repository.DocumentRepository;
import com.ragqa.repository.RepositoryRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {

    private final RepositoryRepository repositoryRepository;
    private final DocumentRepository documentRepository;

    public RepositoryController(RepositoryRepository repositoryRepository, DocumentRepository documentRepository) {
        this.repositoryRepository = repositoryRepository;
        this.documentRepository = documentRepository;
    }

    @GetMapping
    public List<RepositoryDto> list(@AuthenticationPrincipal User user) {
        return repositoryRepository.findByTeamIdOrderByCreatedAtDesc(user.getTeam().getId()).stream()
                .map(r -> RepositoryDto.from(r, documentRepository.findByRepositoryIdOrderByCreatedAtDesc(r.getId()).size()))
                .toList();
    }

    @PostMapping
    public RepositoryDto create(@AuthenticationPrincipal User user, @Valid @RequestBody RepositoryRequest req) {
        com.ragqa.entity.Repository repo = new com.ragqa.entity.Repository();
        repo.setTeam(user.getTeam());
        repo.setName(req.getName());
        repo.setDescription(req.getDescription());
        repo.setCreatedBy(user);
        repo = repositoryRepository.save(repo);
        return RepositoryDto.from(repo, 0);
    }

    @GetMapping("/{id}")
    public RepositoryDto get(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        com.ragqa.entity.Repository repo = requireRepository(user, id);
        long count = documentRepository.findByRepositoryIdOrderByCreatedAtDesc(repo.getId()).size();
        return RepositoryDto.from(repo, count);
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        com.ragqa.entity.Repository repo = requireRepository(user, id);
        repositoryRepository.delete(repo);
    }

    private com.ragqa.entity.Repository requireRepository(User user, UUID id) {
        return repositoryRepository.findByIdAndTeamId(id, user.getTeam().getId())
                .orElseThrow(() -> new ApiException(404, "Repository not found."));
    }
}
