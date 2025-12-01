package com.ntrovote.controller;

import com.ntrovote.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/vote")
public class VoteController {

    @Autowired
    private VoteService voteService;

    @PostMapping
    public ResponseEntity<?> castVote(@RequestBody Map<String, Long> request, Authentication authentication) {
        String userPhone = authentication.getName();
        Long electionId = request.get("electionId");
        Long nomineeId = request.get("nomineeId");

        try {
            voteService.castVote(userPhone, electionId, nomineeId);
            return ResponseEntity.ok(Map.of("message", "Vote cast successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        }
    }
}
