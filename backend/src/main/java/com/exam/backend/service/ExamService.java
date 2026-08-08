package com.exam.backend.service;

import com.exam.backend.model.*;
import com.exam.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRegistrationRepository registrationRepository;

    @Autowired
    private CandidateAnswerRepository candidateAnswerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Exam createExam(Exam exam, List<Question> questions) {
        // Save the exam
        Exam savedExam = examRepository.save(exam);

        // Save questions
        for (Question question : questions) {
            question.setExam(savedExam);
            questionRepository.save(question);
        }

        // Notify all candidates about the new exam (in-app notifications)
        notificationService.notifyAllCandidatesOfNewExam(savedExam.getTitle(), savedExam.getExaminer().getCompanyName(), savedExam.getId());

        // Notify all candidates by email
        List<User> candidates = userRepository.findByRole("CANDIDATE");
        for (User candidate : candidates) {
            if (candidate.getEmail() != null && !candidate.getEmail().isEmpty()) {
                emailService.sendNewExamNotification(
                        candidate.getEmail(),
                        candidate.getFullname(),
                        savedExam.getTitle(),
                        savedExam.getExaminer().getCompanyName(),
                        savedExam.getStartTime().toString(),
                        savedExam.getDurationMinutes().toString()
                );
            }
        }

        return savedExam;
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public List<Exam> getExamsByExaminer(Long examinerId) {
        User examiner = userRepository.findById(examinerId)
                .orElseThrow(() -> new RuntimeException("Examiner not found!"));
        return examRepository.findByExaminer(examiner);
    }

    public Exam getExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found!"));
    }

    public List<Question> getQuestionsForExam(Long examId) {
        Exam exam = getExamById(examId);
        return questionRepository.findByExam(exam);
    }

    @Transactional
    public ExamRegistration registerCandidate(Long candidateId, Long examId) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found!"));
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found!"));

        if (registrationRepository.existsByCandidateAndExam(candidate, exam)) {
            throw new RuntimeException("You are already registered for this exam!");
        }

        ExamRegistration registration = new ExamRegistration();
        registration.setCandidate(candidate);
        registration.setExam(exam);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setAttended(false);
        registration.setStatus("REGISTERED");

        return registrationRepository.save(registration);
    }

    public List<ExamRegistration> getRegistrationsForCandidate(Long candidateId) {
        User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found!"));
        return registrationRepository.findByCandidate(candidate);
    }

    public List<ExamRegistration> getRegistrationsForExam(Long examId) {
        return registrationRepository.findByExamId(examId);
    }

    @Transactional
    public ExamRegistration submitExam(Long candidateId, Long examId, Map<Long, String> questionAnswers) {
        ExamRegistration registration = registrationRepository.findByCandidateIdAndExamId(candidateId, examId)
                .orElseThrow(() -> new RuntimeException("Candidate is not registered for this exam!"));

        if (registration.getAttended()) {
            throw new RuntimeException("You have already submitted answers for this exam!");
        }

        Exam exam = registration.getExam();
        LocalDateTime now = LocalDateTime.now();

        // Enforce time restrictions: Candidate can only access and submit exams during the exam window
        if (now.isBefore(exam.getStartTime())) {
            throw new RuntimeException("Exam has not started yet!");
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new RuntimeException("Exam session has already closed!");
        }

        List<Question> questions = questionRepository.findByExam(exam);
        int totalScore = 0;

        for (Question question : questions) {
            String selectedOption = questionAnswers.get(question.getId());
            if (selectedOption != null) {
                // Save candidate response
                CandidateAnswer answer = new CandidateAnswer();
                answer.setRegistration(registration);
                answer.setQuestion(question);
                answer.setSelectedOption(selectedOption);
                candidateAnswerRepository.save(answer);

                // Auto-grading logic
                if (selectedOption.trim().equalsIgnoreCase(question.getCorrectOption().trim())) {
                    totalScore += question.getMarks();
                }
            }
        }

        registration.setAttended(true);
        registration.setScore(totalScore);
        registration.setStatus("ATTENDED");

        return registrationRepository.save(registration);
    }

    public ExamRegistration updateShortlistStatus(Long registrationId, String status) {
        ExamRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Exam registration record not found!"));
        if (!"SHORTLISTED".equalsIgnoreCase(status) && !"NOT_SHORTLISTED".equalsIgnoreCase(status)) {
            throw new RuntimeException("Invalid status! Choose 'SHORTLISTED' or 'NOT_SHORTLISTED'.");
        }
        registration.setStatus(status.toUpperCase());
        return registrationRepository.save(registration);
    }

    public void sendResultMail(Long registrationId) {
        ExamRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Exam registration record not found!"));

        if (!registration.getAttended()) {
            throw new RuntimeException("Candidate has not attended this exam yet!");
        }

        User candidate = registration.getCandidate();
        Exam exam = registration.getExam();

        emailService.sendExamResult(
                candidate.getEmail(),
                candidate.getFullname(),
                exam.getTitle(),
                registration.getScore(),
                exam.getTotalMarks(),
                registration.getStatus()
        );
    }

    public long getExamsCount() {
        return examRepository.count();
    }

    public long getSubmissionsCount() {
        return registrationRepository.findAll().stream().filter(ExamRegistration::getAttended).count();
    }
}
