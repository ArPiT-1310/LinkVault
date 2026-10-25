package com.linkvault.dto;

import com.linkvault.entity.Bookmark;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

public record BookmarkResponse(
        Long id,
        String url,
        String title,
        String description,
        String category,
        List<String> tags,
        boolean favorite,
        LocalDateTime createdAt
) {
    public static BookmarkResponse from(Bookmark b) {
        return new BookmarkResponse(
                b.getId(), b.getUrl(), b.getTitle(), b.getDescription(), b.getCategory(),
                new ArrayList<>(new TreeSet<>(b.getTags())),
                b.isFavorite(), b.getCreatedAt());
    }
}
