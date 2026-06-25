package com.managemyopz.ticketing.repository;

import com.managemyopz.ticketing.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TicketingDepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
}
