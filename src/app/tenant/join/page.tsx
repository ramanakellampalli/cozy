"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/hooks/use-toast";
import { validateInvite, joinProperty, updateUserActiveProperty, updateUserProfile } from "@/lib/db";

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 text-xs text-muted-foreground">(optional)</span>}
      </label>
      {children}
    </div>
  );
}

export default function TenantJoin() {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const { loading } = useRequireAuth("TENANT");
  const router = useRouter();
  const { toast } = useToast();

  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Already in a property — redirect
  useEffect(() => {
    if (!loading && userProfile?.activePropertyId) {
      router.replace("/tenant/home");
    }
  }, [loading, userProfile, router]);

  const canSubmit =
    code.trim().length === 9 &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phone.trim().length > 0 &&
    !isSubmitting;

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !canSubmit) return;

    const trimmedCode = code.trim().toUpperCase();
    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      aadhar: aadhar.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const invite = await validateInvite(trimmedCode);
      if (!invite) {
        toast({
          title: "Invalid or expired code",
          description: "Check the code and try again.",
          variant: "destructive",
        });
        return;
      }

      // Save profile to user doc + tenant record simultaneously
      await Promise.all([
        updateUserProfile(currentUser.uid, profile),
        joinProperty(currentUser.uid, currentUser.email ?? "", invite.propertyId, invite.requireApproval, profile),
      ]);
      await updateUserActiveProperty(currentUser.uid, invite.propertyId);
      await refreshProfile();

      if (invite.requireApproval) {
        toast({ title: "Request sent!", description: "Waiting for owner approval." });
        router.replace("/tenant/pending");
      } else {
        toast({ title: "Joined! Welcome aboard." });
        router.replace("/tenant/home");
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
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Icon + heading */}
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">Join a Property</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Enter your details and the join code your owner shared.
        </p>

        <form onSubmit={handleJoin} className="flex flex-col gap-5">
          {/* Join code */}
          <Field label="Join code">
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
          </Field>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Your details</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input
                placeholder="Ravi"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Last name">
              <Input
                placeholder="Kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </Field>
          </div>

          <Field label="Phone number">
            <Input
              type="tel"
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </Field>

          <Field label="Aadhar number" optional>
            <Input
              placeholder="XXXX XXXX XXXX"
              value={aadhar}
              onChange={(e) => setAadhar(e.target.value.replace(/\D/g, "").slice(0, 12))}
              inputMode="numeric"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Used for identity verification by the property owner.
            </p>
          </Field>

          <Button
            type="submit"
            className="mt-1 h-11 w-full rounded-xl text-[15px]"
            disabled={!canSubmit}
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
