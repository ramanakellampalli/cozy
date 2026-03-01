"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import type { NavItem } from "@/types";

const ownerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/owner/properties", icon: Building2 },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

const tenantNavItems: NavItem[] = [
  { label: "Home", href: "/tenant/home", icon: Home },
  { label: "Settings", href: "/tenant/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  const navItems = userProfile?.role === "OWNER" ? ownerNavItems : tenantNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-card/95 backdrop-blur-md md:hidden safe-area-pb">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -inset-1.5 rounded-full bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
