package com.ntrovote.controller;

import com.ntrovote.model.Election;
import com.ntrovote.model.Nominee;
import com.ntrovote.service.ElectionService;
import com.ntrovote.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/elections")
public class ElectionController {

    @Autowired
    private ElectionService electionService;

    @Autowired
    private VoteService voteService;

    private final Path rootLocation = Paths.get("uploads");

    @GetMapping("/active")
    public List<Election> getActiveElections() {
        return electionService.getActiveElections();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Election> getElection(@PathVariable Long id) {
        return ResponseEntity.ok(electionService.getElection(id));
    }

    // Admin Endpoints

    @PostMapping("/admin")
    public ResponseEntity<Election> createElection(@RequestBody Election election) {
        return ResponseEntity.ok(electionService.createElection(election));
    }

    @GetMapping("/admin/all")
    public List<Election> getAllElections() {
        return electionService.getAllElections();
    }

    @PostMapping("/admin/{id}/nominees")
    public ResponseEntity<?> addNominee(@PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("details") String details,
            @RequestParam("image") MultipartFile image) {
        try {
            if (!Files.exists(rootLocation)) {
                Files.createDirectories(rootLocation);
            }

            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Files.copy(image.getInputStream(), rootLocation.resolve(filename));

            Nominee nominee = new Nominee();
            nominee.setName(name);
            nominee.setDetails(details);
            nominee.setImageUrl("/images/" + filename);

            return ResponseEntity.ok(electionService.addNominee(id, nominee));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload image"));
        }
    }

    @DeleteMapping("/admin/nominees/{id}")
    public ResponseEntity<?> deleteNominee(@PathVariable Long id) {
        electionService.deleteNominee(id);
        return ResponseEntity.ok(Map.of("message", "Nominee deleted"));
    }

    @PostMapping("/admin/{id}/reset")
    public ResponseEntity<?> resetElection(@PathVariable Long id) {
        electionService.resetElection(id);
        return ResponseEntity.ok(Map.of("message", "Election votes reset"));
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        Election.ElectionStatus status = Election.ElectionStatus.valueOf(statusMap.get("status"));
        electionService.updateElectionStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Status updated"));
    }

    @GetMapping("/admin/{id}/results")
    public ResponseEntity<?> getElectionResults(@PathVariable Long id) {
        return ResponseEntity.ok(voteService.getElectionResults(id));
    }

}
