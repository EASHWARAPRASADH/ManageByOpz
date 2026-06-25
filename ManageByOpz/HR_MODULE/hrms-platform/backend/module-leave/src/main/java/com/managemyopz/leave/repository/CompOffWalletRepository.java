package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.CompOffWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompOffWalletRepository extends JpaRepository<CompOffWallet, UUID> {
    Optional<CompOffWallet> findByEmployeeIdAndDeletedFalse(UUID employeeId);
    List<CompOffWallet> findByExpiryDateBeforeAndAvailableDaysGreaterThanAndDeletedFalse(LocalDate date, double days);
}
