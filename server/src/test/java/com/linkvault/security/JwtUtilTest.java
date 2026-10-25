package com.linkvault.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwt = new JwtUtil("test-secret-key-that-is-at-least-32-characters-long", 60_000);

    @Test
    void tokenRoundTripReturnsSameEmail() {
        String token = jwt.generateToken("a@b.com");
        assertTrue(jwt.isValid(token));
        assertEquals("a@b.com", jwt.extractEmail(token));
    }

    @Test
    void garbageTokenIsRejected() {
        assertFalse(jwt.isValid("not-a-token"));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        JwtUtil other = new JwtUtil("a-completely-different-secret-key-32-chars-min", 60_000);
        assertFalse(jwt.isValid(other.generateToken("a@b.com")));
    }
}
