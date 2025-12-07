package com.carterlumm.codevaultservice.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;

public record UpdateSnippetRequest(
        @NotBlank String title,
        @NotBlank String body,
        String language,
        Map<String, Object> meta,
        List<String> tags
) {}
