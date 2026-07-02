package com.ragqa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

/**
 * Thin client around a locally running Ollama instance (https://ollama.com).
 * Ollama exposes an OpenAI-adjacent REST API at http://localhost:11434 by
 * default — no API key required since it runs on the user's own machine.
 */
@Component
public class OllamaClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String embeddingModel;
    private final String chatModel;

    public OllamaClient(
            @Value("${app.ollama.base-url}") String baseUrl,
            @Value("${app.ollama.embedding-model}") String embeddingModel,
            @Value("${app.ollama.chat-model}") String chatModel) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.embeddingModel = embeddingModel;
        this.chatModel = chatModel;
    }

    /** Calls POST /api/embeddings and returns the embedding vector. */
    public float[] embed(String text) {
        String body = """
            {"model": "%s", "prompt": %s}
            """.formatted(embeddingModel, jsonString(text));

        String response = restClient.post()
                .uri("/api/embeddings")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode arr = root.get("embedding");
            float[] vector = new float[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                vector[i] = (float) arr.get(i).asDouble();
            }
            return vector;
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse embedding response from Ollama. " +
                    "Is Ollama running with the '" + embeddingModel + "' model pulled?", e);
        }
    }

    /** Calls POST /api/chat (non-streaming) and returns the assistant's reply text. */
    public String chat(String systemPrompt, String userPrompt) {
        String body = """
            {
              "model": "%s",
              "stream": false,
              "messages": [
                {"role": "system", "content": %s},
                {"role": "user", "content": %s}
              ]
            }
            """.formatted(chatModel, jsonString(systemPrompt), jsonString(userPrompt));

        String response = restClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("message").path("content").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse chat response from Ollama. " +
                    "Is Ollama running with the '" + chatModel + "' model pulled?", e);
        }
    }

    private String jsonString(String raw) {
        try {
            return objectMapper.writeValueAsString(raw);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
