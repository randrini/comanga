"use client";

import { cn } from "@/lib/utils";
import { Search, Bell, Activity } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface HeaderProps {
  mobileMenuButton?: React.ReactNode;
}

export function Header({ mobileMenuButton }: HeaderProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [{ label: "Home", href: "/" }];

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, href };
    });
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 h-12 bg-bg-secondary border-b border-border flex items-center px-4 gap-3">
      {/* Mobile menu button */}
      {mobileMenuButton}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-text-muted min-w-0 flex-1">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="text-border select-none">/</span>
            )}
            <span
              className={cn(
                "truncate",
                index === breadcrumbs.length - 1
                  ? "text-text-primary font-medium"
                  : "hover:text-text-secondary transition-colors",
              )}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Global search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="w-40 lg:w-56 h-7 pl-7 pr-2 text-xs bg-bg-primary border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Notification bell */}
        <button className="relative p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white leading-none">
            3
          </span>
        </button>

        {/* Activity / download progress */}
        <button className="relative p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors">
          <Activity className="h-4 w-4" />
          <svg
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 -rotate-90"
            viewBox="0 0 16 16"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-bg-hover"
            />
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="37.7"
              strokeDashoffset="15"
              className="text-accent"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
