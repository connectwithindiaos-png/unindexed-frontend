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
      setAuth(data.token, data.admin);
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
  const { isAuthenticated, token } = useAuthStore();
  return { isAuthenticated, token };
}
