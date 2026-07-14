package com.config;

import com.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthBootstrapper implements CommandLineRunner {

    private final AuthService authService;

    @Override
    public void run(String... args) {
        authService.ensureAdminAccount();
    }
}