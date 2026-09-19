package com.umg.examen.service;

import com.umg.examen.entity.LogoutReason;
import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;

import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken create(User user);
    RefreshToken rotate(String token);
    Optional<RefreshToken> revoke(String token, LogoutReason reason);
}
