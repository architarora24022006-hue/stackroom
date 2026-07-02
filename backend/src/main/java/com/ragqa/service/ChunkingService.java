package com.ragqa.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/** Splits raw document text into overlapping character-based chunks. */
@Service
public class ChunkingService {

    private final int chunkSizeChars;
    private final int overlapChars;

    public ChunkingService(
            @Value("${app.rag.chunk-size-chars}") int chunkSizeChars,
            @Value("${app.rag.chunk-overlap-chars}") int overlapChars) {
        this.chunkSizeChars = chunkSizeChars;
        this.overlapChars = overlapChars;
    }

    public List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        String normalized = text.replace("\r\n", "\n").trim();
        if (normalized.isEmpty()) return chunks;

        int start = 0;
        int length = normalized.length();
        while (start < length) {
            int end = Math.min(start + chunkSizeChars, length);
            // try to break on a paragraph or sentence boundary near the end
            if (end < length) {
                int breakPoint = normalized.lastIndexOf("\n\n", end);
                if (breakPoint <= start) breakPoint = normalized.lastIndexOf(". ", end);
                if (breakPoint > start + (chunkSizeChars / 2)) {
                    end = breakPoint + 1;
                }
            }
            String piece = normalized.substring(start, end).trim();
            if (!piece.isEmpty()) chunks.add(piece);
            if (end >= length) break;
            start = Math.max(end - overlapChars, start + 1);
        }
        return chunks;
    }
}
