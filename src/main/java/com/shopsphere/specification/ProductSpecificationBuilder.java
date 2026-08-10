package com.shopsphere.specification;

import com.shopsphere.dto.product.ProductSearchRequest;
import com.shopsphere.entity.Product;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class ProductSpecificationBuilder {

    public Specification<Product> build(
            ProductSearchRequest request) {

        Specification<Product> specification =
                ProductSpecification.active();

        if (request.getKeyword() != null
                && !request.getKeyword().isBlank()) {

            specification =
                    specification.and(
                            ProductSpecification.keyword(
                                    request.getKeyword()
                            )
                    );
        }

        if (request.getCategoryId() != null) {

            specification =
                    specification.and(
                            ProductSpecification.category(
                                    request.getCategoryId()
                            )
                    );
        }

        if (request.getBrand() != null
                && !request.getBrand().isBlank()) {

            specification =
                    specification.and(
                            ProductSpecification.brand(
                                    request.getBrand()
                            )
                    );
        }

        if (request.getMinPrice() != null) {

            specification =
                    specification.and(
                            ProductSpecification
                                    .priceGreaterThanOrEqualTo(
                                            request.getMinPrice()
                                    )
                    );
        }

        if (request.getMaxPrice() != null) {

            specification =
                    specification.and(
                            ProductSpecification
                                    .priceLessThanOrEqualTo(
                                            request.getMaxPrice()
                                    )
                    );
        }

        if (request.getInStock() != null) {

            specification =
                    specification.and(
                            ProductSpecification
                                    .stockAvailability(
                                            request.getInStock()
                                    )
                    );
        }

        return specification;
    }
}