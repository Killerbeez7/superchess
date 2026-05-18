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
  login,
  register,
  type AuthResponse,
  type CurrentUser,
  type LoginRequest,
  type RegisterRequest,
} from "@/features/auth/api/auth";
import { clearAuthToken, getAuthToken, saveAuthToken } from "@/lib/storage/authToken";

type AuthContextValue = {
  user: CurrentUser | null;
  accessToken: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  loginUser: (request: LoginRequest) => Promise<AuthResponse>;
  registerUser: (request: RegisterRequest) => Promise<AuthResponse>;
  logoutUser: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getAuthToken();

      if (!token) {
        setIsReady(true);
        return;
      }

      try {
        const currentUser = await getMe(token);

        if (!cancelled) {
          setAccessToken(token);
          setUser(currentUser);
        }
      } catch {
        clearAuthToken();

        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
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
  }, []);

  const loginUser = useCallback(async (request: LoginRequest) => {
    const result = await login(request);
    saveAuthToken(result.accessToken);
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result;
  }, []);

  const registerUser = useCallback(async (request: RegisterRequest) => {
    const result = await register(request);
    saveAuthToken(result.accessToken);
    setAccessToken(result.accessToken);
    setUser(result.user);
    return result;
  }, []);

  const logoutUser = useCallback(() => {
    clearAuthToken();
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isReady,
      isAuthenticated: !!user && !!accessToken,
      loginUser,
      registerUser,
      logoutUser,
    }),
    [accessToken, isReady, loginUser, logoutUser, registerUser, user]
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
