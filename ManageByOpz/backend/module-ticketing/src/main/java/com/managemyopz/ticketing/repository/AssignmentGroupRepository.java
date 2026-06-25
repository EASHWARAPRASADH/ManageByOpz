package com.managemyopz.ticketing.repository;

import com.managemyopz.ticketing.entity.AssignmentGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssignmentGroupRepository extends JpaRepository<AssignmentGroup, Long> {
    Optional<AssignmentGroup> findByName(String name);
}
