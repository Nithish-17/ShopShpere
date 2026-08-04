package com.shopsphere.service.security;

import com.shopsphere.entity.User;

public interface CurrentUserService {

    User getCurrentUser();

    Long getCurrentUserId();
}
