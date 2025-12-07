package com.carterlumm.codevaultservice.dto;

public record RegisterRequest(String email, String displayName, String password, String serverUrl) {}