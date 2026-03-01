"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/components/providers/AuthProvider";

// Pages that don't need the app shell nav
const PUBLIC_PATHS = ["/", "/auth"];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const showNav = currentUser && !isPublicPath;

  if (!showNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar — mobile only */}
        <header className="flex h-14 items-center border-b bg-card px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
              C
            </div>
            <span className="text-lg font-bold">Cozy</span>
          </div>
        </header>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
