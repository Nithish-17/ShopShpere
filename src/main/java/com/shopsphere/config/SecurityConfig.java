package com.shopsphere.config;

import com.shopsphere.entity.User;
import com.shopsphere.exception.security.JwtAccessDeniedHandler;
import com.shopsphere.exception.security.JwtAuthenticationEntryPoint;
import com.shopsphere.logging.CorrelationIdFilter;
import com.shopsphere.logging.RequestLoggingFilter;
import com.shopsphere.security.CustomUserDetailsService;
import com.shopsphere.security.jwt.JwtAuthenticationFilter;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.bind.annotation.RequestMapping;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    private final JwtAccessDeniedHandler  jwtAccessDeniedHandler;

    private final RequestLoggingFilter  requestLoggingFilter;

    private final CorrelationIdFilter correlationIdFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationEntryPoint authenticationEntryPoint) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth ->auth
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers("/api/auth/**")
                        .permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories/**"
                        )
                        .permitAll()
                        .requestMatchers(
                                        "/swagger-ui/**",
                                        "/v3/api-docs/**"
                                ).permitAll()
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(requestLoggingFilter, JwtAuthenticationFilter.class);
        return http.build();




    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());

        return provider;

    }
}
