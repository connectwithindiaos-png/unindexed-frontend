import { create } from "zustand";
import type { AuthState } from "@/types";

const AUTH_KEY = "device_mgmt_auth";

function loadAuth(): { token: string | null; admin: AuthState["admin"] | null } {
  if (typeof window === "undefined") return { token: null, admin: null };
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { token: parsed.token, admin: parsed.admin };
    }
  } catch {
    localStorage.removeItem(AUTH_KEY);
  }
  return { token: null, admin: null };
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = loadAuth();
  return {
    token: initial.token,
    admin: initial.admin,
    isAuthenticated: !!initial.token,
    setAuth: (token: string, admin: AuthState["admin"]) => {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token, admin }));
      set({ token, admin, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
      set({ token: null, admin: null, isAuthenticated: false });
    },
    initialize: () => {
      const loaded = loadAuth();
      set({
        token: loaded.token,
        admin: loaded.admin,
        isAuthenticated: !!loaded.token,
      });
    },
  };
});
