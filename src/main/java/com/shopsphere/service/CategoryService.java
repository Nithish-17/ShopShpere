package com.shopsphere.service;

import com.shopsphere.dto.category.CategoryRequest;
import com.shopsphere.dto.category.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse updateCategory(Long id,
                                    CategoryRequest request);

    void deleteCategory(Long id);
}