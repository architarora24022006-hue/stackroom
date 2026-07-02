package com.ragqa.controller;

import com.ragqa.dto.DocumentDto;
import com.ragqa.entity.Document;
import com.ragqa.entity.DocumentStatus;
import com.ragqa.entity.Repository;
import com.ragqa.entity.User;
import com.ragqa.repository.ChunkRepository;
import com.ragqa.repository.DocumentRepository;
import com.ragqa.repository.RepositoryRepository;
import com.ragqa.service.IngestionService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/repositories/{repositoryId}/documents")
public class DocumentController {

    private static final List<String> ALLOWED_EXTENSIONS = List.of(".txt", ".md", ".csv", ".xlsx", ".xls");
    private static final long MAX_FILE_SIZE_BYTES = 20L * 1024 * 1024;

    private final RepositoryRepository repositoryRepository;
    private final DocumentRepository documentRepository;
    private final ChunkRepository chunkRepository;
    private final IngestionService ingestionService;
    private final com.ragqa.service.ExcelTextExtractor excelTextExtractor;

    public DocumentController(RepositoryRepository repositoryRepository, DocumentRepository documentRepository,
                               ChunkRepository chunkRepository, IngestionService ingestionService,
                               com.ragqa.service.ExcelTextExtractor excelTextExtractor) {
        this.repositoryRepository = repositoryRepository;
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.ingestionService = ingestionService;
        this.excelTextExtractor = excelTextExtractor;
    }

    @GetMapping
    public List<DocumentDto> list(@AuthenticationPrincipal User user, @PathVariable UUID repositoryId) {
        requireRepository(user, repositoryId);
        return documentRepository.findByRepositoryIdOrderByCreatedAtDesc(repositoryId).stream()
                .map(d -> DocumentDto.from(d, chunkRepository.countByDocumentId(d.getId())))
                .toList();
    }

    @PostMapping
    public DocumentDto upload(@AuthenticationPrincipal User user, @PathVariable UUID repositoryId,
                               @RequestParam("file") MultipartFile file) {
        Repository repo = requireRepository(user, repositoryId);

        if (file.isEmpty()) {
            throw new ApiException(400, "The uploaded file is empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ApiException(400, "File is too large (max 20MB).");
        }
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
        String lower = filename.toLowerCase();
        boolean allowed = ALLOWED_EXTENSIONS.stream().anyMatch(lower::endsWith);
        if (!allowed) {
            throw new ApiException(400, "Only .txt, .md, and .csv files are supported right now.");
        }

        String text;
        boolean isExcel = lower.endsWith(".xlsx") || lower.endsWith(".xls");
        try {
            if (isExcel) {
                text = excelTextExtractor.extractText(file.getInputStream());
            } else {
                text = new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (ApiException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new ApiException(400, e.getMessage());
        } catch (Exception e) {
            throw new ApiException(400, "Could not read the file. Make sure it's not corrupted or password-protected.");
        }

        Document document = new Document();
        document.setRepository(repo);
        document.setFilename(filename);
        document.setContentType(file.getContentType());
        document.setUploadedBy(user);
        document.setStatus(DocumentStatus.PROCESSING);
        document = documentRepository.save(document);

        ingestionService.ingest(document, text);

        return DocumentDto.from(document, chunkRepository.countByDocumentId(document.getId()));
    }

    @DeleteMapping("/{documentId}")
    public void delete(@AuthenticationPrincipal User user, @PathVariable UUID repositoryId, @PathVariable UUID documentId) {
        requireRepository(user, repositoryId);
        Document doc = documentRepository.findByIdAndRepositoryId(documentId, repositoryId)
                .orElseThrow(() -> new ApiException(404, "Document not found."));
        documentRepository.delete(doc);
    }

    private Repository requireRepository(User user, UUID repositoryId) {
        return repositoryRepository.findByIdAndTeamId(repositoryId, user.getTeam().getId())
                .orElseThrow(() -> new ApiException(404, "Repository not found."));
    }
}
