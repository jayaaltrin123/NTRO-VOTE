package com.ntrovote.service;

import com.ntrovote.model.Admin;
import com.ntrovote.model.EligibleVoter;
import com.ntrovote.model.Otp;
import com.ntrovote.model.User;
import com.ntrovote.model.Vote;
import com.ntrovote.repository.AdminRepository;
import com.ntrovote.repository.EligibleVoterRepository;
import com.ntrovote.repository.OtpRepository;
import com.ntrovote.repository.UserRepository;
import com.ntrovote.repository.VoteRepository;
import com.ntrovote.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    private EligibleVoterRepository eligibleVoterRepository;

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${twilio.account_sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth_token}")
    private String twilioAuthToken;

    @Value("${twilio.phone_number}")
    private String twilioPhoneNumber;

    // Helper to normalize phone numbers (simple version)
    private String normalizePhone(String phone) {
        if (phone == null)
            return null;
        String cleaned = phone.replaceAll("\\s+", ""); // remove spaces
        if (!cleaned.startsWith("+")) {
            return "+91" + cleaned; // Default to India +91 if no code
        }
        return cleaned;
    }

    public void sendOtp(String phone) {
        String normalizedPhone = normalizePhone(phone);

        // Check eligibility
        if (!eligibleVoterRepository.existsByPhoneNumber(normalizedPhone)) {
            // Also check raw just in case admin utilized raw number
            if (!eligibleVoterRepository.existsByPhoneNumber(phone)) {
                throw new RuntimeException("Phone number not eligible to vote");
            } else {
                // Admin used raw number, let's proceed with raw for consistency or update to
                // normalized?
                // For now, let's respect what's in DB for eligibility, but use normalized for
                // SMS
                normalizedPhone = phone;
            }
        }

        // Generate 6-digit OTP
        String code = String.format("%06d", new Random().nextInt(999999));

        // Save to DB (overwrite existing)
        Otp otp = new Otp(normalizedPhone, code, LocalDateTime.now().plusMinutes(5));
        otpRepository.save(otp);

        // Send SMS via Twilio
        try {
            String fromNumber = twilioPhoneNumber.startsWith("+") ? twilioPhoneNumber : "+" + twilioPhoneNumber;

            com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
            com.twilio.rest.api.v2010.account.Message.creator(
                    new com.twilio.type.PhoneNumber(normalizedPhone),
                    new com.twilio.type.PhoneNumber(fromNumber),
                    "Your NtroVote OTP is: " + code).create();
            System.out.println("SMS sent to " + normalizedPhone);
        } catch (Exception e) {
            System.err.println("Failed to send SMS: " + e.getMessage());
            // Fallback to console for development if SMS fails
            System.out.println("OTP for " + normalizedPhone + ": " + code);
        }
    }

    public String verifyOtp(String phone, String code) {
        System.out.println("--- VERIFY OTP REQUEST ---");
        System.out.println("Input Phone: " + phone);
        System.out.println("Input Code: " + code);

        String normalizedPhone = normalizePhone(phone);
        System.out.println("Normalized Phone: " + normalizedPhone);

        // Try finding by normalized first
        Optional<Otp> otpOpt = otpRepository.findById(normalizedPhone);

        // logic fallback: if not found, try raw
        if (otpOpt.isEmpty()) {
            System.out.println("Not found by normalized, trying raw: " + phone);
            otpOpt = otpRepository.findById(phone);
        }

        if (otpOpt.isEmpty()) {
            System.out.println("ERROR: OTP Record not found in DB.");
            throw new RuntimeException("Invalid OTP");
        }

        Otp otp = otpOpt.get();
        System.out.println("Found OTP Record -> Phone: " + otp.getPhone() + ", Code: " + otp.getCode() + ", Expires: "
                + otp.getExpiresAt());

        if (!otp.getCode().equals(code)) {
            System.out.println("ERROR: Code mismatch. Expected: " + otp.getCode() + ", Got: " + code);
            throw new RuntimeException("Invalid OTP");
        }

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            System.out.println("ERROR: OTP Expired. Now: " + LocalDateTime.now());
            throw new RuntimeException("OTP Expired");
        }

        // OTP Valid, clear it
        otpRepository.delete(otp);
        System.out.println("OTP Verified and Deleted.");

        // Create user if not exists
        final String finalPhone = otp.getPhone(); // Use the format that was verified
        User user = userRepository.findByPhone(finalPhone)
                .orElseGet(() -> {
                    System.out.println("Creating new User for: " + finalPhone);
                    return userRepository.save(new User(finalPhone));
                });

        System.out.println("User ID: " + user.getId());

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

    // Admin Features
    public List<Otp> getAllOtps() {
        return otpRepository.findAll();
    }

    public List<EligibleVoter> getAllEligibleVoters() {
        return eligibleVoterRepository.findAll();
    }

    public EligibleVoter addEligibleVoter(String phone, String name) {
        // We enforce storing eligible voters with +91 if possible for consistency,
        // OR we just store what is given but normalized
        String normalizedPhone = normalizePhone(phone);

        if (eligibleVoterRepository.existsByPhoneNumber(normalizedPhone)) {
            throw new RuntimeException("Voter already eligible");
        }
        return eligibleVoterRepository.save(new EligibleVoter(normalizedPhone, name));
    }

    public void removeEligibleVoter(String phone) {
        String normalizedPhone = normalizePhone(phone);
        if (eligibleVoterRepository.existsByPhoneNumber(normalizedPhone)) {
            eligibleVoterRepository.deleteByPhoneNumber(normalizedPhone);
        } else {
            eligibleVoterRepository.deleteByPhoneNumber(phone);
        }
    }

    public Map<String, Object> getVotingStatistics(Long electionId) {
        List<EligibleVoter> allVoters = eligibleVoterRepository.findAll();
        List<Vote> votes = voteRepository.findByElectionId(electionId);
        long totalEligible = allVoters.size();
        long totalVoted = voteRepository.countByElectionId(electionId);

        // Get list of phone numbers who voted
        Set<String> votedPhones = votes.stream()
                .map(vote -> vote.getUser().getPhone())
                .collect(Collectors.toSet());

        // Separate voters into voted and not voted
        List<Map<String, String>> voted = new ArrayList<>();
        List<Map<String, String>> notVoted = new ArrayList<>();

        for (EligibleVoter voter : allVoters) {
            Map<String, String> voterInfo = Map.of(
                    "phone", voter.getPhoneNumber(),
                    "name", voter.getName() != null ? voter.getName() : "N/A");
            if (votedPhones.contains(voter.getPhoneNumber())) {
                voted.add(voterInfo);
            } else {
                notVoted.add(voterInfo);
            }
        }

        return Map.of(
                "totalEligible", totalEligible,
                "totalVoted", totalVoted,
                "voted", voted,
                "notVoted", notVoted);
    }
}
