package com.ragqa.dto;

public class SourceDto {
    private String documentName;
    private String excerpt;
    private double similarity;

    public SourceDto() {}
    public SourceDto(String documentName, String excerpt, double similarity) {
        this.documentName = documentName;
        this.excerpt = excerpt;
        this.similarity = similarity;
    }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public double getSimilarity() { return similarity; }
    public void setSimilarity(double similarity) { this.similarity = similarity; }
}
