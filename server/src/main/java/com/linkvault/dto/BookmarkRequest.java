package com.linkvault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record BookmarkRequest(
        @NotBlank(message = "URL is required")
        @Size(max = 2048, message = "URL is too long")
        @Pattern(regexp = "^https?://.+", message = "URL must start with http:// or https://")
        String url,

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be 255 characters or fewer")
        String title,

        @Size(max = 1000, message = "Description must be 1000 characters or fewer")
        String description,

        @Size(max = 100, message = "Category is too long")
        String category,

        List<@Size(max = 50, message = "Tags must be 50 characters or fewer") String> tags,

        boolean favorite
) {}
