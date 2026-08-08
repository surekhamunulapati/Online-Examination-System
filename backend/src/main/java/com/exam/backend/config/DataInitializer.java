package com.exam.backend.config;

import com.exam.backend.model.User;
import com.exam.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setFullname("System Administrator");
            admin.setUsername("admin");
            admin.setPassword("admin123"); // Using plain password for simplicity; in prod use passwordEncoder.encode
            admin.setEmail("admin@exam.com");
            admin.setMobile("0000000000");
            admin.setRole("ADMIN");
            admin.setApproved(true);
            
            userRepository.save(admin);
            System.out.println("Default Admin User seeded! Username: admin, Password: admin123");
        }
    }
}
