package com.shopsphere.validation;

import com.shopsphere.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class ProductImageValidator {

    private final long maxSize;

    private final Set<String> allowedTypes;

    public ProductImageValidator(
            @Value("${app.file.product-image.max-size}")
            long maxSize,

            @Value("${app.file.product-image.allowed-types}")
            String allowedTypes) {

        this.maxSize = maxSize;

        this.allowedTypes =
                Set.of(
                        allowedTypes
                                .split(",")
                );
    }

    public void validate(
            MultipartFile file) {

        validateFileExists(file);

        validateSize(file);

        validateContentType(file);
    }

    private void validateFileExists(
            MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new BusinessException(
                    "Product image must not be empty."
            );
        }
    }

    private void validateSize(
            MultipartFile file) {

        if (file.getSize() > maxSize) {

            throw new BusinessException(
                    "Product image size cannot exceed "
                            + maxSize / (1024 * 1024)
                            + " MB."
            );
        }
    }

    private void validateContentType(
            MultipartFile file) {

        String contentType =
                file.getContentType();

        if (contentType == null
                || !allowedTypes.contains(
                contentType.toLowerCase())) {

            throw new BusinessException(
                    "Only JPEG, PNG and WEBP images are allowed."
            );
        }
    }
}