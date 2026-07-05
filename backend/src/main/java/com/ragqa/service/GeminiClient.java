package com.ragqa.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Thin client for Google's Gemini API (generativelanguage.googleapis.com).
 * Used for both embeddings (gemini-embedding-001, 3072 dimensions by default)
 * and chat answers (gemini-2.5-flash), both available on Google's free tier
 * with no credit card required — a good fit for free cloud deployment.
 *
 * Note: Google previously offered "text-embedding-004", which was shut down
 * January 2026. gemini-embedding-001 is its replacement. We use its default
 * output size (3072) rather than requesting a smaller one, since the exact
 * REST field name for that isn't consistently documented across Google's
 * own examples — safer to just match whatever it actually returns.
 */
@Component
public class GeminiClient {

    private static final String API_KEY_HEADER = "x-goog-api-key";

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String embeddingModel;
    private final String chatModel;

    public GeminiClient(
            @Value("${app.gemini.base-url}") String baseUrl,
            @Value("${app.gemini.api-key}") String apiKey,
            @Value("${app.gemini.embedding-model}") String embeddingModel,
            @Value("${app.gemini.chat-model}") String chatModel) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(API_KEY_HEADER, apiKey)
                .build();
        this.embeddingModel = embeddingModel;
        this.chatModel = chatModel;
    }

    public float[] embed(String text) {
        String body = """
            {
              "model": "models/%s",
              "content": {"parts": [{"text": %s}]}
            }
            """.formatted(embeddingModel, jsonString(text));

        String response = restClient.post()
                .uri("/models/" + embeddingModel + ":embedContent")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode arr = objectMapper.readTree(response).path("embedding").path("values");
            float[] vector = new float[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                vector[i] = (float) arr.get(i).asDouble();
            }
            return vector;
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse embedding response from Gemini: " + response, e);
        }
    }

    public String chat(String systemPrompt, String userPrompt) {
        String body = """
            {
              "system_instruction": {"parts": [{"text": %s}]},
              "contents": [{"parts": [{"text": %s}]}]
            }
            """.formatted(jsonString(systemPrompt), jsonString(userPrompt));

        String response = restClient.post()
                .uri("/models/" + chatModel + ":generateContent")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            return objectMapper.readTree(response)
                    .path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            throw new IllegalStateException("Could not parse chat response from Gemini: " + response, e);
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
