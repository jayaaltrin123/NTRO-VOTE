package com.ntrovote.service;

import com.ntrovote.model.Admin;
import com.ntrovote.model.Otp;
import com.ntrovote.model.User;
import com.ntrovote.repository.AdminRepository;
import com.ntrovote.repository.OtpRepository;
import com.ntrovote.repository.UserRepository;
import com.ntrovote.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void sendOtp(String phone) {
        // Generate 6-digit OTP
        String code = String.format("%06d", new Random().nextInt(999999));

        // Save to DB (overwrite existing)
        Otp otp = new Otp(phone, code, LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otp);

        // Mock sending SMS
        System.out.println("OTP for " + phone + ": " + code);
    }

    public String verifyOtp(String phone, String code) {
        Optional<Otp> otpOpt = otpRepository.findById(phone);
        if (otpOpt.isEmpty() || !otpOpt.get().getCode().equals(code)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (otpOpt.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP Expired");
        }

        // OTP Valid, clear it
        otpRepository.delete(otpOpt.get());

        // Create user if not exists
        User user = userRepository.findByPhone(phone)
                .orElseGet(() -> userRepository.save(new User(phone)));

        // Generate JWT
        return jwtUtil.generateToken(user.getPhone(), "ROLE_USER");
    }

    public String adminLogin(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        return jwtUtil.generateToken(username, "ROLE_ADMIN");
    }

    // Helper to create initial admin if none exists
    public void createInitialAdmin() {
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            adminRepository.save(admin);
            System.out.println("Created initial admin: admin / admin123");
        }
    }
}
