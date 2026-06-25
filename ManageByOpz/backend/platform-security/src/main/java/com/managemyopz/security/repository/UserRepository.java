package com.managemyopz.security.repository;

import com.managemyopz.security.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    Optional<User> findByActivationToken(String token);
    Optional<User> findByResetToken(String token);
    Optional<User> findByEmployeeId(String employeeId);

    @Query(value = "SELECT COUNT(*) FROM users WHERE email = :email", nativeQuery = true)
    long existsByEmailGlobal(@Param("email") String email);
}
