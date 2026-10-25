package com.linkvault.controller;

import com.linkvault.dto.TagCount;
import com.linkvault.service.BookmarkService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final BookmarkService service;

    public TagController(BookmarkService service) {
        this.service = service;
    }

    @GetMapping
    public List<TagCount> tags(Authentication auth) {
        return service.tags(auth.getName());
    }
}
