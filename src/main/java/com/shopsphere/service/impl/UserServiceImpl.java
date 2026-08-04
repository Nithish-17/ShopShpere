package com.shopsphere.service.impl;

import com.shopsphere.dto.user.UserRegistrationRequest;
import com.shopsphere.dto.user.UserResponse;
import com.shopsphere.dto.user.UserUpdateRequest;
import com.shopsphere.entity.Role;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BusinessException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.mapper.UserMapper;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.ShoppingCartService;
import com.shopsphere.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ShoppingCartService shoppingCartService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered.");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone number already registered.");
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = findUser(userId);
        if (!user.getActive()) throw new BusinessException("User account is inactive.");
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = findUser(userId);
        if (!user.getActive()) throw new BusinessException("User account is inactive.");
        if (!user.getPhone().equals(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
            throw new BusinessException("Phone number already registered.");
        }
        userMapper.updateUser(request, user);
        return userMapper.toResponse(user);
    }

    @Override
    public void deactivateUser(Long userId) {
        User user = findUser(userId);
        if (!user.getActive()) throw new BusinessException("User account is already inactive.");
        shoppingCartService.clearCart();
        user.setActive(false);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + userId));
    }
}
