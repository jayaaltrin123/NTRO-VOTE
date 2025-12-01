package com.ntrovote.service;

import com.ntrovote.model.Election;
import com.ntrovote.model.Nominee;
import com.ntrovote.model.User;
import com.ntrovote.model.Vote;
import com.ntrovote.repository.ElectionRepository;
import com.ntrovote.repository.NomineeRepository;
import com.ntrovote.repository.UserRepository;
import com.ntrovote.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {

    @Autowired
    private VoteRepository voteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ElectionRepository electionRepository;

    @Autowired
    private NomineeRepository nomineeRepository;

    @Transactional
    public Vote castVote(String userPhone, Long electionId, Long nomineeId) {
        User user = userRepository.findByPhone(userPhone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (voteRepository.existsByUserIdAndElectionId(user.getId(), electionId)) {
            throw new RuntimeException("Already voted in this election");
        }

        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));

        if (election.getStatus() != Election.ElectionStatus.ONGOING) {
            throw new RuntimeException("Election is closed");
        }

        Nominee nominee = nomineeRepository.findById(nomineeId)
                .orElseThrow(() -> new RuntimeException("Nominee not found"));

        Vote vote = new Vote();
        vote.setUser(user);
        vote.setElection(election);
        vote.setNominee(nominee);

        return voteRepository.save(vote);
    }

    public long getVoteCount(Long nomineeId) {
        return voteRepository.countByNomineeId(nomineeId);
    }

    public java.util.List<java.util.Map<String, Object>> getElectionResults(Long electionId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new RuntimeException("Election not found"));

        return election.getNominees().stream()
                .map(nominee -> {
                    java.util.Map<String, Object> result = new java.util.HashMap<>();
                    result.put("nomineeId", nominee.getId());
                    result.put("name", nominee.getName());
                    result.put("count", voteRepository.countByNomineeId(nominee.getId()));
                    return result;
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
