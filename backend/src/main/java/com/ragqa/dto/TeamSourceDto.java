package com.ragqa.dto;

import java.util.UUID;

public class TeamSourceDto {
    private UUID repositoryId;
    private String repositoryName;
    private String documentName;
    private String excerpt;
    private double similarity;

    public TeamSourceDto() {}
    public TeamSourceDto(UUID repositoryId, String repositoryName, String documentName, String excerpt, double similarity) {
        this.repositoryId = repositoryId;
        this.repositoryName = repositoryName;
        this.documentName = documentName;
        this.excerpt = excerpt;
        this.similarity = similarity;
    }

    public UUID getRepositoryId() { return repositoryId; }
    public void setRepositoryId(UUID repositoryId) { this.repositoryId = repositoryId; }
    public String getRepositoryName() { return repositoryName; }
    public void setRepositoryName(String repositoryName) { this.repositoryName = repositoryName; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public double getSimilarity() { return similarity; }
    public void setSimilarity(double similarity) { this.similarity = similarity; }
}
