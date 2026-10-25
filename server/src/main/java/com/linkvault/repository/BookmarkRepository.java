package com.linkvault.repository;

import com.linkvault.dto.TagCount;
import com.linkvault.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    /**
     * One query for search + category + tag + favorites. Null parameters mean "no filter".
     * {@code pattern} is already lower-cased and wrapped in % signs by the service ("%" when there is no search).
     * Sorting and paging come from the Pageable.
     */
    @Query("""
            SELECT b FROM Bookmark b
            WHERE b.user.id = :userId
              AND (:category IS NULL OR b.category = :category)
              AND (:favorite IS NULL OR b.favorite = :favorite)
              AND (:tag IS NULL OR :tag MEMBER OF b.tags)
              AND (LOWER(b.title) LIKE :pattern
                   OR LOWER(b.description) LIKE :pattern
                   OR LOWER(b.url) LIKE :pattern
                   OR EXISTS (SELECT t FROM b.tags t WHERE LOWER(t) LIKE :pattern))
            """)
    Page<Bookmark> findFiltered(@Param("userId") Long userId,
                                @Param("pattern") String pattern,
                                @Param("category") String category,
                                @Param("tag") String tag,
                                @Param("favorite") Boolean favorite,
                                Pageable pageable);

    Optional<Bookmark> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndUrl(Long userId, String url);

    @Query("""
            SELECT new com.linkvault.dto.TagCount(t, COUNT(b))
            FROM Bookmark b JOIN b.tags t
            WHERE b.user.id = :userId
            GROUP BY t
            ORDER BY COUNT(b) DESC, t ASC
            """)
    List<TagCount> countTags(@Param("userId") Long userId);
}
