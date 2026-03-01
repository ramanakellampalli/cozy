"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import type { NavItem } from "@/types";

const ownerNavItems: NavItem[] = [
  { label: "Dashboard",  href: "/owner/dashboard",  icon: LayoutDashboard },
  { label: "Properties", href: "/owner/properties", icon: Building2 },
  { label: "Settings",   href: "/owner/settings",   icon: Settings },
];

const tenantNavItems: NavItem[] = [
  { label: "Home",     href: "/tenant/home",     icon: Home },
  { label: "Settings", href: "/tenant/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { userProfile } = useAuth();

  const navItems = userProfile?.role === "OWNER" ? ownerNavItems : tenantNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="border-t border-border/60 bg-background/95 backdrop-blur-xl safe-area-pb">
        <div className="flex h-[60px] items-center justify-around px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-1 py-1"
                >
                  <div className="relative flex h-9 w-9 items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="bottom-pill"
                        className="absolute inset-0 rounded-[10px] bg-primary/12"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "relative h-5 w-5 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
