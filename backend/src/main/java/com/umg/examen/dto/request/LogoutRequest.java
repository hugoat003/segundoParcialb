package com.umg.examen.dto.request;

import com.umg.examen.entity.LogoutReason;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Petición de cierre de sesión")
public class LogoutRequest {

    @Schema(description = "Refresh token de la sesión a cerrar")
    private String refreshToken;

    @Schema(description = "Motivo del cierre de sesión", example = "INACTIVITY")
    private LogoutReason reason = LogoutReason.MANUAL;

    public LogoutRequest() {}

    public LogoutRequest(String refreshToken, LogoutReason reason) {
        this.refreshToken = refreshToken;
        this.reason = reason;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public LogoutReason getReason() {
        return reason;
    }

    public void setReason(LogoutReason reason) {
        this.reason = reason;
    }
}
