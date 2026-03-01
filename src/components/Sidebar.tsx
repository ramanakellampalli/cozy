"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutDashboard, LogOut, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/types";

const ownerNavItems: NavItem[] = [
  { label: "Dashboard",   href: "/owner/dashboard",  icon: LayoutDashboard },
  { label: "Properties",  href: "/owner/properties", icon: Building2 },
  { label: "Settings",    href: "/owner/settings",   icon: Settings },
];

const tenantNavItems: NavItem[] = [
  { label: "Home",     href: "/tenant/home",     icon: Home },
  { label: "Settings", href: "/tenant/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile, signOut } = useAuth();

  const navItems = userProfile?.role === "OWNER" ? ownerNavItems : tenantNavItems;
  const initial = userProfile?.email?.[0]?.toUpperCase() ?? "U";
  const username = userProfile?.email?.split("@")[0] ?? "User";

  return (
    <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5">
      {/* Logo */}
      <div className="mb-7 flex items-center gap-2.5 px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-sm text-white shadow-sm">
          C
        </div>
        <span className="text-[17px] font-semibold">Cozy</span>
      </div>

      {/* Role badge */}
      {userProfile && (
        <div className="mb-4 px-3">
          <Badge className="rounded-full border-0 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {userProfile.role}
          </Badge>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-sidebar-foreground/40"
                  )}
                />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border pt-3">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-sidebar-foreground">{username}</p>
            <p className="text-[11px] capitalize text-muted-foreground">
              {userProfile?.role?.toLowerCase()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => signOut()}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
