package com.ragqa.dto;

import java.util.List;

public class AskResponse {
    private String answer;
    private List<SourceDto> sources;

    public AskResponse(String answer, List<SourceDto> sources) {
        this.answer = answer;
        this.sources = sources;
    }

    public String getAnswer() { return answer; }
    public List<SourceDto> getSources() { return sources; }
}
