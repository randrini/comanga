import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Comanga",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      {children}
    </div>
  );
}