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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {

        log.debug("Creating category with name: {}", request.getName());

        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {

            log.warn("Category already exists with name: {}", request.getName());

            throw new ResourceAlreadyExistsException(
                    "Category already exists with name : " + request.getName()
            );
        }

        Category category = categoryMapper.toEntity(request);

        Category savedCategory = categoryRepository.save(category);

        log.info("Category created successfully with id: {}", savedCategory.getId());

        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {

        log.debug("Fetching all categories");

        List<Category> categories = categoryRepository.findAll();

        log.info("Retrieved {} categories", categories.size());

        return categoryMapper.toResponseList(categories);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {

        log.debug("Fetching category with id: {}", id);

        Category category = findCategoryById(id);

        log.info("Category found with id: {}", id);

        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {

        log.debug("Updating category with id: {}", id);

        Category category = findCategoryById(id);

        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {

            log.warn("Cannot update category. Name already exists: {}", request.getName());

            throw new ResourceAlreadyExistsException(
                    "Category already exists with name : "
                            + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        log.info("Category updated successfully with id: {}", id);

        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {

        log.debug("Deleting category with id: {}", id);

        Category category = findCategoryById(id);

        categoryRepository.delete(category);

        log.info("Category deleted successfully with id: {}", id);
    }

    private Category findCategoryById(Long id) {

        log.debug("Searching category by id: {}", id);

        return categoryRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Category not found with id: {}", id);
                    return new ResourceNotFoundException(
                            "Category not found with id : " + id
                    );
                });
    }
}