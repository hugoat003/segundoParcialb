package com.umg.examen.service.impl;

import com.umg.examen.entity.LogoutReason;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;
import com.umg.examen.exception.InvalidRefreshTokenException;
import com.umg.examen.repository.RefreshTokenRepository;
import com.umg.examen.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms:86400000}")
    private long refreshExpirationMs;

    public RefreshTokenServiceImpl(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public RefreshToken create(User user) {
        String token = UUID.randomUUID() + "-" + UUID.randomUUID();
        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000);
        return refreshTokenRepository.save(new RefreshToken(token, user, expiresAt));
    }

    /**
     * Política de rotación: cada refresh token es de un solo uso. Al renovar se revoca el
     * token presentado y se emite uno nuevo. Un token revocado o expirado es rechazado.
     */
    @Override
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public RefreshToken rotate(String token) {
        RefreshToken current = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token inválido"));

        if (current.getRevoked()) {
            throw new InvalidRefreshTokenException("Refresh token revocado");
        }
        if (current.isExpired()) {
            current.revoke("EXPIRED");
            throw new InvalidRefreshTokenException("Refresh token expirado, inicie sesión nuevamente");
        }

        current.revoke("ROTATED");
        return create(current.getUser());
    }

    @Override
    @Transactional
    public Optional<RefreshToken> revoke(String token, LogoutReason reason) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        refreshToken.filter(rt -> !rt.getRevoked()).ifPresent(rt -> rt.revoke(reason.name()));
        return refreshToken;
    }
}
