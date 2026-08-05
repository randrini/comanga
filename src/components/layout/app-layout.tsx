"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, MobileMenuButton } from "./sidebar";
import { Header } from "./header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="md:pl-[220px] flex flex-col min-h-screen">
        {/* Header */}
        <Header
          mobileMenuButton={
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
          }
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
