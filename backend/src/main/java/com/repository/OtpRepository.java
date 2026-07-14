package com.repository;

import com.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findTopByEmailAndOtpAndVerifiedFalseAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String email, String otp, LocalDateTime now);

    void deleteByEmail(String email);
}