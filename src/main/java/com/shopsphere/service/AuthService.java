package com.shopsphere.service;

import com.shopsphere.dto.login.LoginRequest;
import com.shopsphere.dto.login.LoginResponse;
import com.shopsphere.dto.user.UserRegistrationRequest;
import com.shopsphere.dto.user.UserResponse;

public interface AuthService {

    UserResponse register(UserRegistrationRequest request);

    LoginResponse login(LoginRequest request);

}