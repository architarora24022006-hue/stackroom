package com.ragqa.controller;

import com.ragqa.entity.Repository;
import com.ragqa.entity.User;
import com.ragqa.repository.RepositoryRepository;
import com.ragqa.service.BulkQaService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repositories/{repositoryId}/bulk-qa")
public class BulkQaController {

    private static final List<String> ALLOWED_EXTENSIONS = List.of(".xlsx", ".xls");
    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024 * 1024;

    private final RepositoryRepository repositoryRepository;
    private final BulkQaService bulkQaService;

    public BulkQaController(RepositoryRepository repositoryRepository, BulkQaService bulkQaService) {
        this.repositoryRepository = repositoryRepository;
        this.bulkQaService = bulkQaService;
    }

    @PostMapping
    public ResponseEntity<byte[]> bulkAsk(@AuthenticationPrincipal User user, @PathVariable UUID repositoryId,
                                           @RequestParam("file") MultipartFile file) {
        Repository repo = repositoryRepository.findByIdAndTeamId(repositoryId, user.getTeam().getId())
                .orElseThrow(() -> new ApiException(404, "Repository not found."));

        if (file.isEmpty()) {
            throw new ApiException(400, "The uploaded file is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ApiException(400, "File is too large (max 10MB).");
        }
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "questions.xlsx";
        String lower = filename.toLowerCase();
        boolean allowed = ALLOWED_EXTENSIONS.stream().anyMatch(lower::endsWith);
        if (!allowed) {
            throw new ApiException(400, "Only .xlsx and .xls files are supported.");
        }

        byte[] resultBytes;
        try {
            resultBytes = bulkQaService.processWorkbook(file.getInputStream(), repo, user);
        } catch (IllegalArgumentException e) {
            throw new ApiException(400, e.getMessage());
        } catch (Exception e) {
            throw new ApiException(400, "Could not process the file: " + e.getMessage());
        }

        String downloadName = "answered-" + filename;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(downloadName).build());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(resultBytes);
    }
}
