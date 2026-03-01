"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/hooks/use-toast";
import { validateInvite, joinProperty, updateUserActiveProperty } from "@/lib/db";

export default function TenantJoin() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const { loading } = useRequireAuth("TENANT");
  const router = useRouter();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already in a property — redirect
  if (!loading && userProfile?.activePropertyId) {
    router.replace("/tenant/home");
    return null;
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const invite = await validateInvite(trimmed);
      if (!invite) {
        toast({
          title: "Invalid or expired code",
          description: "Check the code and try again.",
          variant: "destructive",
        });
        return;
      }

      const status = await joinProperty(
        currentUser.uid,
        currentUser.email ?? "",
        invite.propertyId,
        invite.requireApproval
      );
      await updateUserActiveProperty(currentUser.uid, invite.propertyId);
      await refreshProfile();

      if (status === "ACTIVE") {
        toast({ title: "Joined! Welcome aboard." });
        router.replace("/tenant/home");
      } else {
        toast({ title: "Request sent!", description: "Waiting for owner approval." });
        router.replace("/tenant/pending");
      }
    } catch (err: unknown) {
      toast({
        title: "Failed to join",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>

        <h1 className="mb-2 text-2xl font-bold">Join a Property</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Enter the join code your property owner shared with you.
        </p>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Join code</label>
            <Input
              placeholder="COZY-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="h-12 text-center text-lg font-bold tracking-widest"
              maxLength={9}
              autoComplete="off"
              autoCapitalize="characters"
            />
            <p className="text-xs text-muted-foreground">Format: COZY-XXXX</p>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-xl text-[15px]"
            disabled={isSubmitting || code.trim().length < 9}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Join Property
                <ArrowRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have a code? Ask your property owner.
        </p>
      </motion.div>
    </div>
  );
}
