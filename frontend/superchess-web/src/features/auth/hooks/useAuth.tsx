"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
  register as registerRequest,
  type AuthResponse,
  type CurrentUser,
  type LoginRequest,
  type RegisterRequest,
} from "@/features/auth/api/auth";

export type AuthState = {
  user: CurrentUser | null;
  accessToken: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<AuthResponse>;
  register: (request: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loginUser: (request: LoginRequest) => Promise<AuthResponse>;
  registerUser: (request: RegisterRequest) => Promise<AuthResponse>;
  logoutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const applyAuthResponse = useCallback((result: AuthResponse) => {
    setAccessToken(result.accessToken);
    setUser(result.user);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await loginRequest(request);
    applyAuthResponse(result);
    return result;
  }, [applyAuthResponse]);

  const register = useCallback(async (request: RegisterRequest) => {
    const result = await registerRequest(request);
    applyAuthResponse(result);
    return result;
  }, [applyAuthResponse]);

  const refreshSession = useCallback(async () => {
    const result = await refreshRequest();
    applyAuthResponse(result);
  }, [applyAuthResponse]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const result = await refreshRequest();

        if (!cancelled) {
          applyAuthResponse(result);
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [applyAuthResponse, clearSession]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    if (!accessToken) {
      await refreshSession();
      return;
    }

    try {
      const currentUser = await getMe(accessToken);
      setUser(currentUser);
    } catch {
      await refreshSession();
    }
  }, [accessToken, refreshSession]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      isReady,
      isAuthenticated: !!user && !!accessToken,
      login,
      register,
      logout,
      refreshSession,
      loginUser: login,
      registerUser: register,
      logoutUser: logout,
      refreshUser,
    }),
    [
      accessToken,
      isReady,
      login,
      logout,
      refreshSession,
      refreshUser,
      register,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
