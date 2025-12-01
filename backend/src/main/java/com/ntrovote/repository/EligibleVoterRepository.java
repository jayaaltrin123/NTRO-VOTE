package com.ntrovote.repository;

import com.ntrovote.model.EligibleVoter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface EligibleVoterRepository extends JpaRepository<EligibleVoter, Long> {
    boolean existsByPhoneNumber(String phoneNumber);

    @Transactional
    void deleteByPhoneNumber(String phoneNumber);
}
