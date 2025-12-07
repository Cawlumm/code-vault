package com.carterlumm.codevaultservice.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * JwtService
 *
 * Responsible for generating, validating, and parsing JWT access and refresh tokens.
 * Access tokens are short-lived and used for API requests.
 * Refresh tokens are long-lived and used to obtain new access tokens.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    /**
     * Initializes JWT service using configuration values.
     *
     * @param secret      signing secret from app properties
     * @param ttlMinutes  access token lifespan in minutes
     */
    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.ttlMinutes}") long ttlMinutes
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTtlSeconds = ttlMinutes * 60;
        this.refreshTtlSeconds = 30L * 24 * 3600; // 30 days by default
    }

    /**
     * Generates a short-lived access token for API use.
     *
     * @param subjectEmail email of the authenticated user
     * @return signed JWT access token
     */
    public String generateAccessToken(String subjectEmail) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subjectEmail)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .signWith(key)
                .compact();
    }

    /**
     * Generates a long-lived refresh token for session renewal.
     *
     * @param subjectEmail email of the authenticated user
     * @return signed JWT refresh token
     */
    public String generateRefreshToken(String subjectEmail) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subjectEmail)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTtlSeconds)))
                .signWith(key)
                .compact();
    }

    /**
     * Validates a JWT and returns its subject (email).
     *
     * @param token JWT to validate
     * @return user email if valid
     * @throws io.jsonwebtoken.JwtException if invalid or expired
     */
    public String validateAndGetSubject(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Checks if a token is still valid (not expired).
     *
     * @param token JWT token to check
     * @return true if valid and not expired
     */
    public boolean isValid(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Returns the access token time-to-live in seconds.
     */
    public long getAccessTtlSeconds() {
        return accessTtlSeconds;
    }

    /**
     * Returns the refresh token time-to-live in seconds.
     */
    public long getRefreshTtlSeconds() {
        return refreshTtlSeconds;
    }
}
