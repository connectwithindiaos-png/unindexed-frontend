export interface Admin {
  id: string;
  email: string;
  createdAt: string;
}

export interface TokenUser {
  id: string;
  token: string;
  name: string;
  isActive: boolean;
  deviceCount: number;
  createdAt: string;
}

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  androidVersion: string | null;
  appVersion: string | null;
  status: "online" | "offline";
  ipAddress: string | null;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  phoneNumber: string | null;
  accountEmails: string[] | null;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  registeredToday: number;
}

export interface AdminStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalTokens: number;
  activeTokens: number;
  assignedDevices: number;
}

export interface DevicesResponse {
  devices: Device[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponse {
  token: string;
  admin?: Admin;
  user?: TokenUser;
  role: "admin" | "user";
}

export interface AuthState {
  token: string | null;
  admin: Admin | null;
  user: TokenUser | null;
  role: "admin" | "user" | null;
  isAuthenticated: boolean;
  setAuth: (token: string, data: { admin?: Admin; user?: TokenUser; role: "admin" | "user" }) => void;
  logout: () => void;
  initialize: () => void;
}

export interface Token {
  id: string;
  token: string;
  name: string;
  created_by: string;
  is_active: boolean;
  device_count: number;
  created_at: string;
  updated_at: string;
}
