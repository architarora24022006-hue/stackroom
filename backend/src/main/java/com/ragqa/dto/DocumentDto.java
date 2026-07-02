package com.ragqa.dto;

import com.ragqa.entity.Document;
import java.time.Instant;
import java.util.UUID;

public class DocumentDto {
    private UUID id;
    private String filename;
    private String status;
    private long chunkCount;
    private Instant createdAt;

    public static DocumentDto from(Document d, long chunkCount) {
        DocumentDto dto = new DocumentDto();
        dto.id = d.getId();
        dto.filename = d.getFilename();
        dto.status = d.getStatus().name();
        dto.chunkCount = chunkCount;
        dto.createdAt = d.getCreatedAt();
        return dto;
    }

    public UUID getId() { return id; }
    public String getFilename() { return filename; }
    public String getStatus() { return status; }
    public long getChunkCount() { return chunkCount; }
    public Instant getCreatedAt() { return createdAt; }
}
