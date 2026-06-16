"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => authApi.login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, { admin: data.admin, role: "admin" });
      router.push("/dashboard");
    },
  });
}

export function useTokenLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token }: { token: string }) => authApi.tokenLogin(token),
    onSuccess: (data) => {
      setAuth(data.token, { user: data.user, role: "user" });
      router.push("/dashboard");
    },
  });
}

export function useVerifyAuth() {
  const { token, logout } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "verify"],
    queryFn: authApi.verify,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000,
    meta: { skipAuthRedirect: true },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return () => {
    logout();
    router.push("/login");
  };
}

export function useRequireAuth() {
  const { isAuthenticated, token, role } = useAuthStore();
  return { isAuthenticated, token, role };
}
