package com.shopsphere.mapper;

import com.shopsphere.dto.category.CategoryRequest;
import com.shopsphere.dto.category.CategoryResponse;
import com.shopsphere.entity.Category;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    Category toEntity(CategoryRequest request);

    CategoryResponse toResponse(Category category);

    List<CategoryResponse> toResponseList(List<Category> categories);

}