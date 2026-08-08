package com.exam.backend.service;

import com.exam.backend.model.User;
import com.exam.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists!");
        }

        // Set approvals and role constraints
        if ("EXAMINER".equalsIgnoreCase(user.getRole())) {
            user.setApproved(false); // Examiners require admin approval
        } else {
            user.setApproved(true); // Candidates and Admin default to approved
        }

        return userRepository.save(user);
    }

    public User loginUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password!"));

        if (!user.getPassword().equals(password)) { // In production, use password hashing
            throw new RuntimeException("Invalid username or password!");
        }

        if (!user.getApproved()) {
            throw new RuntimeException("Your account is pending Admin approval!");
        }

        return user;
    }

    public List<User> getPendingExaminers() {
        return userRepository.findByRoleAndApproved("EXAMINER", false);
    }

    public List<User> getApprovedExaminers() {
        return userRepository.findByRoleAndApproved("EXAMINER", true);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User approveExaminer(Long examinerId) {
        User examiner = userRepository.findById(examinerId)
                .orElseThrow(() -> new RuntimeException("Examiner not found!"));
        if (!"EXAMINER".equalsIgnoreCase(examiner.getRole())) {
            throw new RuntimeException("User is not an examiner!");
        }
        examiner.setApproved(true);
        return userRepository.save(examiner);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Cannot delete Administrator account!");
        }
        userRepository.delete(user);
    }

    public long getCandidatesCount() {
        return userRepository.findByRole("CANDIDATE").size();
    }

    public long getExaminersCount() {
        return userRepository.findByRole("EXAMINER").size();
    }
}
