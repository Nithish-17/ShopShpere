package com.shopsphere.service;

import com.shopsphere.dto.product.ProductImageResponse;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {

    ProductImageResponse uploadImage(
            Long productId,
            MultipartFile file
    );

    List<ProductImageResponse> getImages(
            Long productId
    );

    Resource getImage(
            Long productId,
            Long imageId
    );

    void deleteImage(
            Long productId,
            Long imageId
    );


}