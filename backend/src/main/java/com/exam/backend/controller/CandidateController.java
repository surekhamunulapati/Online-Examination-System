package com.exam.backend.controller;

import com.exam.backend.model.*;
import com.exam.backend.service.ExamService;
import com.exam.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidate")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    @Autowired
    private ExamService examService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/available-exams")
    public ResponseEntity<?> getAvailableExams(@RequestParam Long candidateId) {
        try {
            // Find all exams
            List<Exam> allExams = examService.getAllExams();
            // Find exams candidate already registered for
            List<Long> registeredExamIds = examService.getRegistrationsForCandidate(candidateId)
                    .stream()
                    .map(reg -> reg.getExam().getId())
                    .collect(Collectors.toList());

            // Filter out exams already registered
            List<Exam> availableExams = allExams.stream()
                    .filter(exam -> !registeredExamIds.contains(exam.getId()))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(availableExams);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/exams/{examId}/apply")
    public ResponseEntity<?> applyForExam(@PathVariable Long examId, @RequestBody Map<String, Long> body) {
        try {
            Long candidateId = body.get("candidateId");
            ExamRegistration registration = examService.registerCandidate(candidateId, examId);
            return ResponseEntity.ok(registration);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/my-exams")
    public ResponseEntity<?> getMyExams(@RequestParam Long candidateId) {
        try {
            List<ExamRegistration> registered = examService.getRegistrationsForCandidate(candidateId);
            return ResponseEntity.ok(registered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/exams/{examId}/questions")
    public ResponseEntity<?> getQuestionsForTaking(@PathVariable Long examId) {
        try {
            List<Question> questions = examService.getQuestionsForExam(examId);

            // Map to response to prevent sending correctOption to client to avoid inspection cheats
            List<CandidateQuestionResponse> response = questions.stream()
                    .map(q -> new CandidateQuestionResponse(
                            q.getId(),
                            q.getQuestionText(),
                            q.getOptionA(),
                            q.getOptionB(),
                            q.getOptionC(),
                            q.getOptionD(),
                            q.getMarks()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/exams/{examId}/submit")
    public ResponseEntity<?> submitExam(
            @PathVariable Long examId,
            @RequestBody SubmitExamRequest request) {
        try {
            ExamRegistration submission = examService.submitExam(
                    request.candidateId(),
                    examId,
                    request.answers()
            );
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@RequestParam Long candidateId) {
        try {
            List<Notification> notifications = notificationService.getNotificationsForCandidate(candidateId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable Long id) {
        try {
            Notification readNotification = notificationService.markAsRead(id);
            return ResponseEntity.ok(readNotification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    public record CandidateQuestionResponse(
            Long id,
            String questionText,
            String optionA,
            String optionB,
            String optionC,
            String optionD,
            Integer marks
    ) {}

    public record SubmitExamRequest(
            Long candidateId,
            Map<Long, String> answers
    ) {}
}
