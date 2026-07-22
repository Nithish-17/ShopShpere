package com.shopsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "categories")
public class Category extends BaseEntity{

    @Column(
            name = "name",
            nullable = false,
            unique = true
    )
    private String name;

    @Column(name = "description")
    private String description;

    @OneToMany(
            mappedBy = "category",
            fetch = FetchType.LAZY
    )
    private List<Product> products;

}
