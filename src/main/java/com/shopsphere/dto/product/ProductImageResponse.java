package com.shopsphere.dto.product;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductImageResponse {

    private Long id;

    private String fileName;

    private String originalFileName;

    private String contentType;

    private Long fileSize;

    private String url;
}