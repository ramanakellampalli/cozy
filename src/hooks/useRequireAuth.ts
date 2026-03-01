"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { UserRole } from "@/types";

/**
 * Redirect unauthenticated users to /auth.
 * Optionally enforce a required role; redirects to the wrong-role page otherwise.
 */
export function useRequireAuth(requiredRole?: UserRole) {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.replace("/auth");
      return;
    }
    if (requiredRole && userProfile && userProfile.role !== requiredRole) {
      // Send owner to owner dashboard and tenant to tenant home
      const redirect = userProfile.role === "OWNER" ? "/owner/dashboard" : "/tenant/home";
      router.replace(redirect);
    }
  }, [loading, currentUser, userProfile, requiredRole, router]);

  return { currentUser, userProfile, loading };
}
