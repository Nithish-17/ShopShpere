package com.shopsphere.mapper;

import com.shopsphere.dto.product.ProductImageResponse;
import com.shopsphere.entity.ProductImage;

public interface ProductImageMapper {

    ProductImageResponse toResponse(
            ProductImage productImage
    );
}
