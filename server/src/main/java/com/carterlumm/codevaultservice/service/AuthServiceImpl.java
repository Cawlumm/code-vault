package com.carterlumm.codevaultservice.service;

import com.carterlumm.codevaultservice.dto.*;
import com.carterlumm.codevaultservice.model.User;
import com.carterlumm.codevaultservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthServiceImpl(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Override
    public AuthResponse register(RegisterRequest req) {
        if (req.email() == null || req.password() == null || req.password().length() < 8)
            throw new IllegalArgumentException("Email and 8+ char password required");
        if (users.existsByEmail(req.email().toLowerCase()))
            throw new IllegalArgumentException("Email already registered");

        User u = new User();
        u.setEmail(req.email().toLowerCase().trim());
        u.setDisplayName(req.displayName().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setServerUrl(req.serverUrl());
        users.save(u);

        String access = jwt.generateAccessToken(u.getEmail());
        String refresh = jwt.generateRefreshToken(u.getEmail());
        return new AuthResponse(access, refresh, jwt.getAccessTtlSeconds());
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        User u = users.findByEmail(req.email().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!encoder.matches(req.password(), u.getPasswordHash()))
            throw new IllegalArgumentException("Invalid credentials");

        String access = jwt.generateAccessToken(u.getEmail());
        String refresh = jwt.generateRefreshToken(u.getEmail());
        return new AuthResponse(access, refresh, jwt.getAccessTtlSeconds());
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        if (!jwt.isValid(refreshToken))
            throw new IllegalArgumentException("Invalid or expired refresh token");

        String email = jwt.validateAndGetSubject(refreshToken);
        User user = users.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String newAccess = jwt.generateAccessToken(user.getEmail());
        String newRefresh = jwt.generateRefreshToken(user.getEmail());
        return new AuthResponse(newAccess, newRefresh, jwt.getAccessTtlSeconds());
    }

}
