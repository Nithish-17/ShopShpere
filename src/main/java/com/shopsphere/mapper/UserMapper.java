package com.shopsphere.mapper;

import com.shopsphere.dto.user.UserRegistrationRequest;
import com.shopsphere.dto.user.UserResponse;
import com.shopsphere.dto.user.UserUpdateRequest;
import com.shopsphere.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    User toEntity(
            UserRegistrationRequest request
    );

    UserResponse toResponse(
            User user
    );

    void updateUser(

            UserUpdateRequest request,

            @MappingTarget
            User user

    );

}
