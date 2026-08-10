package com.shopsphere.service.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Retryable(
            retryFor = MailException.class,
            maxAttempts = 3,
            backoff = @Backoff(
                    delay = 2000,
                    multiplier = 2
            )
    )
    public void sendEmail(
            String to,
            String subject,
            String templateName,
            Map<String,Object> variables,
            byte[] attachment,
            String attachmentName
    ) throws MessagingException {

        log.info(
                "Sending email to {}",
                to
        );

        Context context = new Context();

        context.setVariables(variables);

        String html =
                templateEngine.process(
                        templateName,
                        context
                );

        MimeMessage message =
                mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(
                        message,
                        true,
                        StandardCharsets.UTF_8.name()
                );

        helper.setFrom(fromEmail);

        helper.setTo(fromEmail);

        helper.setSubject(subject);

        helper.setText(html, true);

        if (attachment != null) {

            helper.addAttachment(
                    attachmentName,
                    new ByteArrayResource(
                            attachment
                    )
            );

        }

        mailSender.send(message);

        log.info(
                "Email successfully sent to {}",
                to
        );

    }

    @Recover
    public void recover(
            MailException ex,
            String to,
            String subject,
            String templateName,
            Map<String,Object> variables,
            byte[] attachment,
            String attachmentName
    ) {

        log.error(
                "Unable to send email to {} after retries.",
                to,
                ex
        );

    }

}