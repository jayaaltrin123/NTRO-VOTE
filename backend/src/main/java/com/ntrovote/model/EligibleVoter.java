package com.ntrovote.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "eligible_voters")
@Data
@NoArgsConstructor
public class EligibleVoter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String phoneNumber;

    public EligibleVoter(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
