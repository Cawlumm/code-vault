package com.carterlumm.codevaultservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "snippet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Snippet {
    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "favicon_url")
    private String faviconUrl;

    private String language;

    @JdbcTypeCode(SqlTypes.JSON)            // Hibernate 6 JSON support
    @Column(columnDefinition = "jsonb")  // keep as raw JSON string; map later if desired
    private Map<String, Object> meta;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @ManyToMany
    @JoinTable(
            name = "snippet_tag",
            joinColumns = @JoinColumn(name = "snippet_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @PreUpdate
    public void touch() { this.updatedAt = OffsetDateTime.now(); }
}
