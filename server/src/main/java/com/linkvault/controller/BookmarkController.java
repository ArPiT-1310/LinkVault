package com.linkvault.controller;

import com.linkvault.dto.BookmarkRequest;
import com.linkvault.dto.BookmarkResponse;
import com.linkvault.dto.MetaResponse;
import com.linkvault.service.BookmarkService;
import com.linkvault.service.MetadataService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService service;
    private final MetadataService metadataService;

    public BookmarkController(BookmarkService service, MetadataService metadataService) {
        this.service = service;
        this.metadataService = metadataService;
    }

    // ?search=&category=&tag=&favorite=&sort=createdAt,desc&page=0&size=10
    @GetMapping
    public Page<BookmarkResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean favorite,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication auth) {
        return service.list(auth.getName(), search, category, tag, favorite, pageable);
    }

    @GetMapping("/meta")
    public MetaResponse meta(@RequestParam String url) {
        return metadataService.fetch(url);
    }

    @PostMapping
    public ResponseEntity<BookmarkResponse> create(@Valid @RequestBody BookmarkRequest req, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(auth.getName(), req));
    }

    @PutMapping("/{id}")
    public BookmarkResponse update(@PathVariable Long id, @Valid @RequestBody BookmarkRequest req, Authentication auth) {
        return service.update(auth.getName(), id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        service.delete(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/favorite")
    public BookmarkResponse toggleFavorite(@PathVariable Long id, Authentication auth) {
        return service.toggleFavorite(auth.getName(), id);
    }
}
