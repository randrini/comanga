import { Providers } from "@/app/providers";
import { AppLayout } from "@/components/layout/app-layout";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <AppLayout>{children}</AppLayout>
    </Providers>
  );
}
