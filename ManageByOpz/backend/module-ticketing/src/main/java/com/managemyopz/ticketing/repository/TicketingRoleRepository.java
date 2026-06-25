package com.managemyopz.ticketing.repository;

import com.managemyopz.ticketing.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketingRoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
