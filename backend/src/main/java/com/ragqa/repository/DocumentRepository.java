package com.ragqa.repository;

import com.ragqa.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);
    Optional<Document> findByIdAndRepositoryId(UUID id, UUID repositoryId);
}
