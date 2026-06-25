package com.managemyopz.security.repository;

import com.managemyopz.security.entity.SecurityPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SecurityPageRepository extends JpaRepository<SecurityPage, UUID> {
    Optional<SecurityPage> findByPageCode(String pageCode);
    List<SecurityPage> findByModuleId(UUID moduleId);
}
