package com.controller;

import com.dto.auth.AuthResponse;
import com.dto.auth.GoogleAuthRequest;
import com.dto.auth.LoginRequest;
import com.dto.auth.SendOtpRequest;
import com.dto.auth.SignupRequest;
import com.dto.auth.VerifyOtpRequest;
import com.service.AuthService;
import com.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.googleLogin(request.getAccessToken()));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody SendOtpRequest request) {
        String message = otpService.sendOtp(request.getEmail());
        boolean success = !message.contains("failed");
        return ResponseEntity.ok(Map.of("success", success, "message", message));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully."));
        }
        return ResponseEntity.ok(Map.of("success", false, "message", "Invalid or expired OTP."));
    }
}
