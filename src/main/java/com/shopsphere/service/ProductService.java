package com.shopsphere.service;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    Page<ProductResponse> getProducts(Pageable pageable);

    ProductResponse getProductById(Long id);

    Page<ProductResponse> searchProducts(String keyword,Pageable pageable);

    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

}