"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/components/providers/AuthProvider";

const PUBLIC_PATHS = ["/", "/auth", "/home"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, userProfile } = useAuth();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const showNav = currentUser && !isPublicPath;

  if (!showNav) return <>{children}</>;

  const initial = userProfile?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Content area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm">
              C
            </div>
            <span className="text-[17px] font-semibold">Cozy</span>
          </div>

          {userProfile && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
              {initial}
            </div>
          )}
        </header>

        {/* Page content */}
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-5 pb-24 md:p-8 md:pb-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
