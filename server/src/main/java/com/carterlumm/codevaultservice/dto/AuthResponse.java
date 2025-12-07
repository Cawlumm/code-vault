package com.carterlumm.codevaultservice.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresIn
) {}
