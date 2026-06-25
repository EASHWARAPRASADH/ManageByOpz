package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RecognitionPointsWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecognitionPointsWalletRepository extends JpaRepository<RecognitionPointsWallet, UUID> {
    Optional<RecognitionPointsWallet> findByEmployeeId(UUID employeeId);

    @Query(value = "SELECT * FROM recognition_points_wallets WHERE employee_id = :employeeId", nativeQuery = true)
    Optional<RecognitionPointsWallet> findByEmployeeIdNative(@Param("employeeId") UUID employeeId);

    @Modifying
    @Transactional
    @Query(value = "UPDATE recognition_points_wallets SET tenant_id = :tenantId WHERE employee_id = :employeeId", nativeQuery = true)
    void updateTenantIdNative(@Param("employeeId") UUID employeeId, @Param("tenantId") String tenantId);
}
