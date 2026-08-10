package com.shopsphere.util.initializer;

import com.shopsphere.entity.Role;
import com.shopsphere.entity.User;
import com.shopsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;



    @Override
    public void run(String... args) throws Exception {

        if(userRepository.existsByEmail("admin@shopsphere.com")){
            return;
        }

        User admin = new User();

        admin.setFirstName("System");
        admin.setLastName("Administrator");
        admin.setEmail("admin@shopsphere.com");
        admin.setPhone("9999999999");

        admin.setPassword(
                passwordEncoder.encode("admin123")
        );

        admin.setRole(Role.ROLE_ADMIN);

        admin.setActive(true);

        userRepository.save(admin);


    }
}
