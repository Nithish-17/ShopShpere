package com.shopsphere.mapper;

import com.shopsphere.dto.product.ProductRequest;
import com.shopsphere.dto.product.ProductResponse;
import com.shopsphere.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateProductFromRequest(ProductRequest request,
                                  @MappingTarget Product product);
    // MappingTarget tells don't create new object use this

}