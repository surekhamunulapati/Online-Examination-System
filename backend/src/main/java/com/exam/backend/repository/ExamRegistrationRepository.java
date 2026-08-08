package com.exam.backend.repository;

import com.exam.backend.model.ExamRegistration;
import com.exam.backend.model.Exam;
import com.exam.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {
    List<ExamRegistration> findByCandidate(User candidate);
    List<ExamRegistration> findByExam(Exam exam);
    List<ExamRegistration> findByExamId(Long examId);
    Optional<ExamRegistration> findByCandidateAndExam(User candidate, Exam exam);
    Optional<ExamRegistration> findByCandidateIdAndExamId(Long candidateId, Long examId);
    boolean existsByCandidateAndExam(User candidate, Exam exam);
}
