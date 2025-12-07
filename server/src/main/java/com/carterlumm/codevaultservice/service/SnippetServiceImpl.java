package com.carterlumm.codevaultservice.service;

import com.carterlumm.codevaultservice.dto.CreateSnippetRequest;
import com.carterlumm.codevaultservice.dto.UpdateSnippetRequest;
import com.carterlumm.codevaultservice.model.Snippet;
import com.carterlumm.codevaultservice.model.Tag;
import com.carterlumm.codevaultservice.model.User;
import com.carterlumm.codevaultservice.repository.SnippetRepository;
import com.carterlumm.codevaultservice.repository.TagRepository;
import com.carterlumm.codevaultservice.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SnippetServiceImpl implements SnippetService {

    private final SnippetRepository snippetRepo;

    private final TagRepository tagRepo;

    private final UserRepository userRepository;


    public SnippetServiceImpl(SnippetRepository snippetRepo, TagRepository tagRepo, UserRepository userRepository) {
        this.snippetRepo = snippetRepo; this.tagRepo = tagRepo; this.userRepository = userRepository;
    }

    @Transactional
    @Override
    public Snippet create(CreateSnippetRequest req, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));

        var tags = resolveTags(req.tags());

        var snippet = Snippet.builder()
                .userId(owner.getId())   // UUID from DB, not passed from client
                .title(req.title())
                .body(req.body())
                .faviconUrl(req.faviconUrl())
                .language(req.language())
                .meta(req.meta())
                .tags(tags)
                .build();

        return snippetRepo.save(snippet);
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<Snippet> get(UUID id) {
        return snippetRepo.findById(id);
    }

    @Override
    @Transactional
    public Optional<Snippet> update(UUID id, UpdateSnippetRequest req) {
        return snippetRepo.findById(id).map(s -> {
            s.setTitle(req.title());
            s.setBody(req.body());
            s.setLanguage(req.language());
            s.setMeta(req.meta());
            s.setTags(resolveTags(req.tags()));
            return s;
        });
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        snippetRepo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Snippet> search(String q, int page, int size) {
        return snippetRepo.search(q, PageRequest.of(page, size));
    }

    private Set<Tag> resolveTags(List<String> names) {
        if (names == null || names.isEmpty()) return new HashSet<>();
        return names.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(n -> tagRepo.findByNameIgnoreCase(n).orElseGet(() -> tagRepo.save(Tag.builder().name(n).build())))
                .collect(Collectors.toSet());
    }

    @Override
    public Page<Snippet> findByUserEmail(String email, int page, int size, String sortBy, String direction) {
        Sort sort = Sort.by(
                direction.equalsIgnoreCase("asc") ?
                        Sort.Direction.ASC :
                        Sort.Direction.DESC,
                sortBy
        );

        Pageable pageable = PageRequest.of(page, size, sort);
        // Get userId from email using UserService
        UUID userId = userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Page<Snippet> snippets = snippetRepo.findByUserId(userId, pageable);
        return snippets;
    }
}
