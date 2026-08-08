package com.exam.backend.controller;

import com.exam.backend.model.*;
import com.exam.backend.service.ExamService;
import com.exam.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/examiner")
@CrossOrigin(origins = "http://localhost:5173")
public class ExaminerController {

    @Autowired
    private ExamService examService;

    @Autowired
    private UserService userService;

    @PostMapping("/exams")
    public ResponseEntity<?> createExam(@RequestBody CreateExamRequest request) {
        try {
            // Find examiner
            User examiner = new User();
            examiner.setId(request.examinerId());

            Exam exam = new Exam();
            exam.setTitle(request.title());
            exam.setDescription(request.description());
            exam.setStartTime(LocalDateTime.parse(request.startTime()));
            exam.setEndTime(LocalDateTime.parse(request.endTime()));
            exam.setDurationMinutes(request.durationMinutes());
            exam.setTotalMarks(request.totalMarks());
            exam.setExaminer(examiner);

            List<Question> questions = new ArrayList<>();
            for (QuestionRequest qr : request.questions()) {
                Question q = new Question();
                q.setQuestionText(qr.questionText());
                q.setOptionA(qr.optionA());
                q.setOptionB(qr.optionB());
                q.setOptionC(qr.optionC());
                q.setOptionD(qr.optionD());
                q.setCorrectOption(qr.correctOption());
                q.setMarks(qr.marks());
                questions.add(q);
            }

            Exam created = examService.createExam(exam, questions);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/exams")
    public ResponseEntity<?> getExams(@RequestParam Long examinerId) {
        try {
            List<Exam> exams = examService.getExamsByExaminer(examinerId);
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/exams/{examId}/responses")
    public ResponseEntity<?> getExamResponses(@PathVariable Long examId) {
        try {
            List<ExamRegistration> responses = examService.getRegistrationsForExam(examId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/responses/{registrationId}/shortlist")
    public ResponseEntity<?> shortlistCandidate(
            @PathVariable Long registrationId,
            @RequestBody Map<String, String> statusBody) {
        try {
            String status = statusBody.get("status");
            ExamRegistration updated = examService.updateShortlistStatus(registrationId, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/responses/{registrationId}/send-result")
    public ResponseEntity<?> sendResult(@PathVariable Long registrationId) {
        try {
            examService.sendResultMail(registrationId);
            return ResponseEntity.ok(Map.of("message", "Result email sent successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    public record CreateExamRequest(
            String title,
            String description,
            String startTime,
            String endTime,
            Integer durationMinutes,
            Integer totalMarks,
            Long examinerId,
            List<QuestionRequest> questions
    ) {}

    public record QuestionRequest(
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            String correctOption,
            Integer marks
    ) {}
}
