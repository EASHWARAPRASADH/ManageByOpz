package com.managemyopz.ticketing.repository;

import com.managemyopz.ticketing.entity.CallActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CallActivityRepository extends JpaRepository<CallActivity, Long> {
    List<CallActivity> findByCallIdOrderByCreatedAtDesc(Long callId);
}
