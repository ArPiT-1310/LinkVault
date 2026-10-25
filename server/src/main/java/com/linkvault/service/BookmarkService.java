package com.linkvault.service;

import com.linkvault.dto.BookmarkRequest;
import com.linkvault.dto.BookmarkResponse;
import com.linkvault.dto.TagCount;
import com.linkvault.entity.Bookmark;
import com.linkvault.entity.User;
import com.linkvault.exception.ApiException;
import com.linkvault.repository.BookmarkRepository;
import com.linkvault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Every method receives the logged-in user's email, so a user can only ever touch their own bookmarks. */
@Service
@Transactional
public class BookmarkService {

    private final BookmarkRepository bookmarks;
    private final UserRepository users;

    public BookmarkService(BookmarkRepository bookmarks, UserRepository users) {
        this.bookmarks = bookmarks;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public Page<BookmarkResponse> list(String email, String search, String category, String tag,
                                       Boolean favorite, Pageable pageable) {
        String s = blankToNull(search);
        String pattern = s == null ? "%" : "%" + s.toLowerCase() + "%";
        String t = blankToNull(tag);
        return bookmarks
                .findFiltered(user(email).getId(), pattern, blankToNull(category),
                        t == null ? null : t.toLowerCase(), favorite, pageable)
                .map(BookmarkResponse::from);
    }

    public BookmarkResponse create(String email, BookmarkRequest req) {
        User user = user(email);
        String url = req.url().trim();
        if (bookmarks.existsByUserIdAndUrl(user.getId(), url)) {
            throw ApiException.conflict("You already saved this URL");
        }
        Bookmark b = new Bookmark();
        b.setUser(user);
        apply(b, req);
        return BookmarkResponse.from(bookmarks.save(b));
    }

    public BookmarkResponse update(String email, Long id, BookmarkRequest req) {
        User user = user(email);
        Bookmark b = owned(id, user.getId());
        String url = req.url().trim();
        if (!url.equals(b.getUrl()) && bookmarks.existsByUserIdAndUrl(user.getId(), url)) {
            throw ApiException.conflict("You already saved this URL");
        }
        apply(b, req);
        return BookmarkResponse.from(bookmarks.save(b));
    }

    public void delete(String email, Long id) {
        bookmarks.delete(owned(id, user(email).getId()));
    }

    public BookmarkResponse toggleFavorite(String email, Long id) {
        Bookmark b = owned(id, user(email).getId());
        b.setFavorite(!b.isFavorite());
        return BookmarkResponse.from(bookmarks.save(b));
    }

    @Transactional(readOnly = true)
    public List<TagCount> tags(String email) {
        return bookmarks.countTags(user(email).getId());
    }

    // ---------- helpers ----------

    private User user(String email) {
        return users.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private Bookmark owned(Long id, Long userId) {
        // Looking up by id AND user means other people's bookmarks look like they don't exist.
        return bookmarks.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Bookmark not found"));
    }

    private void apply(Bookmark b, BookmarkRequest req) {
        b.setUrl(req.url().trim());
        b.setTitle(req.title().trim());
        b.setDescription(blankToNull(req.description()));
        b.setCategory(blankToNull(req.category()));
        b.setFavorite(req.favorite());
        b.getTags().clear();
        b.getTags().addAll(normalizeTags(req.tags()));
    }

    private Set<String> normalizeTags(List<String> raw) {
        Set<String> tags = new LinkedHashSet<>();
        if (raw != null) {
            for (String t : raw) {
                if (t == null) continue;
                String n = t.trim().toLowerCase().replaceFirst("^#", "");
                if (!n.isEmpty()) tags.add(n);
            }
        }
        return tags;
    }

    private String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
