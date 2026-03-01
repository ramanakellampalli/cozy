"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, CheckCircle, Building2, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

const brandFeatures = [
  "Manage multiple properties in one dashboard",
  "Real-time rent tracking and reminders",
  "Tenant maintenance request system",
  "Secure, role-based access for everyone",
];

const roles: { role: UserRole; icon: typeof User; title: string; desc: string }[] = [
  { role: "TENANT", icon: User, title: "I'm a Renter", desc: "Manage my lease & payments" },
  { role: "OWNER", icon: Building2, title: "I'm an Owner", desc: "Manage my properties" },
];

export default function AuthPage() {
  const { signIn, signUp, currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<UserRole>("TENANT");

  useEffect(() => {
    if (!loading && currentUser && userProfile) {
      router.replace(userProfile.role === "OWNER" ? "/owner/dashboard" : "/tenant/home");
    }
  }, [loading, currentUser, userProfile, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(signInEmail, signInPassword);
      toast({ title: "Welcome back!" });
    } catch (err: unknown) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (signUpPassword.length < 6) {
      toast({ title: "Password too short", description: "At least 6 characters required.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(signUpEmail, signUpPassword, signUpRole);
      toast({ title: "Account created!", description: "Setting up your workspace…" });
    } catch (err: unknown) {
      toast({
        title: "Sign up failed",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel (desktop only) ─────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[420px] xl:w-[460px] flex-col justify-between overflow-hidden bg-primary p-10">
        {/* Background texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-white">
            C
          </div>
          <span className="text-xl font-semibold text-white">Cozy</span>
        </div>

        {/* Copy */}
        <div className="relative">
          <h2 className="mb-3 text-3xl font-extrabold leading-tight text-white">
            Property management for real life
          </h2>
          <p className="mb-8 text-base leading-relaxed text-white/65">
            Track rent, handle maintenance, and stay on top of your lease — all from your phone.
          </p>

          <ul className="flex flex-col gap-3">
            {brandFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/75">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/35">© {new Date().getFullYear()} Cozy</p>
      </div>

      {/* ── Form panel ────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-5 py-12 sm:px-10">
        {/* Back button */}
        <Link
          href="/"
          className="absolute left-5 top-5 sm:left-8 sm:top-6 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white shadow-md">
            C
          </div>
          <p className="text-sm text-muted-foreground">Property management, simplified</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-7">
            <h1 className="text-2xl font-bold">Get started</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in or create your account below.
            </p>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="mb-7 w-full rounded-xl bg-muted">
              <TabsTrigger value="signin" className="flex-1 rounded-lg text-sm">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1 rounded-lg text-sm">
                Create account
              </TabsTrigger>
            </TabsList>

            {/* ── Sign in ── */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="flex flex-col gap-5">
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field label="Password">
                  <PasswordInput
                    value={signInPassword}
                    onChange={setSignInPassword}
                    show={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </Field>
                <Button type="submit" className="mt-1 h-11 w-full rounded-xl text-[15px]" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            {/* ── Sign up ── */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="flex flex-col gap-5">
                <Field label="Email">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>
                <Field label="Password">
                  <PasswordInput
                    value={signUpPassword}
                    onChange={setSignUpPassword}
                    show={showPassword}
                    onToggle={() => setShowPassword((p) => !p)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                  />
                </Field>

                {/* Role picker */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">I am a…</label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map(({ role, icon: Icon, title, desc }) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSignUpRole(role)}
                        className={cn(
                          "flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-150",
                          signUpRole === role
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80 hover:bg-muted/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                            signUpRole === role ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              signUpRole === role ? "text-primary" : "text-foreground"
                            )}
                          >
                            {title}
                          </p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="mt-1 h-11 w-full rounded-xl text-[15px]" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Small helper components ─────────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
  autoComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
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
  );
}
