package com.shopsphere.repository;

import com.shopsphere.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByShoppingCartIdAndProductId(
            Long shoppingCartId,
            Long productId
    );

}
