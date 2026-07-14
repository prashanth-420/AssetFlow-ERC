package com.service;

import com.entity.Otp;
import com.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpRepository otpRepository;
    private final SendGridEmailService sendGridEmailService;

    private static final int OTP_EXPIRY_MINUTES = 5;

    @Transactional
    public String sendOtp(String email) {
        // Delete any existing unused OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Save OTP to database
        Otp otpEntity = Otp.builder()
                .email(email)
                .otp(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .verified(false)
                .used(false)
                .build();
        otpRepository.save(otpEntity);

        // Send OTP via SendGrid
        boolean sent = sendGridEmailService.sendOtpEmail(email, otp);

        if (!sent) {
            log.warn("OTP generated for {} but email delivery failed", email);
            return "OTP generated but failed to send email. Please check your email address or try again.";
        }

        return "OTP sent to " + email;
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        var otpOptional = otpRepository.findTopByEmailAndOtpAndVerifiedFalseAndUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                email, otp, LocalDateTime.now());

        if (otpOptional.isEmpty()) {
            return false;
        }

        Otp otpEntity = otpOptional.get();
        otpEntity.setVerified(true);
        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);

        return true;
    }
}