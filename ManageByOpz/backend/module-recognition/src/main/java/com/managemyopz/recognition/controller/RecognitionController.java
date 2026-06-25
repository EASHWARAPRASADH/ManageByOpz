package com.managemyopz.recognition.controller;

import com.managemyopz.recognition.entity.*;
import com.managemyopz.recognition.service.RecognitionService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/v1/recognition")
@RequiredArgsConstructor
public class RecognitionController {

    private final RecognitionService recognitionService;

    // --- Core Values Engine ---
    @GetMapping("/values")
    public ResponseEntity<ApiResponse<List<RecognitionValue>>> getValues() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getValues(), "Core values retrieved successfully"));
    }

    @PostMapping("/values")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RecognitionValue>> createValue(@RequestBody RecognitionValue value) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(recognitionService.createValue(value), "Core value created successfully"));
    }

    // --- Recognition Types ---
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<RecognitionType>>> getTypes() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getTypes(), "Recognition types retrieved successfully"));
    }

    @PostMapping("/types")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RecognitionType>> createType(@RequestBody RecognitionType type) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(recognitionService.createType(type), "Recognition type created successfully"));
    }

    // --- Wallet ---
    @GetMapping("/wallet/{employeeId}")
    public ResponseEntity<ApiResponse<RecognitionPointsWallet>> getWallet(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getOrCreateWallet(employeeId), "Wallet retrieved successfully"));
    }

    // --- Give Recognition ---
    @PostMapping("/give")
    public ResponseEntity<ApiResponse<Recognition>> giveRecognition(@RequestBody GiveRecognitionRequest request) {
        String actor = TenantContext.getCurrentUser();
        Recognition rec = recognitionService.giveRecognition(
                request.getGiverEmployeeId(),
                request.getReceiverEmployeeId(),
                request.getRecognitionValueId(),
                request.getRecognitionTypeId(),
                request.getTitle(),
                request.getMessage(),
                request.getPoints(),
                request.getVisibility(),
                request.getTags(),
                request.getProjectRef(),
                request.getBusinessImpact(),
                actor
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(rec, "Recognition granted successfully"));
    }

    // --- Feed & Social ---
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<Recognition>>> getFeed() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getFeed(), "Recognition feed retrieved successfully"));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<RecognitionComment>>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getComments(id), "Comments retrieved successfully"));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<ApiResponse<RecognitionComment>> addComment(@PathVariable UUID id, @RequestBody CommentRequest request) {
        String actor = TenantContext.getCurrentUser();
        RecognitionComment comment = recognitionService.addComment(id, request.getEmployeeId(), request.getCommentText(), actor);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(comment, "Comment added successfully"));
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<ApiResponse<Void>> toggleReaction(@PathVariable UUID id, @RequestBody ReactRequest request) {
        String actor = TenantContext.getCurrentUser();
        recognitionService.toggleReaction(id, request.getEmployeeId(), request.getReactionType(), actor);
        return ResponseEntity.ok(ApiResponse.success(null, "Reaction toggled successfully"));
    }

    // --- Reward Marketplace ---
    @GetMapping("/rewards/catalog")
    public ResponseEntity<ApiResponse<List<RewardCatalog>>> getCatalog() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getCatalog(), "Reward catalog retrieved successfully"));
    }

    @PostMapping("/rewards/catalog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RewardCatalog>> createCatalogItem(@RequestBody RewardCatalog item) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(recognitionService.createCatalogItem(item), "Catalog item added successfully"));
    }

    @PostMapping("/rewards/redeem")
    public ResponseEntity<ApiResponse<RewardRedemption>> redeemPoints(@RequestBody RedeemRequest request) {
        String actor = TenantContext.getCurrentUser();
        RewardRedemption redemption = recognitionService.redeemPoints(
                request.getEmployeeId(),
                request.getRewardId(),
                request.getDeliveryDetails(),
                actor
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(redemption, "Reward redeemed successfully"));
    }

    @GetMapping("/rewards/redemptions")
    public ResponseEntity<ApiResponse<List<RewardRedemption>>> getRedemptions(@RequestParam(required = false) UUID employeeId) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getRedemptions(employeeId), "Redemptions retrieved successfully"));
    }

    @PutMapping("/rewards/redemptions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RewardRedemption>> updateRedemptionStatus(
            @PathVariable UUID id,
            @RequestParam String status,
            @RequestParam(required = false) String trackingNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                recognitionService.updateRedemptionStatus(id, status, trackingNumber),
                "Redemption status updated successfully"
        ));
    }

    // --- Award Programs ---
    @GetMapping("/awards/programs")
    public ResponseEntity<ApiResponse<List<AwardProgram>>> getAwardPrograms() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getAwardPrograms(), "Award programs retrieved successfully"));
    }

    @PostMapping("/awards/programs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AwardProgram>> createAwardProgram(@RequestBody AwardProgram program) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(recognitionService.createAwardProgram(program), "Award program created successfully"));
    }

    @PostMapping("/awards/nominate")
    public ResponseEntity<ApiResponse<AwardNomination>> nominateEmployee(@RequestBody NominateRequest request) {
        String actor = TenantContext.getCurrentUser();
        AwardNomination nomination = recognitionService.nominateEmployee(
                request.getProgramId(),
                request.getNomineeEmployeeId(),
                request.getNominatorEmployeeId(),
                request.getReason(),
                request.getEvidenceUrl(),
                actor
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(nomination, "Nomination submitted successfully"));
    }

    @GetMapping("/awards/nominations/{programId}")
    public ResponseEntity<ApiResponse<List<AwardNomination>>> getNominationsByProgram(@PathVariable UUID programId) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getNominationsByProgram(programId), "Nominations retrieved successfully"));
    }

    @PostMapping("/awards/nominations/{id}/vote")
    public ResponseEntity<ApiResponse<AwardNomination>> voteNomination(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.voteNomination(id), "Vote registered successfully"));
    }

    @PostMapping("/awards/nominations/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AwardNomination>> approveNomination(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.approveNomination(id), "Nomination approved successfully"));
    }

    // --- Leaderboards & Analytics ---
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLeaderboard() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getLeaderboard(), "Leaderboard retrieved successfully"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.getAnalytics(), "Analytics retrieved successfully"));
    }

    // --- AI Recognition Insights ---
    @GetMapping("/ai/insights")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiInsights() {
        Map<String, Object> insights = new HashMap<>();
        insights.put("suggestedEmployees", List.of("Sarah Johnson", "Alex Wong"));
        insights.put("suggestedValues", List.of("Innovation", "Customer First"));
        insights.put("suggestedMessage", "Sarah did an incredible job solving the modular monolith dependencies. Highly recommend recognizing her!");
        return ResponseEntity.ok(ApiResponse.success(insights, "AI insights generated successfully"));
    }

    @PostMapping("/health/report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthReport(@RequestBody List<UUID> employeeIds) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.generateHealthReport(employeeIds), "Health report generated successfully"));
    }

    @PostMapping("/health/provision-wallets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> provisionWallets(@RequestBody List<UUID> employeeIds) {
        return ResponseEntity.ok(ApiResponse.success(recognitionService.provisionMissingWallets(employeeIds), "Missing wallets provisioned successfully"));
    }

    // --- DTO Requests ---
    @Data
    public static class GiveRecognitionRequest {
        private UUID giverEmployeeId;
        private UUID receiverEmployeeId;
        private UUID recognitionValueId;
        private UUID recognitionTypeId;
        private String title;
        private String message;
        private int points;
        private String visibility;
        private String tags;
        private String projectRef;
        private String businessImpact;
    }

    @Data
    public static class CommentRequest {
        private UUID employeeId;
        private String commentText;
    }

    @Data
    public static class ReactRequest {
        private UUID employeeId;
        private String reactionType;
    }

    @Data
    public static class RedeemRequest {
        private UUID employeeId;
        private UUID rewardId;
        private String deliveryDetails;
    }

    @Data
    public static class NominateRequest {
        private UUID programId;
        private UUID nomineeEmployeeId;
        private UUID nominatorEmployeeId;
        private String reason;
        private String evidenceUrl;
    }
}
