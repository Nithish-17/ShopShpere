package com.shopsphere.controller;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.dto.product.ProductSearchRequest;
import com.shopsphere.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor

@Tag(
        name = "Product APIs",
        description = "Operations for managing products"
)
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "create product",
            description = "creates a new product"
    )
    @ApiResponses({

            @ApiResponse(
                    responseCode = "201",
                    description = "Product Created Successfully"
            ),

            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid Request"
            ),

            @ApiResponse(
                    responseCode = "404",
                    description = "Category Not Found"
            )

    })
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
            @Parameter(
                    description = "Unique Product ID",
                    example = "101"
            )
            @PathVariable Long id) {

        return productService.getProductById(id);

    }

    @GetMapping("/search")
    public Page<ProductResponse> getProducts(
            @ModelAttribute ProductSearchRequest searchRequest,
            @PageableDefault(
                    page = 0,
                    size = 10,
                    sort = "name"
            )
            Pageable pageable) {

        return productService.searchProducts(searchRequest,pageable);

    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return productService.updateProduct(id, request);

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {

        productService.deleteProduct(id);

    }

}
