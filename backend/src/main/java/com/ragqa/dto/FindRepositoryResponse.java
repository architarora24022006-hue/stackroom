package com.ragqa.dto;
import java.util.UUID;

public class FindRepositoryResponse {
    private boolean resolved;
    private UUID repositoryId;
    private String repositoryName;
    private String reply;

    public FindRepositoryResponse() {}
    public FindRepositoryResponse(boolean resolved, UUID repositoryId, String repositoryName, String reply) {
        this.resolved = resolved;
        this.repositoryId = repositoryId;
        this.repositoryName = repositoryName;
        this.reply = reply;
    }

    public boolean isResolved() { return resolved; }
    public void setResolved(boolean resolved) { this.resolved = resolved; }
    public UUID getRepositoryId() { return repositoryId; }
    public void setRepositoryId(UUID repositoryId) { this.repositoryId = repositoryId; }
    public String getRepositoryName() { return repositoryName; }
    public void setRepositoryName(String repositoryName) { this.repositoryName = repositoryName; }
    public String getReply() { return reply; }
    public void setReply(String reply) { this.reply = reply; }
}
