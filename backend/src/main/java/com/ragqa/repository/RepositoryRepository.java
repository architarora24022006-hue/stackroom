package com.ragqa.repository;

import com.ragqa.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepositoryRepository extends JpaRepository<Repository, UUID> {
    List<Repository> findByTeamIdOrderByCreatedAtDesc(UUID teamId);
    Optional<Repository> findByIdAndTeamId(UUID id, UUID teamId);
}
