package com.carterlumm.codevaultservice.service;

import com.carterlumm.codevaultservice.dto.CreateSnippetRequest;
import com.carterlumm.codevaultservice.dto.UpdateSnippetRequest;
import com.carterlumm.codevaultservice.model.Snippet;
import org.springframework.data.domain.Page;

import java.util.Optional;
import java.util.UUID;

public interface SnippetService {

    Snippet create(CreateSnippetRequest req, String email);
    Optional<Snippet> get(UUID id);
    Optional<Snippet> update(UUID id, UpdateSnippetRequest req);
    void delete(UUID id);
    Page<Snippet> search(String q, int page, int size);

    Page<Snippet> findByUserEmail(String email, int page, int size, String sortBy, String direction);


}
