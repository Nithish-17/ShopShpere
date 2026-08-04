package com.shopsphere.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(
        auditorAwareRef = "auditorAware"
)
@RequiredArgsConstructor
public class JpaAuditingConfig {
}
