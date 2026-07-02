package com.ragqa.dto;

import com.ragqa.entity.Repository;
import java.time.Instant;
import java.util.UUID;

public class RepositoryDto {
    private UUID id;
    private String name;
    private String description;
    private long documentCount;
    private Instant createdAt;

    public static RepositoryDto from(Repository r, long documentCount) {
        RepositoryDto dto = new RepositoryDto();
        dto.id = r.getId();
        dto.name = r.getName();
        dto.description = r.getDescription();
        dto.documentCount = documentCount;
        dto.createdAt = r.getCreatedAt();
        return dto;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public long getDocumentCount() { return documentCount; }
    public Instant getCreatedAt() { return createdAt; }
}
