"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { CommandSearch } from "@/components/command-search";

const PUBLIC_ROUTES = ["/login", "/auth", "/leave/approve"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="lg:ml-[260px] min-h-screen">{children}</main>
      <CommandSearch />
    </>
  );
}
