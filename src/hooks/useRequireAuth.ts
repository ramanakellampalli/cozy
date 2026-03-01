"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import type { UserRole } from "@/types";

/**
 * Redirects unauthenticated users to /auth.
 * Optionally enforces a required role.
 * Complex within-role routing (property status, tenant status) is handled per-page.
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
      // Send to the right area for their role
      if (userProfile.role === "OWNER") {
        router.replace(userProfile.activePropertyId ? "/owner/dashboard" : "/owner/onboarding/property");
      } else {
        router.replace(userProfile.activePropertyId ? "/tenant/home" : "/tenant/join");
      }
    }
  }, [loading, currentUser, userProfile, requiredRole, router]);

  const isLoading = loading || (!!currentUser && !userProfile);
  return { loading: isLoading, currentUser, userProfile };
}
