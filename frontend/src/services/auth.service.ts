import { AuthResponseDto, LogoutReason, LogoutRequestDto, UserResponseDto } from "@/dtos/auth.dto";
import { AuthSession, User } from "@/entities/user.entity";
import { AuthMapper } from "@/mappers/auth.mapper";
import { ApiClient } from "./api.client";
import { TokenStorage } from "./token.storage";

export class AuthService {
  static async login(credentials: { username: string; password: string }): Promise<AuthSession> {
    const dto = AuthMapper.toLoginDto(credentials);
    const response = await ApiClient.post<AuthResponseDto>("/api/auth/login", dto);
    const session = AuthMapper.toSession(response.data);

    TokenStorage.saveTokens(session.token, session.refreshToken);
    TokenStorage.saveUser(session.user);

    return session;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get<UserResponseDto>("/api/auth/me");
    return AuthMapper.toUserFromResponse(response.data);
  }

  /**
   * Notifica al backend el cierre de sesión (revoca refresh y access token) y limpia el
   * almacenamiento local. La limpieza local ocurre aunque el backend no responda.
   */
  static async logout(reason: LogoutReason = "MANUAL"): Promise<void> {
    const dto: LogoutRequestDto = { refreshToken: TokenStorage.getRefreshToken(), reason };
    try {
      if (dto.refreshToken || TokenStorage.getAccessToken()) {
        await ApiClient.post<void>("/api/auth/logout", dto);
        console.info(`[AUTH] Sesión cerrada en el backend (motivo: ${reason})`);
      }
    } catch (error: any) {
      console.warn("[AUTH] No se pudo notificar el cierre de sesión al backend:", error.message);
    } finally {
      TokenStorage.clear();
    }
  }

  static getStoredSession(): AuthSession | null {
    const token = TokenStorage.getAccessToken();
    const refreshToken = TokenStorage.getRefreshToken();
    const userStr = TokenStorage.getUser();

    if (!token || !refreshToken || !userStr) return null;

    try {
      const user = JSON.parse(userStr) as User;
      return {
        token,
        refreshToken,
        user,
        isAuthenticated: true,
        isAdmin: user.roles?.includes("ROLE_ADMIN") || false,
      };
    } catch {
      return null;
    }
  }
}
