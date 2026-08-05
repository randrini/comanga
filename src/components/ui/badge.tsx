"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "pending";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-hover text-text-secondary border border-border/50",
  success: "bg-success/15 text-success border border-success/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  danger: "bg-danger/15 text-danger border border-danger/20",
  info: "bg-info/15 text-info border border-info/20",
  pending: "bg-accent/15 text-accent border border-accent/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md leading-none transition-colors duration-150",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
