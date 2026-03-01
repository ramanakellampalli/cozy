"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/hooks/use-toast";
import { getTenantRecord, getProperty } from "@/lib/db";

export default function TenantPending() {
  const { currentUser, signOut } = useAuth();
  const { userProfile, loading } = useRequireAuth("TENANT");
  const router = useRouter();
  const { toast } = useToast();

  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!userProfile?.activePropertyId) return;
    getProperty(userProfile.activePropertyId).then((p) => {
      if (p && "name" in p) setPropertyName(p.name as string);
    });
  }, [userProfile]);

  async function checkStatus() {
    if (!currentUser || !userProfile?.activePropertyId) return;
    setChecking(true);
    try {
      const rec = await getTenantRecord(userProfile.activePropertyId, currentUser.uid);
      if (rec?.status === "ACTIVE") {
        toast({ title: "You're approved! Welcome." });
        router.replace("/tenant/home");
      } else if (rec?.status === "REJECTED") {
        toast({
          title: "Request rejected",
          description: "Contact your property owner for more details.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Still pending", description: "Check back soon." });
      }
    } catch {
      toast({ title: "Error checking status", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/home");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm text-center"
      >
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>

        <h1 className="mb-2 text-2xl font-bold">Waiting for Approval</h1>
        <p className="mb-2 text-sm text-muted-foreground">
          Your request to join has been sent.
        </p>
        {propertyName && (
          <p className="mb-8 text-sm font-medium text-foreground">
            Property: {propertyName}
          </p>
        )}

        <Card className="mb-6 border-border/60 shadow-card">
          <CardContent className="p-5 text-left text-sm text-muted-foreground">
            The property owner will review your request and approve or reject it. You&apos;ll be
            able to access the app once approved.
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            className="h-11 w-full rounded-xl gap-2"
            onClick={checkStatus}
            disabled={checking}
          >
            {checking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {checking ? "Checking…" : "Refresh Status"}
          </Button>

          <Button
            variant="ghost"
            className="h-11 w-full rounded-xl gap-2 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
