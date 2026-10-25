package com.linkvault.service;

import com.linkvault.dto.MetaResponse;
import com.linkvault.exception.ApiException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;

/** Reads a page's title and description so the user doesn't have to type them. */
@Service
public class MetadataService {

    public MetaResponse fetch(String url) {
        validate(url);
        try {
            Document doc = Jsoup.connect(url)
                    .timeout(5000)
                    .userAgent("Mozilla/5.0 (compatible; LinkVault/1.0)")
                    .followRedirects(true)
                    .get();

            String title = doc.title();
            if (title.isBlank()) title = doc.select("meta[property=og:title]").attr("content");

            String description = doc.select("meta[name=description]").attr("content");
            if (description.isBlank()) description = doc.select("meta[property=og:description]").attr("content");

            return new MetaResponse(cut(title.trim(), 255), cut(description.trim(), 1000));
        } catch (IOException | IllegalArgumentException e) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Could not read that page");
        }
    }

    /** Only public http(s) addresses are allowed, so the server can't be tricked into calling internal services. */
    private void validate(String url) {
        try {
            URI uri = URI.create(url);
            String scheme = uri.getScheme();
            if (uri.getHost() == null || scheme == null
                    || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                throw ApiException.badRequest("Enter a valid http(s) URL");
            }
            InetAddress addr = InetAddress.getByName(uri.getHost());
            if (addr.isAnyLocalAddress() || addr.isLoopbackAddress()
                    || addr.isSiteLocalAddress() || addr.isLinkLocalAddress()) {
                throw ApiException.badRequest("That address is not allowed");
            }
        } catch (IllegalArgumentException | IOException e) {
            throw ApiException.badRequest("Enter a valid http(s) URL");
        }
    }

    private String cut(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
