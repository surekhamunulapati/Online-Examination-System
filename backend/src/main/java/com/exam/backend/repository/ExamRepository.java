package com.exam.backend.repository;

import com.exam.backend.model.Exam;
import com.exam.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByExaminer(User examiner);
}
