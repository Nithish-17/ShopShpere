package com.shopsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "customers")
public class Customer extends BaseEntity{

    @Column(
            name = "first_name",
            nullable = false
    )
    private String firstName;

    @Column(
            name = "last_name",
            nullable = false
    )
    private String lastName;

    @Column(
            name = "email",
            nullable = false,
            unique = true
    )
    private String email;

    @Column(
            name = "phone",
            nullable = false,
            unique = true
    )
    private String phone;

    @OneToOne(
            mappedBy = "customer",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private ShoppingCart shoppingCart;

    @OneToMany(
            mappedBy = "customer",
            fetch = FetchType.LAZY
    )
    private List<Order> orders = new ArrayList<>();

    @OneToMany(
            mappedBy = "customer",
            fetch = FetchType.LAZY
    )
    private List<Review> reviews = new ArrayList<>();

}