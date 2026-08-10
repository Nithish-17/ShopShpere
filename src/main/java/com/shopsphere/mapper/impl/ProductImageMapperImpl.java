package com.shopsphere.mapper.impl;

import com.shopsphere.dto.product.ProductImageResponse;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.mapper.ProductImageMapper;
import org.springframework.stereotype.Component;

@Component
public class ProductImageMapperImpl
        implements ProductImageMapper {

    @Override
    public ProductImageResponse toResponse(
            ProductImage image) {

        return ProductImageResponse.builder()

                .id(image.getId())

                .fileName(
                        image.getFileName()
                )

                .originalFileName(
                        image.getOriginalFileName()
                )

                .contentType(
                        image.getContentType()
                )

                .fileSize(
                        image.getFileSize()
                )

                .url(
                        "/api/products/"
                                + image.getProduct().getId()
                                + "/images/"
                                + image.getId()
                )

                .build();
    }
}