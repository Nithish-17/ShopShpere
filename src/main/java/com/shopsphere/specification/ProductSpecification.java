package com.shopsphere.specification;

import com.shopsphere.entity.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class ProductSpecification {

    private ProductSpecification() {
    }

    public static Specification<Product> active() {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("active"),
                        true
                );
    }

    public static Specification<Product> keyword(
            String keyword) {

        return (root, query, criteriaBuilder) -> {

            String search =
                    "%" + keyword.trim().toLowerCase() + "%";

            return criteriaBuilder.or(

                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("name")
                            ),
                            search
                    ),

                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("description")
                            ),
                            search
                    ),

                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("brand")
                            ),
                            search
                    )
            );
        };
    }

    public static Specification<Product> category(
            Long categoryId) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("category").get("id"),
                        categoryId
                );
    }

    public static Specification<Product> brand(
            String brand) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        criteriaBuilder.lower(
                                root.get("brand")
                        ),
                        brand.trim().toLowerCase()
                );
    }

    public static Specification<Product> priceGreaterThanOrEqualTo(
            BigDecimal minPrice) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("price"),
                        minPrice
                );
    }

    public static Specification<Product> priceLessThanOrEqualTo(
            BigDecimal maxPrice) {

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("price"),
                        maxPrice
                );
    }

    public static Specification<Product> stockAvailability(
            boolean inStock) {

        return (root, query, criteriaBuilder) -> {

            if (inStock) {

                return criteriaBuilder.greaterThan(
                        root.get("inventory").get("quantity"),
                        0
                );

            }

            return criteriaBuilder.equal(
                    root.get("inventory").get("quantity"),
                    0
            );
        };
    }


}