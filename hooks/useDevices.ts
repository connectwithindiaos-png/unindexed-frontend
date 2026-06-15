"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deviceApi } from "@/services/api";
import type { DevicesResponse, Device } from "@/types";

export function useDevices(params?: {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<DevicesResponse>({
    queryKey: ["devices", params],
    queryFn: () => deviceApi.getAll(params),
    placeholderData: (prev) => prev,
  });
}

export function useDevice(id: string) {
  return useQuery<{ device: Device }>({
    queryKey: ["device", id],
    queryFn: () => deviceApi.getById(id),
    enabled: !!id,
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deviceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });
}

export function useDeviceSms(deviceId: string) {
  return useQuery({
    queryKey: ["deviceSms", deviceId],
    queryFn: () => deviceApi.getSms(deviceId),
    enabled: !!deviceId,
    refetchInterval: 3000,
  });
}

export function useDeviceContacts(deviceId: string) {
  return useQuery({
    queryKey: ["deviceContacts", deviceId],
    queryFn: () => deviceApi.getContacts(deviceId),
    enabled: !!deviceId,
    refetchInterval: 3000,
  });
}

export function useDeviceFiles(deviceId: string) {
  return useQuery({
    queryKey: ["deviceFiles", deviceId],
    queryFn: () => deviceApi.getFiles(deviceId),
    enabled: !!deviceId,
    refetchInterval: 5000,
  });
}

export function useDeviceCallLogs(deviceId: string) {
  return useQuery({
    queryKey: ["deviceCallLogs", deviceId],
    queryFn: () => deviceApi.getCallLogs(deviceId),
    enabled: !!deviceId,
    refetchInterval: 3000,
  });
}

export function useDeviceStats() {
  return useQuery({
    queryKey: ["deviceStats"],
    queryFn: () => deviceApi.getStats(),
    refetchInterval: 10000,
  });
}
