package com.ragqa.repository;

import com.ragqa.entity.Chunk;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ChunkRepository extends JpaRepository<Chunk, UUID> {
    long countByDocumentId(UUID documentId);
}
