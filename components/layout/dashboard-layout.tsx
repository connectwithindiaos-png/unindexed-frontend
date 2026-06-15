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

export function DashboardLayout({
  children,
  searchPlaceholder,
  showSearch,
  onSearch,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const { isLoading } = useVerifyAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          onSearch={onSearch}
        />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
