package com.carterlumm.codevaultservice.dto;

import com.carterlumm.codevaultservice.model.Snippet;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;
import com.carterlumm.codevaultservice.model.Tag;

public record SnippetDto(
        UUID id,
        String title,
        String body,
        String faviconUrl,
        String language,
        Map<String, Object> meta,
        List<String> tags,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static SnippetDto from(Snippet snippet) {
        return new SnippetDto(
                snippet.getId(),
                snippet.getTitle(),
                snippet.getBody(),
                snippet.getFaviconUrl(),
                snippet.getLanguage(),
                snippet.getMeta(),
                snippet.getTags() != null
                        ? snippet.getTags().stream().map(Tag::getName).collect(Collectors.toList())
                        : new ArrayList<String>(),
                snippet.getCreatedAt(),
                snippet.getUpdatedAt()
        );
    }
}
