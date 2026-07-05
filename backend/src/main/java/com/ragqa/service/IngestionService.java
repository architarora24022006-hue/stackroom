package com.ragqa.service;

import com.ragqa.entity.Document;
import com.ragqa.entity.DocumentStatus;
import com.ragqa.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Turns a document's raw text into embedded, searchable chunks.
 *
 * Deliberately NOT wrapped in a single @Transactional block: each chunk
 * embed-and-insert happens as its own small unit of work. That way, if
 * embedding call #7 out of 20 fails (e.g. a transient network error talking
 * to Gemini), we can still cleanly record the document as FAILED and clean
 * up partial chunks — rather than the whole method's transaction being
 * marked rollback-only and silently breaking the status-update call that
 * follows it in the same catch block.
 */
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
