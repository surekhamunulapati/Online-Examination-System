package com.exam.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger LOGGER = Logger.getLogger(EmailService.class.getName());

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        LOGGER.info("Sending Email to: " + to);
        LOGGER.info("Subject: " + subject);
        LOGGER.info("Body:\n" + body);

        if (mailSender == null) {
            LOGGER.warning("JavaMailSender is not initialized. Email printed to console instead.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("online-exam-system@noreply.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            LOGGER.info("Email sent successfully!");
        } catch (Exception e) {
            LOGGER.severe("Failed to send email via SMTP: " + e.getMessage() + ". Logged to console instead.");
        }
    }

    public void sendNewExamNotification(String recipientEmail, String candidateName, String examTitle, String companyName, String startTime, String duration) {
        String subject = "New Exam Available: " + examTitle + " by " + companyName;
        String body = "Dear " + candidateName + ",\n\n" +
                "A new exam has been scheduled by " + companyName + ".\n\n" +
                "Exam Details:\n" +
                "- Title: " + examTitle + "\n" +
                "- Scheduled Start Time: " + startTime + "\n" +
                "- Duration: " + duration + " minutes\n\n" +
                "Log in to your Candidate Dashboard to apply and take the exam.\n\n" +
                "Best regards,\n" +
                "Online Examination System";
        sendEmail(recipientEmail, subject, body);
    }

    public void sendExamResult(String recipientEmail, String candidateName, String examTitle, int score, int totalMarks, String status) {
        String subject = "Exam Result: " + examTitle;
        String resultStatus = "SHORTLISTED".equalsIgnoreCase(status) ? "Shortlisted!" : "Not Shortlisted";
        String body = "Dear " + candidateName + ",\n\n" +
                "Your result for the exam '" + examTitle + "' is now available.\n\n" +
                "Result Details:\n" +
                "- Marks Obtained: " + score + " / " + totalMarks + "\n" +
                "- Status: " + resultStatus + "\n\n" +
                "Thank you for participating.\n\n" +
                "Best regards,\n" +
                "Online Examination System";
        sendEmail(recipientEmail, subject, body);
    }
}
