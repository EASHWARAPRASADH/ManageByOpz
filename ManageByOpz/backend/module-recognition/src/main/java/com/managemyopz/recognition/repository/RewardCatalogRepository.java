package com.managemyopz.recognition.repository;

import com.managemyopz.recognition.entity.RewardCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface RewardCatalogRepository extends JpaRepository<RewardCatalog, UUID> {
    List<RewardCatalog> findByStatus(String status);
}
