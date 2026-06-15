"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FiGrid,
  FiSmartphone,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiUser,
  FiX,
  FiMenu,
} from "react-icons/fi";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/devices", label: "Devices", icon: FiSmartphone },
  { href: "/settings", label: "Settings", icon: FiSettings, disabled: true },
  { href: "/profile", label: "Profile", icon: FiUser, disabled: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const logout = useLogout();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <FiSmartphone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span>DeviceMgmt</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <FiSmartphone className="h-4 w-4 text-primary-foreground" />
            </div>
          </Link>
        )}
        <button
          className="lg:hidden flex items-center justify-center h-7 w-7 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-muted text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground",
                item.disabled && "pointer-events-none opacity-50",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className="p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground",
            collapsed && "justify-center px-2"
          )}
          onClick={logout}
        >
          <FiLogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>

      <div className="p-2 hidden lg:block">
        <Button
          variant="ghost"
          size="icon"
          className="w-full text-sidebar-foreground/70 hover:bg-sidebar-muted"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <FiChevronRight className="h-4 w-4" />
          ) : (
            <FiChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-3.5 left-3 z-50 flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <FiMenu className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-60",
          "fixed lg:static inset-y-0 left-0 z-50",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
