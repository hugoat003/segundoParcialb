package com.umg.examen.service;

import com.umg.examen.entity.RefreshToken;
import com.umg.examen.entity.User;

public interface RefreshTokenService {
    RefreshToken create(User user);
    RefreshToken rotate(String token);
}
