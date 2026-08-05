"use client";

import { cn } from "@/lib/utils";
import {
  Library,
  Download,
  Search,
  Settings,
  X,
  BookOpen,
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
      <div className="px-5 py-5 border-b border-border/50">
        <Link href="/series" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent/15 border border-accent/25 group-hover:border-accent/40 transition-colors duration-200">
            <BookOpen className="h-4 w-4 text-accent" />
          </div>
          <span className="text-xl font-display tracking-[0.15em] text-text-primary group-hover:text-accent transition-colors duration-200">
            COMANGA
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        <ul className="space-y-0.5 px-3">
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
                    "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full" />
                  )}

                  {/* Active background */}
                  {isActive && (
                    <span className="absolute inset-0 bg-accent/10 rounded-lg" />
                  )}

                  {/* Hover background */}
                  <span className="absolute inset-0 bg-bg-hover/0 group-hover:bg-bg-hover/50 rounded-lg transition-colors duration-200" />

                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 relative z-10 transition-colors duration-200",
                      isActive
                        ? "text-accent"
                        : "text-text-muted group-hover:text-text-secondary",
                    )}
                  />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* System status */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span className="text-text-muted">System</span>
          <span className="text-text-secondary font-medium">Online</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-[220px] bg-bg-secondary/80 backdrop-blur-sm border-r border-border/50 flex-col z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-bg-secondary border-r border-border/50 flex-col z-50 animate-in slide-in-from-left duration-200">
            {/* Mobile close button */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-accent/15 border border-accent/25">
                  <BookOpen className="h-4 w-4 text-accent" />
                </div>
                <span className="text-xl font-display tracking-[0.15em] text-text-primary">
                  COMANGA
                </span>
              </div>
              <button
                onClick={onMobileClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
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
      className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
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
