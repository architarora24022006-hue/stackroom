package com.ragqa.repository;

import com.ragqa.entity.QaHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface QaHistoryRepository extends JpaRepository<QaHistory, UUID> {
    List<QaHistory> findByRepositoryIdOrderByCreatedAtDesc(UUID repositoryId);
}
