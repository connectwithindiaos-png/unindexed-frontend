"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FiGrid, FiSmartphone, FiLogOut, FiChevronLeft, FiChevronRight, FiX, FiMenu, FiKey, FiShield, FiEye, FiTerminal } from "react-icons/fi";

function useSidebarNav() {
  const role = useAuthStore((s) => s.role);
  const items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean }[] = [
    { href: "/dashboard", label: "Dashboard", icon: FiGrid },
    { href: "/devices", label: "Devices", icon: FiSmartphone },
  ];
  if (role === "admin") {
    items.push(
      { href: "/admin", label: "Admin Panel", icon: FiShield },
      { href: "/admin/tokens", label: "Tokens", icon: FiKey }
    );
  }
  return items;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout();
  const navItems = useSidebarNav();
  const role = useAuthStore((s) => s.role);

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border/50">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/50 bg-emerald-950/50 group-hover:bg-emerald-900/50 transition-colors">
              <FiEye className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-sm font-bold text-emerald-400 tracking-wider">// PANEL</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/50 bg-emerald-950/50">
              <FiEye className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </Link>
        )}
        <button className="lg:hidden flex items-center justify-center h-7 w-7 rounded-md text-emerald-500/70 hover:text-emerald-400" onClick={() => setMobileOpen(false)}>
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-sidebar-border/30">
        <div className="flex items-center gap-2 text-[10px] text-emerald-600/60 tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {role === "admin" ? "ADMIN_ACCESS" : "USER_SESSION"}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                  : "text-emerald-600/70 hover:text-emerald-400 hover:bg-emerald-500/5 border-l-2 border-transparent",
                item.disabled && "pointer-events-none opacity-40",
                collapsed && "justify-center border-l-0 px-2"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && <span className="ml-auto text-[9px] text-emerald-500/50">active</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border/30 mt-auto">
        <div className="px-3 py-2 mb-1">
          <div className="flex items-center gap-2 text-[10px] text-emerald-700/50">
            <FiTerminal className="h-3 w-3" />
            <span>v3.2.1 • system ready</span>
          </div>
        </div>
        <Button variant="ghost" size="sm"
          className={cn("w-full justify-start text-emerald-600/70 hover:text-emerald-400 hover:bg-emerald-500/5", collapsed && "justify-center px-2")}
          onClick={logout}
        >
          <FiLogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-3">$ logout</span>}
        </Button>
      </div>

      <div className="p-2 hidden lg:block border-t border-sidebar-border/30">
        <Button variant="ghost" size="icon" className="w-full text-emerald-600/50 hover:text-emerald-400 hover:bg-emerald-500/5"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button className="lg:hidden fixed top-3.5 left-3 z-50 flex h-8 w-8 items-center justify-center rounded-md border border-emerald-500/30 bg-black text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.15)]"
        onClick={() => setMobileOpen(true)}>
        <FiMenu className="h-4 w-4" />
      </button>

      {mobileOpen && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={cn(
        "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-60",
        "fixed lg:static inset-y-0 left-0 z-50",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
