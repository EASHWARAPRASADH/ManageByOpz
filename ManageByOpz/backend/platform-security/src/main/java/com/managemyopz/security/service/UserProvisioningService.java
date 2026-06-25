package com.managemyopz.security.service;

import com.managemyopz.security.entity.User;
import java.util.UUID;

public interface UserProvisioningService {
    User provisionUser(String tenantId, UUID employeeId, String employeeCode, String email, String firstName, String lastName, String roleCode, String triggeredBy);
    void activateAccount(String token, String password);
    void forgotPassword(String email);
    void resetPassword(String token, String password);
    void lockAccount(UUID userId, String triggeredBy);
    void unlockAccount(UUID userId, String triggeredBy);
    void forcePasswordReset(UUID userId, String newPassword, String triggeredBy);
    void resendActivationEmail(UUID userId, String triggeredBy);
    void disableAccount(UUID userId, String triggeredBy);
    void enableAccount(UUID userId, String triggeredBy);
    void forcePasswordChange(UUID userId, String triggeredBy);
    String generateTemporaryPassword(UUID userId, String triggeredBy);
    User getAccountByEmployeeId(UUID employeeId);
    User updateAccount(UUID employeeId, User accountDetails, String triggeredBy);
}
