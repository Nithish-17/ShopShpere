package com.shopsphere.service.impl;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceAlreadyExistsException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ProductMapper;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    public ProductResponse createProduct(ProductRequest request) {

        if (productRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ResourceAlreadyExistsException(
                    "Product already exists with name: " + request.getName()
            );
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()
                ));

        Product product = productMapper.toEntity(request);

        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        return productMapper.toResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(Pageable pageable) {

        Page<Product> products =
                productRepository.findAll(pageable);

        return products.map(productMapper::toResponse);

    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        Product product = findProductById(id);

        return productMapper.toResponse(product);

    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {

        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("Search keyword must not be empty");
        }

        keyword = keyword.trim();

        return productRepository
                .findByActiveTrueAndNameContainingIgnoreCase(keyword, pageable)
                .map(productMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProductsByCategory(
            Long categoryId,
            Pageable pageable) {

        // Validate category exists
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId
                ));

        Page<Product> products =
                productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);

        return products.map(productMapper::toResponse);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id,
                                         ProductRequest request) {

        Product product = findProductById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()
                ));

        productMapper.updateProductFromRequest(request, product);

        product.setCategory(category);

        return productMapper.toResponse(product);

    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {

        Product product = findProductById(id);

        product.setActive(false);

    }






    //helper method------------------------------------------
    private Product findProductById(Long id) {

        return productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id
                        ));
    }
}