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
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/owner/properties", icon: Building2 },
  { label: "Settings", href: "/owner/settings", icon: Settings },
];

const tenantNavItems: NavItem[] = [
  { label: "Home", href: "/tenant/home", icon: Home },
  { label: "Settings", href: "/tenant/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { userProfile, signOut } = useAuth();

  const navItems = userProfile?.role === "OWNER" ? ownerNavItems : tenantNavItems;

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          C
        </div>
        <span className="text-xl font-bold tracking-tight">Cozy</span>
        {userProfile && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {userProfile.role}
          </Badge>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t pt-4">
        {userProfile && (
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium">{userProfile.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {userProfile.role.toLowerCase()}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
