package com.managemyopz.leave.controller;

import com.managemyopz.leave.entity.PayrollLeaveTransaction;
import com.managemyopz.leave.service.PayrollLeaveService;
import com.managemyopz.shared.dto.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/leave/payroll")
@RequiredArgsConstructor
public class PayrollLeaveController {

    private final PayrollLeaveService payrollLeaveService;

    @PostMapping("/lop")
    public ResponseEntity<ApiResponse<PayrollLeaveTransaction>> generateLop(@RequestBody LopRequest request) {
        PayrollLeaveTransaction created = payrollLeaveService.generateLopTransaction(
                request.getEmployeeId(),
                request.getUnpaidDays(),
                request.getPayrollMonth()
        );
        return ResponseEntity.ok(ApiResponse.success(created, "LOP transaction generated successfully"));
    }

    @PostMapping("/encashment")
    public ResponseEntity<ApiResponse<PayrollLeaveTransaction>> generateEncashment(@RequestBody EncashmentRequest request) {
        PayrollLeaveTransaction created = payrollLeaveService.generateEncashmentTransaction(
                request.getEmployeeId(),
                request.getEncashableDays(),
                request.getPayrollMonth()
        );
        return ResponseEntity.ok(ApiResponse.success(created, "Encashment transaction generated successfully"));
    }

    @GetMapping("/settlement/{employeeId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateFinalSettlement(@PathVariable UUID employeeId) {
        Map<String, Object> settlement = payrollLeaveService.calculateFinalSettlement(employeeId);
        return ResponseEntity.ok(ApiResponse.success(settlement, "Final settlement calculated successfully"));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<PayrollLeaveTransaction>>> getTransactions(@RequestParam("month") String month) {
        List<PayrollLeaveTransaction> transactions = payrollLeaveService.getMonthlyTransactions(month);
        return ResponseEntity.ok(ApiResponse.success(transactions, "Monthly payroll leave transactions retrieved successfully"));
    }

    @Data
    public static class LopRequest {
        private UUID employeeId;
        private double unpaidDays;
        private String payrollMonth;
    }

    @Data
    public static class EncashmentRequest {
        private UUID employeeId;
        private double encashableDays;
        private String payrollMonth;
    }
}
