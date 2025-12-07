package com.carterlumm.codevaultservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CreateSnippetRequest(
        @NotBlank String title,
        @NotBlank String body,
        String faviconUrl,
        String language,
        Map<String, Object> meta,
        List<String> tags
) {}
