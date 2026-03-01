"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Home, Shield, Zap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Home,
    title: "Manage Properties",
    description: "Keep all your rental properties organized in one place.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and stored securely with Firebase.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Instant notifications for rent payments, maintenance requests, and more.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
              C
            </div>
            <span className="text-lg font-bold">Cozy</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center md:py-32">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center gap-6"
          >
            <motion.div variants={item}>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                Now in beta — free to use
              </Badge>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Property management,{" "}
              <span className="text-primary">made cozy</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              Whether you're a landlord tracking multiple properties or a tenant staying on top of
              your lease, Cozy gives you everything you need — simple, fast, and on any device.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/auth">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div key={feat.title} variants={item}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-3 p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feat.title}</h3>
                      <p className="text-sm text-muted-foreground">{feat.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Cozy. Built with Next.js + Firebase.</p>
      </footer>
    </div>
  );
}
