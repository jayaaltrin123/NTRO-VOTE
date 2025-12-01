package com.ntrovote.repository;

import com.ntrovote.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    boolean existsByUserIdAndElectionId(Long userId, Long electionId);

    long countByNomineeId(Long nomineeId);

    void deleteByElectionId(Long electionId);

    List<Vote> findByElectionId(Long electionId);

    long countByElectionId(Long electionId);
}
