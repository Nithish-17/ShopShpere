package com.shopsphere.service.notification;

import jakarta.mail.MessagingException;

import java.util.Map;

public interface EmailService {

    void sendEmail(
            String to,
            String subject,
            String templateName,
            Map<String, Object> variables,
            byte[] attachment,
            String attachmentName
    ) throws MessagingException;
}
