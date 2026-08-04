package com.shopsphere.service.impl;

import com.shopsphere.dto.login.LoginRequest;
import com.shopsphere.dto.login.LoginResponse;
import com.shopsphere.dto.user.UserRegistrationRequest;
import com.shopsphere.dto.user.UserResponse;
import com.shopsphere.security.CustomUserDetails;
import com.shopsphere.security.jwt.JwtService;
import com.shopsphere.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;

    private final JwtService  jwtService;


    @Override
    public UserResponse register(UserRegistrationRequest request) {
        return null;
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        Authentication authentication = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());

        authentication = authenticationManager.authenticate(authentication);

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(customUserDetails);

        return new LoginResponse(token);

    }
}
