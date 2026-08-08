package com.exam.backend.repository;

import com.exam.backend.model.CandidateAnswer;
import com.exam.backend.model.ExamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CandidateAnswerRepository extends JpaRepository<CandidateAnswer, Long> {
    List<CandidateAnswer> findByRegistration(ExamRegistration registration);
    List<CandidateAnswer> findByRegistrationId(Long registrationId);
}
