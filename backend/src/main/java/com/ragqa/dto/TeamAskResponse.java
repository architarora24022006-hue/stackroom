package com.ragqa.dto;

import java.util.List;

public class TeamAskResponse {
    private String answer;
    private List<TeamSourceDto> sources;

    public TeamAskResponse(String answer, List<TeamSourceDto> sources) {
        this.answer = answer;
        this.sources = sources;
    }

    public String getAnswer() { return answer; }
    public List<TeamSourceDto> getSources() { return sources; }
}
