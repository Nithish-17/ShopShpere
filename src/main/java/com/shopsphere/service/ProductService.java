package com.shopsphere.service;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.dto.product.ProductSearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    Page<ProductResponse> getProducts(Pageable pageable);

    ProductResponse getProductById(Long id);

    Page<ProductResponse> searchProducts(ProductSearchRequest request, Pageable pageable);

    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

}