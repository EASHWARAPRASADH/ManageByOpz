package com.managemyopz.ticketing.repository;

import com.managemyopz.ticketing.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByOwner(String owner);
    List<Asset> findByStatus(String status);
}
