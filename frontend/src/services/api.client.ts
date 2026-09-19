import { ApiResponseDto, AuthResponseDto } from "@/dtos/auth.dto";
import { SESSION_EXPIRED_EVENT, TokenStorage } from "./token.storage";

// Todas las peticiones van al BFF de Next.js (mismo origen); él las reenvía al backend.
const API_BASE_URL = "";

// Si al access token le quedan menos de estos ms, se renueva antes de enviar la petición
const REFRESH_THRESHOLD_MS = 15_000;

// Endpoints que no deben disparar el flujo de renovación
const AUTH_ENDPOINTS = ["/api/auth/login", "/api/auth/refresh"];

class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export class ApiClient {
  // Una sola renovación en curso compartida por todas las peticiones concurrentes
  private static refreshPromise: Promise<boolean> | null = null;

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponseDto<T>> {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => path.startsWith(p));

    if (!isAuthEndpoint && TokenStorage.getRefreshToken()) {
      const remaining = TokenStorage.getAccessTokenRemainingMs();
      if (remaining !== null && remaining < REFRESH_THRESHOLD_MS) {
        console.info(`[AUTH] Access token por expirar (${Math.round(remaining / 1000)}s), renovando...`);
        await this.refreshAccessToken();
      }
    }

    try {
      return await this.send<T>(path, options);
    } catch (error: any) {
      if (error instanceof HttpError && error.status === 401 && !isAuthEndpoint && TokenStorage.getRefreshToken()) {
        console.info("[AUTH] Respuesta 401, intentando renovar el access token...");
        if (await this.refreshAccessToken()) {
          return this.send<T>(path, options);
        }
      }
      console.error(`[API ERROR] ${options.method || "GET"} ${path}:`, error.message);
      throw error;
    }
  }

  /**
   * Solicita un nuevo par de tokens con el refresh token. Si falla (expirado o revocado),
   * limpia la sesión y notifica a la aplicación para redirigir al login.
   */
  static refreshAccessToken(): Promise<boolean> {
    if (!this.refreshPromise) {
      this.refreshPromise = (async () => {
        const refreshToken = TokenStorage.getRefreshToken();
        if (!refreshToken) return false;
        try {
          const response = await this.send<AuthResponseDto>("/api/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
          });
          TokenStorage.saveTokens(response.data.token, response.data.refreshToken);
          console.info("[AUTH] Access token renovado correctamente");
          return true;
        } catch {
          console.warn("[AUTH] Refresh token expirado o revocado, cerrando sesión");
          TokenStorage.clear();
          window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
          return false;
        }
      })().finally(() => {
        this.refreshPromise = null;
      });
    }
    return this.refreshPromise;
  }

  private static async send<T>(path: string, options: RequestInit): Promise<ApiResponseDto<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Login y refresh no llevan el access token (puede estar vencido)
    const token = AUTH_ENDPOINTS.some((p) => path.startsWith(p)) ? null : TokenStorage.getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `Error HTTP ${response.status}: ${response.statusText}`;
      throw new HttpError(errorMsg, response.status);
    }

    return data as ApiResponseDto<T>;
  }

  static get<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  static post<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: any): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string): Promise<ApiResponseDto<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
