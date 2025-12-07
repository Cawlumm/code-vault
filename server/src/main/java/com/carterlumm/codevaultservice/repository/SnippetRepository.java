package com.carterlumm.codevaultservice.repository;

import com.carterlumm.codevaultservice.model.Snippet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Repository
public interface SnippetRepository extends JpaRepository<Snippet, UUID>, JpaSpecificationExecutor<Snippet> {

    // Full-text + trigram hybrid search (native SQL for ranking)
    @Query(value = """
      SELECT s.* FROM snippets
      WHERE
        to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.body,'')) @@ plainto_tsquery(:q)
        OR similarity(s.title, :q) > 0.25
      ORDER BY
        GREATEST(
          ts_rank_cd(to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.body,'')), plainto_tsquery(:q)),
          similarity(s.title, :q)
        ) DESC
      """,
            countQuery = """
      SELECT count(*) FROM snippets
      WHERE
        to_tsvector('english', coalesce(s.title,'') || ' ' || coalesce(s.body,'')) @@ plainto_tsquery(:q)
        OR similarity(s.title, :q) > 0.25
      """,
            nativeQuery = true)
    Page<Snippet> search(@Param("q") String q, Pageable pageable);

    Page<Snippet> findByUserId(UUID userId, Pageable pageable);

}
