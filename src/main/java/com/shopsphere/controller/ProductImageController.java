package com.shopsphere.controller;

import com.shopsphere.dto.product.ProductImageResponse;
import com.shopsphere.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequestMapping("/api/products/{productId}/images")
@RequiredArgsConstructor
public class ProductImageController {

    private final ProductImageService productImageService;

    @PostMapping
    public ProductImageResponse uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file) {

        return productImageService.uploadImage(
                productId,
                file
        );
    }

    @GetMapping
    public ResponseEntity<List<ProductImageResponse>> getImages(
            @PathVariable Long productId) {

        List<ProductImageResponse> images =
                productImageService.getImages(
                        productId
                );

        return ResponseEntity.ok(images);
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<Resource> getImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {

        return ResponseEntity.ok(productImageService.getImage(productId,imageId));

    }

    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable Long productId,
            @PathVariable Long imageId) {

        productImageService.deleteImage(
                productId,
                imageId
        );
    }
}