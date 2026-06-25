package com.managemyopz.ticketing.service;

import com.managemyopz.ticketing.entity.User;
import com.managemyopz.ticketing.repository.TicketingUserRepository;
import com.managemyopz.ticketing.util.SimpleHash;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final TicketingUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        return userRepository.findAllActiveOrderByName();
    }

    public Optional<User> findByUid(String uid) {
        return userRepository.findByUid(uid);
    }

    @Transactional
    public Optional<User> authenticate(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();
        String storedHash = user.getPasswordHash();
        if (storedHash == null) return Optional.empty();

        boolean valid = false;
        boolean needsRehash = false;

        // Check if the stored hash is BCrypt (BCrypt hashes start with $2a$, $2b$, or $2y$)
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            valid = passwordEncoder.matches(password, storedHash);
        } else {
            // Check old SimpleHash
            String oldHash = SimpleHash.hash(password);
            valid = storedHash.equals(oldHash);
            if (valid) {
                needsRehash = true;
            }
        }

        if (!valid) return Optional.empty();

        if (needsRehash) {
            // Migrate password hash to BCrypt on successful login
            String newHash = passwordEncoder.encode(password);
            user.setPasswordHash(newHash);
            userRepository.save(user);
        }

        return Optional.of(user);
    }

    @Transactional
    public User recordLogin(User user) {
        user.setLastLogin(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User create(User user) {
        return userRepository.save(user);
    }

    @Transactional
    public User update(String uid, User updates) {
        User existing = userRepository.findByUid(uid)
            .orElseThrow(() -> new RuntimeException("User not found: " + uid));
        if (updates.getName()       != null) existing.setName(updates.getName());
        if (updates.getEmail()      != null) existing.setEmail(updates.getEmail().toLowerCase().trim());
        if (updates.getRole()       != null) existing.setRole(updates.getRole());
        if (updates.getPhone()      != null) existing.setPhone(updates.getPhone());
        if (updates.getDepartment() != null) existing.setDepartment(updates.getDepartment());
        if (updates.getIsActive()   != null) existing.setIsActive(updates.getIsActive());
        if (updates.getPasswordHash() != null) existing.setPasswordHash(updates.getPasswordHash());
        if (updates.getRestrictedModules() != null) existing.setRestrictedModules(updates.getRestrictedModules());
        return userRepository.save(existing);
    }

    @Transactional
    public void softDelete(String uid) {
        userRepository.findByUid(uid).ifPresent(u -> {
            u.setIsActive(false);
            userRepository.save(u);
        });
    }

    public List<User> findAgents() {
        return userRepository.findByRoleInAndIsActiveTrue(
            List.of("agent","admin","super_admin","ultra_super_admin","sub_admin")
        );
    }
}
