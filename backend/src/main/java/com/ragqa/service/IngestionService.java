package com.ragqa.service;

import com.ragqa.entity.Document;
import com.ragqa.entity.DocumentStatus;
import com.ragqa.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Turns a document's raw text into embedded, searchable chunks. */
@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final ChunkingService chunkingService;
    private final OllamaClient ollamaClient;
    private final VectorStoreService vectorStoreService;
    private final DocumentRepository documentRepository;

    public IngestionService(ChunkingService chunkingService, OllamaClient ollamaClient,
                             VectorStoreService vectorStoreService, DocumentRepository documentRepository) {
        this.chunkingService = chunkingService;
        this.ollamaClient = ollamaClient;
        this.vectorStoreService = vectorStoreService;
        this.documentRepository = documentRepository;
    }

    @Transactional
    public void ingest(Document document, String text) {
        try {
            List<String> pieces = chunkingService.chunk(text);
            if (pieces.isEmpty()) {
                throw new IllegalArgumentException("Document has no readable text content.");
            }
            for (int i = 0; i < pieces.size(); i++) {
                String piece = pieces.get(i);
                float[] embedding = ollamaClient.embed(piece);
                vectorStoreService.insertChunkEmbedding(
                        UUID.randomUUID(), document.getId(), document.getRepository().getId(),
                        i, piece, embedding);
            }
            document.setStatus(DocumentStatus.INDEXED);
            documentRepository.save(document);
        } catch (Exception e) {
            log.error("Failed to ingest document {}", document.getId(), e);
            document.setStatus(DocumentStatus.FAILED);
            documentRepository.save(document);
            throw e;
        }
    }
}
