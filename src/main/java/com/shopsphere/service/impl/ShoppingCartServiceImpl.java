package com.shopsphere.service.impl;

import com.shopsphere.dto.cart.CartItemRequest;
import com.shopsphere.dto.cart.ShoppingCartResponse;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.ShoppingCart;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BusinessException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ShoppingCartMapper;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ShoppingCartRepository;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.InventoryService;
import com.shopsphere.service.ShoppingCartService;
import com.shopsphere.service.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class ShoppingCartServiceImpl implements ShoppingCartService {
    private final ShoppingCartRepository shoppingCartRepository;
    private final ShoppingCartMapper shoppingCartMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final CartItemRepository cartItemRepository;
    private final CurrentUserService currentUserService;

    @Override
    public ShoppingCartResponse createCart() {
        User user = currentUserService.getCurrentUser();
        long userId = user.getId();
        if (shoppingCartRepository.existsByUserId(userId)) throw new BusinessException("User already has a shopping cart.");
        ShoppingCart cart = new ShoppingCart();
        cart.setUser(user);
        return shoppingCartMapper.toResponse(shoppingCartRepository.save(cart));
    }

    @Override
    public ShoppingCartResponse addItem(CartItemRequest request) {

        long userId =  currentUserService.getCurrentUser().getId();
        ShoppingCart cart = getOrCreateCart(findUser(userId));
        Product product = findProduct(request.getProductId());
        if (!product.getActive()) throw new BusinessException("Product is inactive.");
        inventoryService.reserveStock(product.getId(), request.getQuantity());
        CartItem item = cartItemRepository.findByShoppingCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setShoppingCart(cart);
                    newItem.setProduct(product);
                    newItem.setPrice(product.getPrice());
                    newItem.setQuantity(0);
                    cart.getCartItems().add(newItem);
                    return newItem;
                });
        item.setQuantity(item.getQuantity() + request.getQuantity());
        return shoppingCartMapper.toResponse(cart);
    }

    @Override
    public ShoppingCartResponse updateItemQuantity(Long productId, Integer quantity) {
        long userId =  currentUserService.getCurrentUser().getId();
        ShoppingCart cart = findCart(userId);
        CartItem item = findCartItem(cart.getId(), productId);
        int difference = quantity - item.getQuantity();
        if (difference > 0) inventoryService.reserveStock(productId, difference);
        else if (difference < 0) inventoryService.releaseReservedStock(productId, Math.abs(difference));
        item.setQuantity(quantity);
        return shoppingCartMapper.toResponse(cart);
    }

    @Override
    public ShoppingCartResponse removeItem(Long productId) {
        long userId = currentUserService.getCurrentUser().getId();
        ShoppingCart cart = findCart(userId);
        CartItem item = findCartItem(cart.getId(), productId);
        inventoryService.releaseReservedStock(productId, item.getQuantity());
        cart.removeCartItem(item);
        return shoppingCartMapper.toResponse(cart);
    }

    @Override
    public ShoppingCartResponse clearCart() {
        long userId = currentUserService.getCurrentUser().getId();
        ShoppingCart cart = findCartByUserId(userId);
        for (CartItem item : new ArrayList<>(cart.getCartItems())) {
            inventoryService.releaseReservedStock(item.getProduct().getId(), item.getQuantity());
            cart.removeCartItem(item);
        }
        return shoppingCartMapper.toResponse(cart);
    }

    @Override
    public void emptyCart() {
        long userId = currentUserService.getCurrentUser().getId();
        ShoppingCart cart = findCartByUserId(userId);
        for (CartItem item : new ArrayList<>(cart.getCartItems())) cart.removeCartItem(item);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product not found."));
    }

    private ShoppingCart findCart(Long userId) {
        return shoppingCartRepository.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("Cart not found."));
    }

    private ShoppingCart getOrCreateCart(User user) {
        return shoppingCartRepository.findByUserId(user.getId()).orElseGet(() -> {
            ShoppingCart cart = new ShoppingCart();
            cart.setUser(user);
            return shoppingCartRepository.save(cart);
        });
    }

    private CartItem findCartItem(Long cartId, Long productId) {
        return cartItemRepository.findByShoppingCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found."));
    }

    private ShoppingCart findCartByUserId(Long userId) {
        findUser(userId);
        return shoppingCartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Shopping cart not found."));
    }
}
