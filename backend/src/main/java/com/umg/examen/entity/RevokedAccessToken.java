package com.umg.examen.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "revoked_access_tokens")
public class RevokedAccessToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 36)
    private String jti;

    @Column(nullable = false, length = 50)
    private String username;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LogoutReason reason;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at", updatable = false)
    private LocalDateTime revokedAt = LocalDateTime.now();

    public RevokedAccessToken() {}

    public RevokedAccessToken(String jti, String username, LogoutReason reason, LocalDateTime expiresAt) {
        this.jti = jti;
        this.username = username;
        this.reason = reason;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJti() {
        return jti;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LogoutReason getReason() {
        return reason;
    }

    public void setReason(LogoutReason reason) {
        this.reason = reason;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}
