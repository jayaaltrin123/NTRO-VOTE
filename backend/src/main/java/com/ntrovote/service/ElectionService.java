package com.ntrovote.service;

import com.ntrovote.model.Election;
import com.ntrovote.model.Nominee;
import com.ntrovote.repository.ElectionRepository;
import com.ntrovote.repository.NomineeRepository;
import com.ntrovote.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ElectionService {

    @Autowired
    private ElectionRepository electionRepository;

    @Autowired
    private NomineeRepository nomineeRepository;

    @Autowired
    private VoteRepository voteRepository;

    public Election createElection(Election election) {
        election.setStatus(Election.ElectionStatus.ONGOING);
        return electionRepository.save(election);
    }

    public List<Election> getAllElections() {
        return electionRepository.findAll();
    }

    public List<Election> getActiveElections() {
        return electionRepository.findByStatus(Election.ElectionStatus.ONGOING);
    }

    public Election getElection(Long id) {
        return electionRepository.findById(id).orElseThrow(() -> new RuntimeException("Election not found"));
    }

    public Nominee addNominee(Long electionId, Nominee nominee) {
        Election election = getElection(electionId);
        nominee.setElection(election);
        return nomineeRepository.save(nominee);
    }

    public void deleteNominee(Long id) {
        nomineeRepository.deleteById(id);
    }

    @Transactional
    public void resetElection(Long electionId) {
        voteRepository.deleteByElectionId(electionId);
    }

    public void deleteElection(Long id) {
        electionRepository.deleteById(id);
    }

    public void updateElectionStatus(Long id, Election.ElectionStatus status) {
        Election election = getElection(id);
        election.setStatus(status);
        electionRepository.save(election);
    }
}
