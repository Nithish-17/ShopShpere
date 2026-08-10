package com.shopsphere.service.impl;

import com.shopsphere.dto.product.ProductImageResponse;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.ProductImage;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ProductImageMapper;
import com.shopsphere.repository.ProductImageRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.ProductImageService;
import com.shopsphere.storage.FileStorageService;
import com.shopsphere.validation.ProductImageValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductImageServiceImpl
        implements ProductImageService {

    private static final String IMAGE_DIRECTORY = "";

    private final ProductRepository productRepository;

    private final ProductImageRepository productImageRepository;

    private final FileStorageService fileStorageService;

    private final ProductImageValidator productImageValidator;

    private final ProductImageMapper productImageMapper;

    @Value("${app.file.storage.product-images}")
    private String storageDirectory;

    @Override
    @Transactional
    public ProductImageResponse uploadImage(Long productId, MultipartFile file) {

        log.info(
                "Uploading image for product: {}",
                productId
        );

        // 1. Find product
        Product product =
                productRepository
                        .findByIdAndActiveTrue(productId)
                        .orElseThrow(() -> {

                            log.error(
                                    "Product not found: {}",
                                    productId
                            );

                            return new ResourceNotFoundException(
                                    "Product not found with id: "
                                            + productId
                            );
                        });

        // 2. Validate image
        productImageValidator.validate(file);

        // 3. Store physical file
        String storedFileName =
                fileStorageService.store(
                        file,
                        IMAGE_DIRECTORY
                );


        String filePath =
                storageDirectory
                        + "/"
                        + storedFileName;


        try {

            ProductImage productImage =
                    new ProductImage();

            productImage.setProduct(product);

            productImage.setFileName(
                    storedFileName
            );

            productImage.setOriginalFileName(
                    file.getOriginalFilename()
            );

            productImage.setContentType(
                    file.getContentType()
            );

            productImage.setFileSize(
                    file.getSize()
            );

            productImage.setFilePath(filePath);

            // 5. Save database record
            ProductImage savedImage =
                    productImageRepository.save(
                            productImage
                    );

            log.info(
                    "Product image uploaded successfully. " +
                            "ProductId: {}, ImageId: {}",
                    productId,
                    savedImage.getId()
            );

            // 6. Return response
            return productImageMapper.toResponse(
                    savedImage
            );
        }

        catch (RuntimeException e) {
            log.error(
                    "Failed to save product image for productId: {}",
                    productId,
                    e
            );

            fileStorageService.delete(
                    storedFileName,
                    IMAGE_DIRECTORY
            );

            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImages(
            Long productId) {

        productRepository
                .findByIdAndActiveTrue(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + productId
                        ));

        return productImageRepository
                .findByProductId(productId)
                .stream()
                .map(productImageMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Resource getImage(
            Long productId,
            Long imageId) {

        ProductImage image =
                productImageRepository
                        .findByIdAndProductId(
                                imageId,
                                productId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product image not found."
                                ));

        return fileStorageService.load(
                image.getFileName(),
                IMAGE_DIRECTORY
        );
    }

    @Override
    @Transactional
    public void deleteImage(
            Long productId,
            Long imageId) {

        ProductImage image =
                productImageRepository
                        .findById(imageId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product image not found."
                                ));

        if (!image.getProduct()
                .getId()
                .equals(productId)) {

            throw new ResourceNotFoundException(
                    "Product image does not belong to this product."
            );
        }

        String fileName =
                image.getFileName();

        productImageRepository.delete(image);

        try {

            fileStorageService.delete(
                    fileName,
                    IMAGE_DIRECTORY
            );

        } catch (RuntimeException ex) {

            log.error(
                    "Database record deleted but physical " +
                            "file could not be deleted: {}",
                    fileName,
                    ex
            );

            throw ex;
        }
    }

}