package com.exam.backend.service;

import com.exam.backend.model.Notification;
import com.exam.backend.model.User;
import com.exam.backend.repository.NotificationRepository;
import com.exam.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public Notification createNotification(User candidate, String title, String message, Long examId) {
        Notification notification = new Notification();
        notification.setCandidate(candidate);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setExamId(examId);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void notifyAllCandidatesOfNewExam(String examTitle, String companyName, Long examId) {
        List<User> candidates = userRepository.findByRole("CANDIDATE");
        String title = "New Exam: " + examTitle;
        String message = "Company " + companyName + " has scheduled a new exam: '" + examTitle + "'. Apply now!";
        
        for (User candidate : candidates) {
            createNotification(candidate, title, message, examId);
        }
    }

    public List<Notification> getNotificationsForCandidate(Long candidateId) {
        return notificationRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found!"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
}
