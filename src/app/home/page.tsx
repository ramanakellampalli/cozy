"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Shield, Zap, User, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";

const features = [
  {
    icon: Building2,
    title: "All your properties, one place",
    description: "Track occupancy, manage units, and keep documents organized — no spreadsheets needed.",
  },
  {
    icon: Shield,
    title: "Secure & role-based",
    description: "Owners see the full picture. Tenants see only their own lease, payments, and requests.",
  },
  {
    icon: Zap,
    title: "Real-time by default",
    description: "Rent payments, maintenance updates and lease changes sync instantly across all devices.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function HomePage() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!currentUser || !userProfile) return;
    if (userProfile.role === "OWNER") {
      router.replace(userProfile.activePropertyId ? "/owner/dashboard" : "/owner/onboarding/property");
    } else {
      router.replace(userProfile.activePropertyId ? "/tenant/home" : "/tenant/join");
    }
  }, [loading, currentUser, userProfile, router]);

  if (loading || (currentUser && !userProfile)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-bold text-sm text-white shadow-sm">
              C
            </div>
            <span className="text-[17px] font-semibold">Cozy</span>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/auth?mode=signin&role=OWNER">Sign in</Link>
            </Button>
            <Button size="sm" className="rounded-xl shadow-sm" asChild>
              <Link href="/owner/onboarding/property">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 60% -10%, hsl(168 44% 40% / 0.07) 0%, transparent 70%)",
            }}
          />

          <div className="mx-auto max-w-[1100px] px-5 py-20 md:py-32">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center text-center"
            >
              <motion.div variants={item} className="mb-6">
                <Badge className="gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Now in beta — free to use
                </Badge>
              </motion.div>

              <motion.h1
                variants={item}
                className="mb-5 max-w-[760px] text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-[72px]"
              >
                Property management,{" "}
                <span className="text-primary">made cozy</span>
              </motion.h1>

              <motion.p
                variants={item}
                className="mb-12 max-w-[480px] text-lg leading-relaxed text-muted-foreground"
              >
                Whether you own multiple units or rent one — Cozy keeps everything clear, calm, and
                always in sync.
              </motion.p>

              {/* ── 3 CTAs ── */}
              <motion.div
                variants={item}
                className="mb-6 grid w-full max-w-[560px] grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {/* Owner card */}
                <Card className="border-border/60 shadow-card transition-all hover:shadow-card-hover">
                  <CardContent className="flex flex-col items-start gap-4 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Property Owner</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Manage your properties & tenants
                      </p>
                    </div>
                    <Button className="w-full rounded-xl" asChild>
                      <Link href="/auth?mode=signin&role=OWNER">Login as Owner</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Tenant card */}
                <Card className="border-border/60 shadow-card transition-all hover:shadow-card-hover">
                  <CardContent className="flex flex-col items-start gap-4 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
                      <User className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">Tenant</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Track rent, lease & maintenance
                      </p>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl" asChild>
                      <Link href="/auth?mode=signin&role=TENANT">Login as Tenant</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Link
                  href="/owner/onboarding/property"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Register a Property
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-[1100px] px-5 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Features
            </p>
            <h2 className="text-3xl font-extrabold md:text-4xl">Everything you actually need</h2>
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              No bloat. Just the tools that matter for managing properties and tenancies day-to-day.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-5 sm:grid-cols-3"
          >
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.title} variants={item}>
                  <Card className="group h-full border-border/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <CardContent className="flex flex-col gap-5 p-7">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-2 font-semibold text-foreground">{feat.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {feat.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* ── CTA banner ── */}
        <section className="mx-auto max-w-[1100px] px-5 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center"
          >
            <h2 className="mb-3 text-3xl font-extrabold text-white md:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mb-8 max-w-sm text-base text-white/70">
              Join property owners and tenants already using Cozy.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-12 rounded-xl px-10 text-[15px] font-semibold text-primary shadow-sm"
              asChild
            >
              <Link href="/owner/onboarding/property">Register a Property</Link>
            </Button>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 px-5 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-white">
              C
            </div>
            <span className="font-medium text-foreground">Cozy</span>
          </div>
          <p>© {new Date().getFullYear()} Cozy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
