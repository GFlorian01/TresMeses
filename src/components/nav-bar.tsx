"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, BarChart3, ClipboardList, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/check", label: "Check", icon: CheckSquare },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/review", label: "Revision", icon: ClipboardList },
  { href: "/settings", label: "Config", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/80 backdrop-blur-xl border-t border-border/50">
        <div className="max-w-lg mx-auto flex">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-200 relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
