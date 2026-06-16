import { create } from "zustand";
import type { AuthState, Admin, TokenUser } from "@/types";

const AUTH_KEY = "device_mgmt_auth";

function loadAuth(): {
  token: string | null;
  admin: Admin | null;
  user: TokenUser | null;
  role: "admin" | "user" | null;
} {
  if (typeof window === "undefined") return { token: null, admin: null, user: null, role: null };
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        token: parsed.token,
        admin: parsed.admin,
        user: parsed.user,
        role: parsed.role,
      };
    }
  } catch {
    localStorage.removeItem(AUTH_KEY);
  }
  return { token: null, admin: null, user: null, role: null };
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = loadAuth();
  return {
    token: initial.token,
    admin: initial.admin,
    user: initial.user,
    role: initial.role,
    isAuthenticated: !!initial.token,
    setAuth: (token, data) => {
      const payload = {
        token,
        admin: data.admin || null,
        user: data.user || null,
        role: data.role,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
      set({ ...payload, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      set({ token: null, admin: null, user: null, role: null, isAuthenticated: false });
    },
    initialize: () => {
      const loaded = loadAuth();
      set({
        token: loaded.token,
        admin: loaded.admin,
        user: loaded.user,
        role: loaded.role,
        isAuthenticated: !!loaded.token,
      });
    },
  };
});
