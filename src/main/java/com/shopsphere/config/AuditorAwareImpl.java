package com.shopsphere.config;

import com.shopsphere.service.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAware")
@RequiredArgsConstructor
public class AuditorAwareImpl implements AuditorAware<String> {

    private final CurrentUserService currentUserService;


    @Override
    public Optional<String> getCurrentAuditor() {

        try{

            return Optional.of(
                    currentUserService
                            .getCurrentUser()
                            .getEmail()
            );
        }

        catch (Exception e){
            return Optional.of("SYSTEM");
        }
    }
}
