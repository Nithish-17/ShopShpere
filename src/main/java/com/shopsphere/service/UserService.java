package com.shopsphere.service;

import com.shopsphere.dto.user.UserRegistrationRequest;
import com.shopsphere.dto.user.UserResponse;
import com.shopsphere.dto.user.UserUpdateRequest;

public interface UserService {

    UserResponse registerUser(
            UserRegistrationRequest request
    );

    UserResponse getUserById(
            Long userId
    );

    UserResponse updateUser(
            Long userId,
            UserUpdateRequest request
    );

    void deactivateUser(
            Long userId
    );

}
