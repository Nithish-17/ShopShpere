package com.shopsphere.controller;

import com.shopsphere.dto.category.CategoryRequest;
import com.shopsphere.dto.category.CategoryResponse;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(
            @Valid @RequestBody CategoryRequest request) {

        return categoryService.createCategory(request);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<CategoryResponse> getAllCategories() {

        return categoryService.getAllCategories(); // it will return all very risky for millions of records do pagination after

    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoryResponse getCategoryById(

            @PathVariable Long id) {

        return categoryService.getCategoryById(id);

    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {

        return categoryService.updateCategory(id, request);

    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {

        categoryService.deleteCategory(id);

    }

    @GetMapping("/{categoryId}/products")
    public Page<ProductResponse> getProductsByCategory(
            @PathVariable Long categoryId,
             @PageableDefault(
                     page = 0,
                     size = 10,
                     sort = "name"
             )
             Pageable pageable) {

        return productService.getProductsByCategory(categoryId,pageable);

    }

}