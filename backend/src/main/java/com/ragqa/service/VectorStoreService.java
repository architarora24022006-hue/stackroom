package com.ragqa.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Handles reading/writing the pgvector `embedding` column directly via JDBC.
 * Hibernate doesn't natively understand the pgvector type, so chunk embeddings
 * are written and searched with plain SQL, casting a "[0.1,0.2,...]" literal
 * to ::vector, which Postgres understands natively once the vector extension
 * is installed (see V1__init.sql).
 */
@Service
public class VectorStoreService {

    private final JdbcTemplate jdbcTemplate;

    public VectorStoreService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void insertChunkEmbedding(UUID chunkId, UUID documentId, UUID repositoryId,
                                      int chunkIndex, String content, float[] embedding) {
        jdbcTemplate.update(
            "INSERT INTO chunks (id, document_id, repository_id, chunk_index, content, embedding) " +
            "VALUES (?, ?, ?, ?, ?, ?::vector)",
            chunkId, documentId, repositoryId, chunkIndex, content, toVectorLiteral(embedding)
        );
    }

    public List<RetrievedChunk> findSimilarChunks(UUID repositoryId, float[] queryEmbedding, int topK) {
        String vectorLiteral = toVectorLiteral(queryEmbedding);
        return jdbcTemplate.query(
            "SELECT c.content AS content, d.filename AS filename, " +
            "       1 - (c.embedding <=> ?::vector) AS similarity " +
            "FROM chunks c " +
            "JOIN documents d ON d.id = c.document_id " +
            "WHERE c.repository_id = ? " +
            "ORDER BY c.embedding <=> ?::vector " +
            "LIMIT ?",
            (rs, rowNum) -> new RetrievedChunk(
                rs.getString("filename"),
                rs.getString("content"),
                rs.getDouble("similarity")
            ),
            vectorLiteral, repositoryId, vectorLiteral, topK
        );
    }

    private String toVectorLiteral(float[] embedding) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < embedding.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(embedding[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public void deleteChunksForDocument(UUID documentId) {
        jdbcTemplate.update("DELETE FROM chunks WHERE document_id = ?", documentId);
    }

    public record RetrievedChunk(String documentName, String content, double similarity) {}
}
