// web/AuthController.java
package com.carterlumm.codevaultservice.controller;

import com.carterlumm.codevaultservice.dto.AuthResponse;
import com.carterlumm.codevaultservice.dto.LoginRequest;
import com.carterlumm.codevaultservice.dto.RefreshRequest;
import com.carterlumm.codevaultservice.dto.RegisterRequest;
import com.carterlumm.codevaultservice.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) { this.authService = authService; }

    /** Register a new account */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    /** Login and receive a new access + refresh token pair */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    /** Refresh access token using a valid refresh token */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req.refreshToken()));
    }
}
