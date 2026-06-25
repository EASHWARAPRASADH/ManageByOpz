package com.managemyopz.security.repository;

import com.managemyopz.security.entity.SecurityModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecurityModuleRepository extends JpaRepository<SecurityModule, UUID> {
    Optional<SecurityModule> findByModuleCode(String moduleCode);
}
