package com.shopsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "products")
public class Product extends BaseEntity{

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "brand", nullable = false)
    private String brand;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToOne(
            mappedBy = "product",
            fetch = FetchType.LAZY
    )
    private Inventory inventory;

    @OneToMany(
            mappedBy = "product",
            fetch = FetchType.LAZY
    )
    private List<ProductImage> images;

    @OneToMany(
            mappedBy = "product",
            fetch = FetchType.LAZY
    )
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(
            mappedBy = "product",
            fetch = FetchType.LAZY
    )
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(
            mappedBy = "product",
            fetch = FetchType.LAZY
    )
    private List<Review> reviews = new ArrayList<>();


}