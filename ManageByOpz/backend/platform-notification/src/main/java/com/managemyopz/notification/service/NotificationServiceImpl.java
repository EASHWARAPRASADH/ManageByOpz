package com.managemyopz.notification.service;

import com.managemyopz.notification.entity.Notification;
import com.managemyopz.notification.entity.NotificationTemplate;
import com.managemyopz.notification.repository.NotificationRepository;
import com.managemyopz.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationTemplateRepository templateRepository;
    private final Optional<JavaMailSender> mailSender; // Autowire optionally to handle non-mail profiles gracefully

    @Override
    @Transactional
    public void sendEmail(String recipientEmail, String subject, String body) {
        log.info("Sending email to {}. Subject: {}", recipientEmail, subject);
        log.debug("Email Body:\n{}", body);

        Notification notification = Notification.builder()
                .recipientEmail(recipientEmail)
                .channel(Notification.NotificationChannel.EMAIL)
                .subject(subject)
                .body(body)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        notification.setTenantId("ACME"); // Default tenant fallback for background triggers

        try {
            if (mailSender.isPresent() && mailSender.get() != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipientEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.get().send(message);
                
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(Instant.now());
                log.info("Email sent successfully to {}", recipientEmail);
            } else {
                log.warn("JavaMailSender not available. Simulated email sending to: {}", recipientEmail);
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(Instant.now());
            }
        } catch (Exception e) {
            log.error("Failed to send email to {}", recipientEmail, e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void sendEmailFromTemplate(String recipientEmail, String templateCode, Map<String, String> variables) {
        sendEmailFromTemplateWithRecipient(null, recipientEmail, templateCode, variables);
    }

    @Override
    @Transactional
    public void sendEmailFromTemplateWithRecipient(String recipientUserId, String recipientEmail, String templateCode, Map<String, String> variables) {
        Optional<NotificationTemplate> templateOpt = templateRepository.findByCode(templateCode);
        String subject = "Notification";
        String body = "";

        if (templateOpt.isPresent()) {
            NotificationTemplate template = templateOpt.get();
            subject = template.getSubjectTemplate();
            body = template.getBodyTemplate();

            // Interpolate variables
            for (Map.Entry<String, String> entry : variables.entrySet()) {
                String key = "{{" + entry.getKey() + "}}";
                String val = entry.getValue() != null ? entry.getValue() : "";
                subject = subject.replace(key, val);
                body = body.replace(key, val);
            }
        } else {
            log.warn("Notification template not found for code: {}. Using fallback generic mail.", templateCode);
            body = "Notification: " + templateCode + ". Variables: " + variables.toString();
        }

        Notification notification = Notification.builder()
                .recipientUserId(recipientUserId)
                .recipientEmail(recipientEmail)
                .channel(Notification.NotificationChannel.EMAIL)
                .templateCode(templateCode)
                .subject(subject)
                .body(body)
                .status(Notification.NotificationStatus.PENDING)
                .build();

        notification.setTenantId("ACME");

        try {
            if (mailSender.isPresent() && mailSender.get() != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipientEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.get().send(message);

                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(Instant.now());
                log.info("Templated email [{}] sent successfully to {}", templateCode, recipientEmail);
            } else {
                log.warn("JavaMailSender not available. Simulated templated email [{}] to: {}", templateCode, recipientEmail);
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(Instant.now());
            }
        } catch (Exception e) {
            log.error("Failed to send templated email [{}] to {}", templateCode, recipientEmail, e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
        }

        notificationRepository.save(notification);
    }
}
