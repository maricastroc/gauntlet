"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, type AuthUser } from "@/lib/api/client";

type Status = "loading" | "authed" | "guest";

interface AuthValue {
  status: Status;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

/** localStorage key for the Sanctum bearer token. */
const TOKEN_KEY = "bracket.token";

/**
 * Session state for the organizer. The token is a Sanctum bearer token kept in
 * localStorage; on mount we validate it against `/user` and hydrate the user,
 * clearing it if the API rejects it. Reads are public, so a guest can browse
 * everything — the token only unlocks owner actions (saving a result).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        if (active) setStatus("guest");
        return;
      }
      try {
        const restored = await api.me(stored);
        if (!active) return;
        setToken(stored);
        setUser(restored);
        setStatus("authed");
      } catch {
        window.localStorage.removeItem(TOKEN_KEY);
        if (active) setStatus("guest");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const adopt = useCallback((result: { token: string; user: AuthUser }) => {
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
    setStatus("authed");
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      adopt(await api.login(email, password));
    },
    [adopt],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      adopt(await api.register(name, email, password));
    },
    [adopt],
  );

  const logout = useCallback(async () => {
    const current = token;
    setUser(null);
    setToken(null);
    setStatus("guest");
    window.localStorage.removeItem(TOKEN_KEY);
    if (current) {
      try {
        await api.logout(current);
      } catch {
        // best-effort; the token is already cleared locally
      }
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ status, user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
