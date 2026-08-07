package com.ragqa.service;

import com.ragqa.entity.Document;
import com.ragqa.entity.DocumentStatus;
import com.ragqa.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final ChunkingService chunkingService;
    private final GeminiClient geminiClient;
    private final VectorStoreService vectorStoreService;
    private final DocumentRepository documentRepository;

    public IngestionService(ChunkingService chunkingService, GeminiClient geminiClient,
                             VectorStoreService vectorStoreService, DocumentRepository documentRepository) {
        this.chunkingService = chunkingService;
        this.geminiClient = geminiClient;
        this.vectorStoreService = vectorStoreService;
        this.documentRepository = documentRepository;
    }

    public void ingest(Document document, String text) {
        try {
            List<String> pieces = chunkingService.chunk(text);
            if (pieces.isEmpty()) {
                throw new IllegalArgumentException("Document has no readable text content.");
            }
            for (int i = 0; i < pieces.size(); i++) {
                String piece = pieces.get(i);
                float[] embedding = geminiClient.embed(piece);
                vectorStoreService.insertChunkEmbedding(
                        UUID.randomUUID(), document.getId(), document.getRepository().getId(),
                        i, piece, embedding);
            }
            document.setStatus(DocumentStatus.INDEXED);
            documentRepository.save(document);
        } catch (Exception e) {
            log.error("Failed to ingest document {}", document.getId(), e);
            try {
                vectorStoreService.deleteChunksForDocument(document.getId());
                document.setStatus(DocumentStatus.FAILED);
                documentRepository.save(document);
            } catch (Exception cleanupError) {
                log.error("Also failed to record FAILED status for document {}", document.getId(), cleanupError);
            }
            throw new IllegalStateException(describeFailure(e), e);
        }
    }

    private String describeFailure(Exception e) {
        String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        return "Could not process this document: " + message;
    }
}
