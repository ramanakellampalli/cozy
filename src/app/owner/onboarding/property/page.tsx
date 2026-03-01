"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  Loader2,
  Home,
  Users,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createProperty, generateInvite, updateUserActiveProperty } from "@/lib/db";
import type { PropertyType } from "@/types";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface WizardForm {
  // Account (step 0 — only shown when not logged in)
  email: string;
  password: string;
  // Property
  name: string;
  type: PropertyType;
  city: string;
  address: string;
  totalRooms: string;
  bedsPerRoom: string;
  defaultRent: string;
  defaultDeposit: string;
  dueDay: string;
  requireApproval: boolean;
}

const PROPERTY_TYPES: { value: PropertyType; label: string; desc: string }[] = [
  { value: "HOSTEL",   label: "Hostel",    desc: "Shared accommodation" },
  { value: "PG",       label: "PG",        desc: "Paying guest house" },
  { value: "COLIVING", label: "Co-living", desc: "Modern shared living" },
];

/* ── Step animations ────────────────────────────────────────────────────── */

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

/* ── Outer shell: waits for auth to settle before mounting inner wizard ── */

export default function PropertyOnboarding() {
  const { loading } = useAuth();
  if (loading) return <FullPageSpinner />;
  return <PropertyOnboardingInner />;
}

/* ── Inner wizard (currentUser is stable here) ───────────────────────────── */

function PropertyOnboardingInner() {
  const { currentUser, signUp, refreshProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // step 0 = account (skipped if already logged in)
  // step 1 = property basics, 2 = capacity, 3 = defaults, 4 = join settings
  const firstStep = currentUser ? 1 : 0;
  const [step, setStep] = useState(firstStep);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<WizardForm>({
    email: "",
    password: "",
    name: "",
    type: "HOSTEL",
    city: "",
    address: "",
    totalRooms: "",
    bedsPerRoom: "",
    defaultRent: "",
    defaultDeposit: "",
    dueDay: "",
    requireApproval: true,
  });

  function set<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Steps shown in the progress bar (dynamic based on auth)
  const shownSteps = currentUser
    ? ["Property Basics", "Capacity", "Defaults", "Join Settings"]
    : ["Your Account", "Property Basics", "Capacity", "Defaults", "Join Settings"];
  const shownStep = currentUser ? step - 1 : step; // 0-based index within shownSteps
  const isLastStep = step === 4;

  function canProceed(): boolean {
    if (step === 0) return form.email.trim().length > 0 && form.password.length >= 6;
    if (step === 1) return !!(form.name.trim() && form.city.trim() && form.address.trim());
    if (step === 2) return !!form.totalRooms.trim();
    return true;
  }

  async function handleNext() {
    if (step === 0) {
      // Create the owner account, then advance to property basics
      setIsSubmitting(true);
      try {
        await signUp(form.email.trim(), form.password, "OWNER");
        setStep(1);
      } catch (err: unknown) {
        toast({
          title: "Failed to create account",
          description: err instanceof Error ? err.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleComplete() {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const propertyId = await createProperty(currentUser.uid, {
        name: form.name.trim(),
        type: form.type,
        city: form.city.trim(),
        address: form.address.trim(),
        totalRooms: form.totalRooms ? parseInt(form.totalRooms) : undefined,
        bedsPerRoom: form.bedsPerRoom ? parseInt(form.bedsPerRoom) : undefined,
        defaultRent: form.defaultRent ? parseFloat(form.defaultRent) : null,
        defaultDeposit: form.defaultDeposit ? parseFloat(form.defaultDeposit) : null,
        dueDay: form.dueDay ? parseInt(form.dueDay) : null,
        requireApproval: form.requireApproval,
      });

      const code = await generateInvite(currentUser.uid, propertyId, form.requireApproval);
      await updateUserActiveProperty(currentUser.uid, propertyId);
      await refreshProfile();

      setJoinCode(code);
      setDone(true);
    } catch (err: unknown) {
      toast({
        title: "Failed to create property",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Success screen ──
  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Property Created!</h2>
          <p className="mb-8 text-muted-foreground">
            Share this code with tenants so they can join{" "}
            <span className="font-semibold text-foreground">{form.name}</span>.
          </p>

          <Card className="mb-8 border-border/60 shadow-card">
            <CardContent className="p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Join Code
              </p>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-4 py-3">
                <span className="text-2xl font-bold tracking-widest text-primary">{joinCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={copyCode}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Code expires in 7 days</p>
            </CardContent>
          </Card>

          <Button
            className="h-11 w-full rounded-xl text-[15px]"
            onClick={() => router.replace("/owner/dashboard")}
          >
            Go to Dashboard
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Wizard ──
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary font-bold text-sm text-white">
            C
          </div>
          <div>
            <h1 className="text-[17px] font-semibold">Set up your property</h1>
            <p className="text-xs text-muted-foreground">
              Step {shownStep + 1} of {shownSteps.length}
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div className="mb-8 flex gap-2">
          {shownSteps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= shownStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {step === 0 && (
              <StepAccount
                form={form}
                set={set}
                show={showPassword}
                onToggle={() => setShowPassword((p) => !p)}
              />
            )}
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && <Step2 form={form} set={set} />}
            {step === 3 && <Step3 form={form} set={set} />}
            {step === 4 && <Step4 form={form} set={set} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center gap-3">
          {step > firstStep && (
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}

          {!isLastStep ? (
            <Button
              className="h-11 flex-1 rounded-xl"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {step === 0 ? "Create Account" : "Continue"}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              className="h-11 flex-1 rounded-xl"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Generate Join Code
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Sign-in link (only on account step) */}
        {step === 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth?mode=signin&role=OWNER"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Step components ─────────────────────────────────────────────────────── */

function StepHeading({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function FieldRow({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
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

function StepAccount({
  form,
  set,
  show,
  onToggle,
}: {
  form: WizardForm;
  set: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        icon={User}
        title="Create your account"
        desc="You'll use this to manage your property and tenants."
      />

      <FieldRow label="Email">
        <Input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          autoComplete="email"
        />
      </FieldRow>

      <FieldRow label="Password">
        <div className="relative">
          <Input
            type={show ? "text" : "password"}
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.password.length > 0 && form.password.length < 6 && (
          <p className="text-xs text-destructive">At least 6 characters required</p>
        )}
      </FieldRow>
    </div>
  );
}

function Step1({
  form,
  set,
}: {
  form: WizardForm;
  set: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading icon={Building2} title="Property basics" desc="Tell us about your property." />

      <FieldRow label="Property name">
        <Input
          placeholder="e.g. Maple House"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </FieldRow>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Property type</label>
        <div className="grid grid-cols-3 gap-2">
          {PROPERTY_TYPES.map(({ value, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => set("type", value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                form.type === value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  form.type === value ? "text-primary" : "text-foreground"
                )}
              >
                {label}
              </span>
              <span className="text-[11px] text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <FieldRow label="City">
        <Input
          placeholder="e.g. Bangalore"
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
        />
      </FieldRow>

      <FieldRow label="Address">
        <textarea
          className="min-h-[80px] w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          placeholder="Full street address"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
      </FieldRow>
    </div>
  );
}

function Step2({
  form,
  set,
}: {
  form: WizardForm;
  set: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading icon={Home} title="Capacity" desc="How many rooms and beds does your property have?" />

      <FieldRow label="Total rooms">
        <Input
          type="number"
          min="1"
          placeholder="e.g. 10"
          value={form.totalRooms}
          onChange={(e) => set("totalRooms", e.target.value)}
        />
      </FieldRow>

      <FieldRow label="Beds per room" optional>
        <Input
          type="number"
          min="1"
          placeholder="e.g. 2"
          value={form.bedsPerRoom}
          onChange={(e) => set("bedsPerRoom", e.target.value)}
        />
      </FieldRow>
    </div>
  );
}

function Step3({
  form,
  set,
}: {
  form: WizardForm;
  set: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading
        icon={Users}
        title="Defaults"
        desc="Set default rent and deposit amounts. You can change these per tenant later."
      />

      <FieldRow label="Default monthly rent" optional>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
          <Input
            type="number"
            min="0"
            placeholder="0"
            className="pl-8"
            value={form.defaultRent}
            onChange={(e) => set("defaultRent", e.target.value)}
          />
        </div>
      </FieldRow>

      <FieldRow label="Default deposit" optional>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
          <Input
            type="number"
            min="0"
            placeholder="0"
            className="pl-8"
            value={form.defaultDeposit}
            onChange={(e) => set("defaultDeposit", e.target.value)}
          />
        </div>
      </FieldRow>

      <FieldRow label="Rent due day (1–31)" optional>
        <Input
          type="number"
          min="1"
          max="31"
          placeholder="e.g. 1"
          value={form.dueDay}
          onChange={(e) => set("dueDay", e.target.value)}
        />
      </FieldRow>
    </div>
  );
}

function Step4({
  form,
  set,
}: {
  form: WizardForm;
  set: <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        icon={Users}
        title="Tenant join settings"
        desc="Control how tenants join your property."
      />

      <Card className="border-border/60 shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require approval</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                New tenants need your approval before joining
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("requireApproval", !form.requireApproval)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none",
                form.requireApproval ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                  form.requireApproval ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
        After completing setup, you&apos;ll receive a join code to share with your tenants. The code
        is valid for 7 days.
      </div>
    </div>
  );
}

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
    </div>
  );
}
