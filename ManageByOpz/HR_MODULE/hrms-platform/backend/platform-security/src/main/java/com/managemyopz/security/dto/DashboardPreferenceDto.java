package com.managemyopz.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardPreferenceDto {
    private String widgetKey;
    private String componentName;
    private String title;
    private int x;
    private int y;
    private int w;
    private int h;
    private boolean visible;
}
