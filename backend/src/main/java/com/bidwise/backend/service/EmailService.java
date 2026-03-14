package com.bidwise.backend.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
