package com.shopsphere.service.impl;

import com.shopsphere.dto.category.CategoryRequest;
import com.shopsphere.dto.category.CategoryResponse;
import com.shopsphere.entity.Category;
import com.shopsphere.exception.ResourceAlreadyExistsException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.CategoryMapper;
import com.shopsphere.repository.CategoryRepository;
import com.shopsphere.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Category already exists with name : " + request.getName()
            );

        }

        Category category = categoryMapper.toEntity(request);

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);

    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {

        List<Category> categories =
                categoryRepository.findAll();

        return categoryMapper.toResponseList(categories);

    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {

        Category category = findCategoryById(id);

        return categoryMapper.toResponse(category);

    }

    @Override
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request) {

        Category category = findCategoryById(id);

        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {

            throw new ResourceAlreadyExistsException(
                    "Category already exists with name : "
                            + request.getName());

        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        //already managed in persistence context so save() not needed
        return categoryMapper.toResponse(category);

    }

    @Override
    public void deleteCategory(Long id) {

        Category category = findCategoryById(id);

        categoryRepository.delete(category);

    }


    //helper method if we use it more than once

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with id : " + id
                        ));
    }

}