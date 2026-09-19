// Almacenamiento centralizado de credenciales en el navegador.
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const isBrowser = () => typeof window !== "undefined";

export const TokenStorage = {
  getAccessToken(): string | null {
    return isBrowser() ? localStorage.getItem(TOKEN_KEY) : null;
  },

  getRefreshToken(): string | null {
    return isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  },

  getUser(): string | null {
    return isBrowser() ? localStorage.getItem(USER_KEY) : null;
  },

  saveTokens(accessToken: string, refreshToken: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  saveUser(user: unknown): void {
    if (isBrowser()) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Milisegundos restantes antes de que expire el JWT de acceso (lee el claim `exp`). */
  getAccessTokenRemainingMs(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return typeof payload.exp === "number" ? payload.exp * 1000 - Date.now() : null;
    } catch {
      return null;
    }
  },
};

/** Evento global emitido cuando la sesión ya no puede renovarse. */
export const SESSION_EXPIRED_EVENT = "auth:session-expired";
