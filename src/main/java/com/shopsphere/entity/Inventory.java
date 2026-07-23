package com.shopsphere.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "inventories")
public class Inventory extends BaseEntity{

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "minimum_stock", nullable = false)
    private Integer minimumStock;

    @Column(name = "maximum_stock", nullable = false)
    private Integer maximumStock;

    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    @OneToOne(
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL
    )
    @JoinColumn(
            name = "product_id",
            nullable = false,
            unique = true
    )
    private Product product;


    @Version
    private long version;




    //helper method
    public Integer getAvailableQuantity() {
        return quantity - reservedQuantity;
    }



}
