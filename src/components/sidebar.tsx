"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, BarChart3, ClipboardList, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/check", label: "Check", icon: CheckSquare },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/review", label: "Revisión", icon: ClipboardList },
  { href: "/settings", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl z-50">
      <div className="px-6 py-6 border-b border-border/30">
        <h1 className="text-lg font-bold tracking-tight text-foreground">TresMeses</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Sistema 12 semanas</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon
                className="h-5 w-5 shrink-0"
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
