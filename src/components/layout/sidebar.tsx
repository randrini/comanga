"use client";

import { cn } from "@/lib/utils";
import {
  Library,
  Download,
  Search,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems: { href: string; label: string; icon: typeof Library }[] = [
  { href: "/series", label: "Series", icon: Library },
  { href: "/downloads", label: "Downloads", icon: Download },
  { href: "/search", label: "Search", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/series" className="block">
          <span className="text-lg font-bold tracking-[0.2em] text-accent">
            COMANGA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-100",
                    isActive
                      ? "bg-accent/20 text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System status */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span>Online</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[220px] bg-bg-secondary border-r border-border flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-[240px] bg-bg-secondary border-r border-border flex-col z-50">
            {/* Mobile close button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="text-lg font-bold tracking-[0.2em] text-accent">
                COMANGA
              </span>
              <button
                onClick={onMobileClose}
                className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function MobileMenuButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-hover"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="18" y2="18" />
      </svg>
    </button>
  );
}
