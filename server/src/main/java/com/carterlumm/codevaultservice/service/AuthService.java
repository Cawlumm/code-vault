package com.carterlumm.codevaultservice.service;

import com.carterlumm.codevaultservice.dto.AuthResponse;
import com.carterlumm.codevaultservice.dto.LoginRequest;
import com.carterlumm.codevaultservice.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest req);

    AuthResponse login(LoginRequest req);

    AuthResponse refresh(String refreshToken);
}
