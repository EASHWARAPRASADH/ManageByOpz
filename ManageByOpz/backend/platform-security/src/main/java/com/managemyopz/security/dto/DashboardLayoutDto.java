package com.managemyopz.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardLayoutDto {
    private UUID layoutId;
    private String layoutName;
    private List<DashboardPreferenceDto> widgets;
}
