package com.exam.backend.controller;

import com.exam.backend.model.User;
import com.exam.backend.service.ExamService;
import com.exam.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private ExamService examService;

    @GetMapping("/pending-examiners")
    public ResponseEntity<List<User>> getPendingExaminers() {
        return ResponseEntity.ok(userService.getPendingExaminers());
    }

    @PostMapping("/approve-examiner/{id}")
    public ResponseEntity<?> approveExaminer(@PathVariable Long id) {
        try {
            User approved = userService.approveExaminer(id);
            return ResponseEntity.ok(approved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new AuthController.ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        long candidates = userService.getCandidatesCount();
        long examiners = userService.getExaminersCount();
        long exams = examService.getExamsCount();
        long submissions = examService.getSubmissionsCount();

        return ResponseEntity.ok(Map.of(
                "candidates", candidates,
                "examiners", examiners,
                "exams", exams,
                "submissions", submissions
        ));
    }
}
