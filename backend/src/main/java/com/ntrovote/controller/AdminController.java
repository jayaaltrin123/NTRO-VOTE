package com.ntrovote.controller;

import com.ntrovote.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");
        try {
            String token = authService.adminLogin(username, password);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/otps")
    public ResponseEntity<?> getAllOtps() {
        return ResponseEntity.ok(authService.getAllOtps());
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllEligibleVoters() {
        return ResponseEntity.ok(authService.getAllEligibleVoters());
    }

    @PostMapping("/users")
    public ResponseEntity<?> addEligibleVoter(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String name = request.get("name");
        try {
            return ResponseEntity.ok(authService.addEligibleVoter(phone, name));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{phone}")
    public ResponseEntity<?> removeEligibleVoter(@PathVariable String phone) {
        authService.removeEligibleVoter(phone);
        return ResponseEntity.ok(Map.of("message", "Voter removed"));
    }

    @GetMapping("/voting-stats/{electionId}")
    public ResponseEntity<?> getVotingStatistics(@PathVariable Long electionId) {
        try {
            return ResponseEntity.ok(authService.getVotingStatistics(electionId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
}
