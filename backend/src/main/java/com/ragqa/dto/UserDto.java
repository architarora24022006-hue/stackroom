package com.ragqa.dto;

import com.ragqa.entity.User;
import java.util.UUID;

public class UserDto {
    private UUID id;
    private String name;
    private String email;
    private String role;
    private String teamName;
    private UUID teamId;

    public static UserDto from(User u) {
        UserDto dto = new UserDto();
        dto.id = u.getId();
        dto.name = u.getName();
        dto.email = u.getEmail();
        dto.role = u.getRole().name();
        dto.teamName = u.getTeam().getName();
        dto.teamId = u.getTeam().getId();
        return dto;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getTeamName() { return teamName; }
    public UUID getTeamId() { return teamId; }
}
