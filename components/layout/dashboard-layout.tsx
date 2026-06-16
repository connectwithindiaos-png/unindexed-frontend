"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuthStore } from "@/store/authStore";
import { useVerifyAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/shared/loading-spinner";

interface DashboardLayoutProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function DashboardLayout({ children, searchPlaceholder, showSearch, onSearch }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const { isLoading } = useVerifyAuth();

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xs font-mono text-emerald-600 animate-pulse">authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30" />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Header searchPlaceholder={searchPlaceholder} showSearch={showSearch} onSearch={onSearch} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
