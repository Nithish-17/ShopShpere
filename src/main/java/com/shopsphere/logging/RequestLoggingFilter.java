package com.shopsphere.logging;

import com.shopsphere.security.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {

            filterChain.doFilter(request, response);

        } finally {

            long executionTime = System.currentTimeMillis() - startTime;

            log.info("""
                    
                    ======== HTTP REQUEST ========

                    Method      : {}
                    URI         : {}
                    Status      : {}
                    User        : {}
                    Client IP   : {}
                    Duration    : {} ms

                    ==============================
                    """,
                    request.getMethod(),
                    request.getRequestURI(),
                    response.getStatus(),
                    getCurrentUser(),
                    request.getRemoteAddr(),
                    executionTime
            );
        }
    }

    /**
     * Returns the username of the currently authenticated user.
     * If the user is not authenticated, returns "ANONYMOUS".
     */
    private String getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {
            return "ANONYMOUS";
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUsername();
        }

        return "ANONYMOUS";
    }
}