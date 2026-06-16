"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tokenApi, adminApi } from "@/services/api";
import type { Token, AdminStats } from "@/types";

export function useTokens() {
  return useQuery<{ tokens: Token[] }>({
    queryKey: ["tokens"],
    queryFn: () => tokenApi.getAll(),
    refetchInterval: 10000,
  });
}

export function useCreateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => tokenApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useToggleToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tokenApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useDeleteToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tokenApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 10000,
  });
}
