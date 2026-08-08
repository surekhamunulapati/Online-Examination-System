package com.exam.backend.repository;

import com.exam.backend.model.Notification;
import com.exam.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCandidateOrderByCreatedAtDesc(User candidate);
    List<Notification> findByCandidateIdOrderByCreatedAtDesc(Long candidateId);
}
