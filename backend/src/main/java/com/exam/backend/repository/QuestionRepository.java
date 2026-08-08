package com.exam.backend.repository;

import com.exam.backend.model.Question;
import com.exam.backend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExam(Exam exam);
    List<Question> findByExamId(Long examId);
}
