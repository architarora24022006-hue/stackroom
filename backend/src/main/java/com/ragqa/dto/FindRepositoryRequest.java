package com.ragqa.dto;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class FindRepositoryRequest {
    @NotBlank private String message;
    private List<ChatTurn> history;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public List<ChatTurn> getHistory() { return history; }
    public void setHistory(List<ChatTurn> history) { this.history = history; }

    public static class ChatTurn {
        private String role;
        private String content;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
