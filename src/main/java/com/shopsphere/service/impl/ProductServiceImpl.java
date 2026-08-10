package com.shopsphere.service.impl;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.dto.product.ProductSearchRequest;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.ResourceAlreadyExistsException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.ProductMapper;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.service.ProductService;
import com.shopsphere.specification.ProductSpecification;
import com.shopsphere.specification.ProductSpecificationBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final ProductSpecificationBuilder productSpecificationBuilder;

    @Override
    public ProductResponse createProduct(ProductRequest request) {

        log.info(
                "creating product with name: {}",
                request.getName()
        );

        if (productRepository.existsByNameIgnoreCase(request.getName())) {
            log.error(
                    "Product already exists with name : {}",
                    request.getName()
            );
            throw new ResourceAlreadyExistsException(
                    "Product already exists with name: " + request.getName()
            );
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->{
                        log.error("Category not found : {}", request.getCategoryId());
                        return new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()
                );
                });

        Product product = productMapper.toEntity(request);

        product.setCategory(category);

        Product savedProduct = productRepository.save(product);

        log.info(
                "product created successfully with id : {}",
                savedProduct.getId()
        );

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
    public Page<ProductResponse> searchProducts(
            ProductSearchRequest request,
            Pageable pageable) {

        Specification<Product> specification =
                productSpecificationBuilder.build(request);

        return productRepository
                .findAll(specification, pageable)
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

        log.info(
                "Updating product with ID: {}",
                id
        );

        Product product = findProductById(id);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.error("Category not found with id: {}", request.getCategoryId());
                    return new ResourceNotFoundException(
                            "Category not found with id: " + request.getCategoryId()
                    );
                });

        productMapper.updateProductFromRequest(request, product);

        product.setCategory(category);

        log.info(
                "Product {} updated successfully.",
                id
        );

        return productMapper.toResponse(product);

    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {

        log.info(
                "Deleting product with ID: {}",
                id
        );

        Product product = findProductById(id);

        product.setActive(false);

        log.info(
                "Product {} deleted successfully.",
                id
        );

    }






    //helper method------------------------------------------
    private Product findProductById(Long id) {

        return productRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> {
                    log.error("Product not found with id: {}", id);
                    return new ResourceNotFoundException(
                            "Product not found with id: " + id
                    );
                });
    }
}