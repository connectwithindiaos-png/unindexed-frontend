"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/useAuth";
import { FiSearch, FiLogOut, FiTerminal, FiClock } from "react-icons/fi";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

export function Header({ onSearch, searchPlaceholder = "Search devices...", showSearch = true }: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");
  const { admin, user, role } = useAuthStore();
  const logout = useLogout();

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const displayName = admin?.email?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U";
  const displayLabel = role === "admin" ? "admin" : "user";
  const displayEmail = admin?.email || user?.name || "";

  return (
    <header className="flex h-14 items-center gap-3 border-b border-emerald-900/30 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/80 px-4 sm:px-6">
      <div className="lg:hidden w-8" />

      {showSearch && (
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-emerald-950/30 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-700 h-9 text-xs focus-visible:ring-emerald-500/30"
          />
        </div>
      )}

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-emerald-700/60 font-mono mr-2">
          <FiClock className="h-3 w-3" />
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            system online
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-md border border-emerald-900/40 hover:bg-emerald-950/30 hover:border-emerald-700/50 transition-all">
              <div className="flex h-7 w-7 items-center justify-center text-xs font-mono text-emerald-400">
                {displayName}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-emerald-900/30 bg-black shadow-[0_0_20px_rgba(52,211,153,0.08)]">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-mono text-emerald-400">[{displayLabel}]</span>
                <span className="text-xs text-emerald-600 font-mono">{displayEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-emerald-900/30" />
            <DropdownMenuItem onClick={logout} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 font-mono text-xs">
              <FiLogOut className="mr-2 h-4 w-4" />
              $ logout --force
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
