package com.umg.examen.service.impl;

import com.umg.examen.dto.request.LoginRequest;
import com.umg.examen.dto.request.LogoutRequest;
import com.umg.examen.dto.request.RefreshTokenRequest;
import com.umg.examen.dto.response.AuthResponse;
import com.umg.examen.dto.response.UserResponse;
import com.umg.examen.entity.LogoutReason;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.RevokedAccessToken;
import com.umg.examen.entity.Role;
import com.umg.examen.entity.User;
import com.umg.examen.mapper.UserMapper;
import com.umg.examen.repository.RevokedAccessTokenRepository;
import com.umg.examen.repository.UserRepository;
import com.umg.examen.security.JwtTokenProvider;
import com.umg.examen.service.AuthService;
import com.umg.examen.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RefreshTokenService refreshTokenService;
    private final RevokedAccessTokenRepository revokedAccessTokenRepository;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           UserMapper userMapper,
                           RefreshTokenService refreshTokenService,
                           RevokedAccessTokenRepository revokedAccessTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.refreshTokenService = refreshTokenService;
        this.revokedAccessTokenRepository = revokedAccessTokenRepository;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + request.getUsername()));

        RefreshToken refreshToken = refreshTokenService.create(user);
        return userMapper.toAuthResponse(user, token, refreshToken.getToken(), tokenProvider.getJwtExpirationMs());
    }

    @Override
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.rotate(request.getRefreshToken());
        User user = refreshToken.getUser();
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();

        String token = tokenProvider.generateTokenFromUsername(user.getUsername(), roles);
        return userMapper.toAuthResponse(user, token, refreshToken.getToken(), tokenProvider.getJwtExpirationMs());
    }

    /**
     * Cierra la sesión en el servidor: revoca el refresh token (ya no podrá renovarse) y agrega
     * el access token a la lista negra si aún está vigente. Es idempotente.
     */
    @Override
    @Transactional
    public void logout(LogoutRequest request, String accessToken) {
        LogoutReason reason = request.getReason() != null ? request.getReason() : LogoutReason.MANUAL;
        String username = null;

        if (StringUtils.hasText(request.getRefreshToken())) {
            username = refreshTokenService.revoke(request.getRefreshToken(), reason)
                    .map(rt -> rt.getUser().getUsername())
                    .orElse(null);
        }

        if (StringUtils.hasText(accessToken)) {
            var claims = tokenProvider.parseClaims(accessToken);
            if (claims.isPresent() && claims.get().getId() != null
                    && !revokedAccessTokenRepository.existsByJti(claims.get().getId())) {
                LocalDateTime expiresAt = LocalDateTime.ofInstant(claims.get().getExpiration().toInstant(), ZoneId.systemDefault());
                username = claims.get().getSubject();
                revokedAccessTokenRepository.save(new RevokedAccessToken(claims.get().getId(), username, reason, expiresAt));
            }
        }

        log.info("Cierre de sesión registrado - usuario: {}, motivo: {}", username != null ? username : "desconocido", reason);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
        return userMapper.toResponse(user);
    }
}
