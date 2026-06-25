package com.managemyopz.notification.service;

import java.util.Map;

public interface NotificationService {
    void sendEmail(String recipientEmail, String subject, String body);
    void sendEmailFromTemplate(String recipientEmail, String templateCode, Map<String, String> variables);
    void sendEmailFromTemplateWithRecipient(String recipientUserId, String recipientEmail, String templateCode, Map<String, String> variables);
}
