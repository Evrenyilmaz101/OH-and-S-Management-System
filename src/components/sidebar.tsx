"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Menu,
  X,
  HardHat,
  ChevronDown,
  Library,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "MAIN",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "PERSONNEL",
    items: [
      { href: "/personnel", label: "Employee Files", icon: Users },
    ],
  },
  {
    label: "DOCUMENTATION",
    items: [
      { href: "/company-documentation", label: "Company Docs", icon: Library },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

function NavGroupSection({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate: () => void;
}) {
  const hasActive = group.items.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );
  const [open, setOpen] = useState(
    group.label === "MAIN" || hasActive
  );

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-1.5 text-[10px] font-semibold tracking-[0.15em] text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
      >
        {group.label}
        <ChevronDown
          className={cn(
            "w-3 h-3 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="space-y-0.5 px-2">
          {group.items.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-1.5 rounded text-[13px] transition-all duration-100",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-l-amber-500 ml-0 pl-2.5"
                    : "text-sidebar-foreground/60 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 border-l-[3px] border-l-transparent"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-amber-500" : "text-sidebar-foreground/40"
                  )}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <>
      {/* Branding */}
      <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-amber-500/15">
            <HardHat className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-[13px] font-bold tracking-[0.08em] text-white">
              THORNTON
            </h1>
            <p className="text-[9px] tracking-[0.15em] text-sidebar-foreground/40 uppercase">
              Engineering
            </p>
          </div>
        </div>
        <p className="text-[9px] tracking-[0.1em] text-sidebar-foreground/30 mt-2 uppercase">
          OH&S Management System
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {navGroups.map((group) => (
          <NavGroupSection
            key={group.label}
            group={group}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[9px] tracking-[0.1em] text-sidebar-foreground/30 uppercase">
          Vessel Fabrication Shop — VIC
        </p>
        <p className="text-[9px] text-sidebar-foreground/20 mt-0.5">
          Ctrl+K to search
        </p>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 p-2 rounded bg-card text-foreground lg:hidden border border-border"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-[260px] bg-sidebar flex flex-col border-r border-sidebar-border transition-transform duration-200",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
