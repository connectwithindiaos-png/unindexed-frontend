export interface Admin {
  id: string;
  email: string;
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

export interface DevicesResponse {
  devices: Device[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  logout: () => void;
  initialize: () => void;
}
