package com.shopsphere.controller;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(
            @Valid
            @RequestBody ProductRequest request) {

        return productService.createProduct(request);

    }

    @GetMapping
    public Page<ProductResponse> getProducts(

            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "name"
            )
            Pageable pageable) {

        return productService.getProducts(pageable);

    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id);

    }

    @GetMapping("/search")
    public Page<ProductResponse> searchProducts(
            @RequestParam String keyword,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "name"
            )
            Pageable pageable) {

        return productService.searchProducts(keyword,pageable);

    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return productService.updateProduct(id, request);

    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

    }

}
