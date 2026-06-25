package com.managemyopz.security.service;

import com.managemyopz.security.entity.User;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.security.repository.RoleRepository;
import com.managemyopz.notification.service.NotificationService;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.shared.exception.PlatformException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProvisioningServiceImpl implements UserProvisioningService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Override
    @Transactional
    public User provisionUser(String tenantId, UUID employeeId, String employeeCode, String email, String firstName, String lastName, String roleCode, String triggeredBy) {
        log.info("Provisioning user account for employee twin: {} (email: {})", employeeId, email);

        // 1. Generate username: firstname.lastname@companydomain.com
        String domain = "acme.com";
        if (email != null && email.contains("@")) {
            domain = email.substring(email.indexOf("@") + 1);
        }
        String generatedUsername = (firstName.replaceAll("\\s+", "").toLowerCase() + "." +
                                    lastName.replaceAll("\\s+", "").toLowerCase() + "@" + domain).trim();

        // Ensure uniqueness
        if (userRepository.findByUsername(generatedUsername).isPresent()) {
            generatedUsername = email.toLowerCase().trim();
        }

        // Check if user already exists for this employee
        Optional<User> existingUser = userRepository.findByEmployeeId(employeeId.toString());
        if (existingUser.isPresent()) {
            log.info("User already provisioned for employee twin: {}", employeeId);
            return existingUser.get();
        }

        // 2. Create User account
        User user = new User();
        user.setTenantId(tenantId != null ? tenantId : "ACME");
        user.setUsername(generatedUsername);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmployeeId(employeeId.toString());
        user.setActive(true);
        user.setLocked(false);
        user.setEmailVerified(false);
        user.setStatus("PENDING_ACTIVATION");
        user.setPasswordChangeRequired(true);
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString())); // Temporary randomized password

        // Generate activation token
        String token = UUID.randomUUID().toString();
        user.setActivationToken(token);
        user.setActivationTokenExpiry(Instant.now().plus(24, ChronoUnit.HOURS));
        user.setActivationSentAt(Instant.now());

        // 3. Assign role
        Set<Role> roles = new HashSet<>();
        String actualRole = (roleCode != null) ? roleCode : "ROLE_EMPLOYEE";
        roleRepository.findByCode(actualRole).ifPresent(roles::add);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // 4. Send activation email
        Map<String, String> variables = new HashMap<>();
        variables.put("employeeName", firstName + " " + lastName);
        variables.put("employeeCode", employeeCode);
        variables.put("email", email);
        variables.put("activationLink", "http://localhost:5173/activate-account?token=" + token);
        
        notificationService.sendEmailFromTemplateWithRecipient(
                savedUser.getId().toString(),
                email,
                "WELCOME_ACTIVATION",
                variables
        );

        // 5. Create audit log
        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                savedUser.getId().toString(),
                AuditLog.AuditAction.USER_CREATED,
                null,
                Map.of("username", generatedUsername, "role", actualRole, "employeeId", employeeId.toString()),
                null,
                triggeredBy,
                actualRole
        );

        return savedUser;
    }

    @Override
    @Transactional
    public void activateAccount(String token, String password) {
        log.info("Activating account for token: {}", token);

        User user = userRepository.findByActivationToken(token)
                .orElseThrow(() -> new PlatformException("Invalid or expired activation token", HttpStatus.BAD_REQUEST, "INVALID_TOKEN"));

        if (user.getActivationTokenExpiry().isBefore(Instant.now())) {
            throw new PlatformException("Activation token has expired", HttpStatus.BAD_REQUEST, "EXPIRED_TOKEN");
        }

        validatePasswordStrength(password);

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setStatus("ACTIVE");
        user.setPasswordChangeRequired(false);
        user.setEmailVerified(true);
        user.setActivatedAt(Instant.now());
        user.setLastPasswordChangeAt(Instant.now());
        user.setActivationToken(null);
        user.setActivationTokenExpiry(null);

        userRepository.save(user);

        // Send confirmation email
        notificationService.sendEmail(user.getEmail(), "Account Activated - ManageMyOpz", "Hello " + user.getFirstName() + ",\n\nYour account has been successfully activated. You can now log in.\n\nRegards,\nHR Team");

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.ACCOUNT_ACTIVATED,
                null,
                Map.of("email", user.getEmail()),
                null,
                user.getUsername(),
                "ROLE_EMPLOYEE"
        );
    }

    @Override
    @Transactional
    public void forgotPassword(String email) {
        log.info("Password reset request for: {}", email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // For security, don't expose if user exists
            return;
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
        userRepository.save(user);

        // Send reset email
        notificationService.sendEmail(
                user.getEmail(),
                "Reset Password - ManageMyOpz",
                "Hello " + user.getFirstName() + ",\n\nClick the link below to reset your password:\n" +
                "http://localhost:5173/reset-password?token=" + resetToken + "\n\nRegards,\nHR Team"
        );

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.PASSWORD_RESET,
                null,
                Map.of("email", user.getEmail()),
                null,
                "system",
                "SYSTEM"
        );
    }

    @Override
    @Transactional
    public void resetPassword(String token, String password) {
        log.info("Resetting password for token: {}", token);

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new PlatformException("Invalid or expired reset token", HttpStatus.BAD_REQUEST, "INVALID_TOKEN"));

        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new PlatformException("Reset token has expired", HttpStatus.BAD_REQUEST, "EXPIRED_TOKEN");
        }

        validatePasswordStrength(password);

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.PASSWORD_CHANGED,
                null,
                Map.of("email", user.getEmail()),
                null,
                user.getUsername(),
                "ROLE_EMPLOYEE"
        );
    }

    @Override
    @Transactional
    public void lockAccount(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        user.setStatus("LOCKED");
        user.setLocked(true);
        user.setAccountLocked(true);
        user.setAccountLockedAt(Instant.now());
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.ACCOUNT_LOCKED,
                null,
                Map.of("email", user.getEmail()),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public void unlockAccount(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        user.setStatus("ACTIVE");
        user.setLocked(false);
        user.setAccountLocked(false);
        user.setAccountLockedAt(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.ACCOUNT_UNLOCKED,
                null,
                Map.of("email", user.getEmail()),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public void forcePasswordReset(UUID userId, String newPassword, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        validatePasswordStrength(newPassword);

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangeRequired(true);
        user.setLastPasswordChangeAt(Instant.now());
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.PASSWORD_CHANGED,
                null,
                Map.of("email", user.getEmail(), "forced", "true"),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public void resendActivationEmail(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        String token = UUID.randomUUID().toString();
        user.setActivationToken(token);
        user.setActivationTokenExpiry(Instant.now().plus(24, ChronoUnit.HOURS));
        user.setActivationSentAt(Instant.now());
        userRepository.save(user);

        Map<String, String> variables = new HashMap<>();
        variables.put("employeeName", user.getFirstName() + " " + user.getLastName());
        variables.put("employeeCode", "EMP");
        variables.put("email", user.getEmail());
        variables.put("activationLink", "http://localhost:5173/activate-account?token=" + token);
        
        notificationService.sendEmailFromTemplateWithRecipient(
                user.getId().toString(),
                user.getEmail(),
                "WELCOME_ACTIVATION",
                variables
        );

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.PASSWORD_RESET,
                null,
                Map.of("email", user.getEmail(), "action", "RESEND_ACTIVATION"),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public void disableAccount(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        user.setStatus("DISABLED");
        user.setActive(false);
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.ACCOUNT_DISABLED,
                null,
                Map.of("email", user.getEmail(), "status", "DISABLED"),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public void enableAccount(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        user.setStatus("ACTIVE");
        user.setActive(true);
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.ACCOUNT_ENABLED,
                null,
                Map.of("email", user.getEmail(), "status", "ACTIVE"),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public void forcePasswordChange(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        user.setPasswordChangeRequired(true);
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.PASSWORD_CHANGED,
                null,
                Map.of("email", user.getEmail(), "forcePasswordChange", "true"),
                null,
                triggeredBy,
                "ADMIN"
        );
    }

    @Override
    @Transactional
    public String generateTemporaryPassword(UUID userId, String triggeredBy) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        String tempPassword = "Temp" + UUID.randomUUID().toString().substring(0, 8) + "@9";
        
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setPasswordChangeRequired(true);
        user.setLastPasswordChangeAt(Instant.now());
        userRepository.save(user);

        auditService.recordAudit(
                user.getTenantId(),
                "SECURITY",
                "USER",
                user.getId().toString(),
                AuditLog.AuditAction.PASSWORD_CHANGED,
                null,
                Map.of("email", user.getEmail(), "action", "GENERATE_TEMP_PASSWORD"),
                null,
                triggeredBy,
                "ADMIN"
        );
        return tempPassword;
    }

    @Override
    @Transactional(readOnly = true)
    public User getAccountByEmployeeId(UUID employeeId) {
        return userRepository.findByEmployeeId(employeeId.toString())
                .orElseThrow(() -> new PlatformException("User account not found for employee twin", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));
    }

    @Override
    @Transactional
    public User updateAccount(UUID employeeId, User accountDetails, String triggeredBy) {
        User existing = userRepository.findByEmployeeId(employeeId.toString())
                .orElseThrow(() -> new PlatformException("User account not found for employee twin", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        String beforeJson = "{\"username\":\"" + existing.getUsername() + "\",\"email\":\"" + existing.getEmail() + "\",\"roles\":\"" + existing.getRoles().toString() + "\"}";

        if (accountDetails.getUsername() != null) {
            existing.setUsername(accountDetails.getUsername());
        }
        if (accountDetails.getEmail() != null) {
            existing.setEmail(accountDetails.getEmail());
        }
        if (accountDetails.getRoles() != null && !accountDetails.getRoles().isEmpty()) {
            existing.setRoles(accountDetails.getRoles());
        }

        User updated = userRepository.save(existing);

        String afterJson = "{\"username\":\"" + updated.getUsername() + "\",\"email\":\"" + updated.getEmail() + "\",\"roles\":\"" + updated.getRoles().toString() + "\"}";

        auditService.recordAudit(
                updated.getTenantId(),
                "SECURITY",
                "USER",
                updated.getId().toString(),
                AuditLog.AuditAction.ROLE_CHANGED,
                beforeJson,
                Map.of("email", updated.getEmail()),
                afterJson,
                triggeredBy,
                "ADMIN"
        );
        return updated;
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8 || password.length() > 64) {
            throw new PlatformException("Password must be between 8 and 64 characters long", HttpStatus.BAD_REQUEST, "INVALID_PASSWORD_LENGTH");
        }
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(c -> !Character.isLetterOrDigit(c));
        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            throw new PlatformException("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character", HttpStatus.BAD_REQUEST, "WEAK_PASSWORD");
        }
    }
}
