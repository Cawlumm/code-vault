package com.carterlumm.codevaultservice.controller;

import com.carterlumm.codevaultservice.dto.CreateSnippetRequest;
import com.carterlumm.codevaultservice.dto.SnippetDto;
import com.carterlumm.codevaultservice.dto.UpdateSnippetRequest;
import com.carterlumm.codevaultservice.exception.ResourceNotFoundException;
import com.carterlumm.codevaultservice.model.Snippet;
import com.carterlumm.codevaultservice.service.SnippetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/snippets")
@RequiredArgsConstructor
public class SnippetController {

    @Autowired
    private SnippetService service;

    @PostMapping
    public SnippetDto create(@RequestBody CreateSnippetRequest req,
                             Principal principal) {
        var email = principal.getName();
        Snippet saved = service.create(req, email);
        return SnippetDto.from(saved);
    }


    @GetMapping("/{id}")
    public SnippetDto get(@PathVariable UUID id) {
        Snippet s = service.get(id).orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        return SnippetDto.from(s);
    }

    @PutMapping("/{id}")
    public SnippetDto update(@PathVariable UUID id, @Valid @RequestBody UpdateSnippetRequest req) {
        Snippet s = service.update(id, req).orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));
        return SnippetDto.from(s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @GetMapping("/search")
    public Page<SnippetDto> search(@RequestParam String q,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size) {
        return service.search(q, page, size).map(SnippetDto::from);
    }

    @GetMapping
    public Page<SnippetDto> getSnippets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            Principal principal) {

        String email = principal.getName();
        return service.findByUserEmail(
                email,
                page,
                size,
                sortBy,
                direction
        ).map(SnippetDto::from);
    }
}
