package com.managemyopz.security.controller;

import com.managemyopz.security.dto.DashboardLayoutDto;
import com.managemyopz.security.service.DashboardLayoutService;
import com.managemyopz.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/v1/dashboard/layouts")
@RequiredArgsConstructor
public class DashboardLayoutController {

    private final DashboardLayoutService layoutService;

    @GetMapping("/my-layout")
    public ApiResponse<DashboardLayoutDto> getMyLayout(Principal principal) {
        String username = principal != null ? principal.getName() : "admin@managemyopz.com"; // Fallback to seeded user if unauth context
        DashboardLayoutDto layout = layoutService.getActiveLayoutForUser(username);
        return ApiResponse.success(layout);
    }

    @PostMapping("/save")
    public ApiResponse<DashboardLayoutDto> saveMyLayout(@RequestBody DashboardLayoutDto layoutDto, Principal principal) {
        String username = principal != null ? principal.getName() : "admin@managemyopz.com";
        DashboardLayoutDto saved = layoutService.saveLayoutForUser(username, layoutDto);
        return ApiResponse.success(saved, "Dashboard layout saved successfully");
    }
}
