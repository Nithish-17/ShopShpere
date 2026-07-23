package com.shopsphere.repository;

import com.shopsphere.entity.Inventory;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory,Long> {

    boolean existsByProductId(Long productId);

    Optional<Inventory> findByProductId(Long productId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
       SELECT i
       FROM Inventory i
       WHERE i.product.id = :productId
       """)
    Optional<Inventory> findByProductIdForUpdate(Long productId);
}
