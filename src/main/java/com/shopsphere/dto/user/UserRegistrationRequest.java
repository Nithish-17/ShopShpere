package com.shopsphere.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegistrationRequest {
    @NotBlank @Size(max = 50) private String firstName;
    @NotBlank @Size(max = 50) private String lastName;
    @NotBlank @Email @Size(max = 100) private String email;
    @NotBlank @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits.") private String phone;
    @NotBlank @Size(min = 8, max = 100) private String password;
}
