package com.managemyopz.ticketing.repository;
import com.managemyopz.ticketing.entity.SLABreach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface SLABreachRepository extends JpaRepository<SLABreach, Long> {
    boolean existsByRecordIdAndSlaName(String recordId, String slaName);
    java.util.Optional<SLABreach> findByRecordIdAndSlaName(String recordId, String slaName);
    java.util.List<SLABreach> findByAssignedUser(String assignedUser);
}
