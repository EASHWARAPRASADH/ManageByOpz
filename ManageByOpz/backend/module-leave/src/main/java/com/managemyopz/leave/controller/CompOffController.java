package com.managemyopz.leave.controller;

import com.managemyopz.leave.entity.CompOffRequest;
import com.managemyopz.leave.entity.CompOffWallet;
import com.managemyopz.leave.service.CompOffService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/leave/comp-off")
@RequiredArgsConstructor
public class CompOffController {

    private final CompOffService compOffService;

    @PostMapping
    public ResponseEntity<ApiResponse<CompOffRequest>> submitRequest(@RequestBody CompOffSubmitRequest request) {
        String actor = TenantContext.getCurrentUser();
        CompOffRequest created = compOffService.submitCompOffRequest(
                request.getEmployeeId(),
                request.getWorkDate(),
                request.getHoursWorked(),
                request.getReason(),
                actor
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Comp-off request submitted successfully"));
    }

    @GetMapping("/requests/{employeeId}")
    public ResponseEntity<ApiResponse<List<CompOffRequest>>> getEmployeeRequests(@PathVariable UUID employeeId) {
        List<CompOffRequest> requests = compOffService.getEmployeeRequests(employeeId);
        return ResponseEntity.ok(ApiResponse.success(requests, "Employee comp-off requests retrieved successfully"));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<CompOffRequest>>> getAllRequests() {
        List<CompOffRequest> requests = compOffService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.success(requests, "All comp-off requests retrieved successfully"));
    }

    @GetMapping("/wallet/{employeeId}")
    public ResponseEntity<ApiResponse<CompOffWallet>> getEmployeeWallet(@PathVariable UUID employeeId) {
        CompOffWallet wallet = compOffService.getEmployeeWallet(employeeId);
        return ResponseEntity.ok(ApiResponse.success(wallet, "Employee comp-off wallet retrieved successfully"));
    }

    @PostMapping("/expire")
    public ResponseEntity<ApiResponse<Void>> triggerExpiry() {
        compOffService.expireCompOffBalances();
        return ResponseEntity.ok(ApiResponse.success(null, "Comp-off balance expiry job executed successfully"));
    }

    @Data
    public static class CompOffSubmitRequest {
        private UUID employeeId;
        private LocalDate workDate;
        private double hoursWorked;
        private String reason;
    }
}
