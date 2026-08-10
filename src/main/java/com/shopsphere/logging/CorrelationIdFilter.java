package com.shopsphere.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String requestId =
                UUID.randomUUID().toString();

        MDC.put("requestId", requestId);

        /*
        * MDC (Mapped Diagnostic Context) is a thread-local key-value store provided by SLF4J/Logback that holds contextual information for the currently executing thread.
        * Not only on loggin we can use it anywhere in our program*/

        try {

            filterChain.doFilter(request, response);

        } finally {

            MDC.clear();

        }

    }

}
