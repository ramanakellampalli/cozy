"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getTenantRecord } from "@/lib/db";
import {
  Home,
  Calendar,
  DollarSign,
  Wrench,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/* ── Data ─────────────────────────────────────────────────────────────── */

const quickActions = [
  { label: "Pay Rent",    icon: DollarSign, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "Maintenance", icon: Wrench,     bg: "bg-orange-50",  color: "text-orange-600" },
  { label: "Documents",   icon: FileText,   bg: "bg-blue-50",    color: "text-blue-600" },
  { label: "My Lease",    icon: Calendar,   bg: "bg-violet-50",  color: "text-violet-600" },
];

const upcomingPayments = [
  { id: 1, title: "Monthly Rent", amount: "$1,200", due: "Mar 1, 2026", daysLeft: 1 },
  { id: 2, title: "Utilities",    amount: "$85",     due: "Mar 5, 2026", daysLeft: 5 },
];

const maintenanceRequests = [
  { id: 1, title: "Leaking bathroom faucet", created: "Feb 10, 2026", status: "in-progress" },
  { id: 2, title: "Heater making noise",     created: "Jan 28, 2026", status: "resolved" },
];

/* ── Animation ────────────────────────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function TenantHome() {
  const { userProfile, currentUser, loading } = useRequireAuth("TENANT");
  const router = useRouter();

  useEffect(() => {
    if (loading || !userProfile || !currentUser) return;
    if (!userProfile.activePropertyId) {
      router.replace("/tenant/join");
      return;
    }
    getTenantRecord(userProfile.activePropertyId, currentUser.uid).then((rec) => {
      if (!rec || rec.status === "PENDING_APPROVAL") router.replace("/tenant/pending");
    });
  }, [loading, userProfile, currentUser, router]);

  if (loading) return <LoadingState />;

  const name = userProfile?.email?.split("@")[0] ?? "there";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-xl">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Hello, {name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Here's your home overview.</p>
      </motion.div>

      {/* Property card */}
      <motion.div variants={item}>
        <Card className="overflow-hidden transition-all hover:shadow-card-hover">
          {/* Accent stripe */}
          <div className="h-1.5 bg-gradient-to-r from-primary to-primary/50" />
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Your unit</p>
              <p className="mt-0.5 text-lg font-bold leading-tight">Unit 2B, 42 Maple Street</p>
              <p className="text-sm text-muted-foreground">Lease ends Dec 31, 2026</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </p>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                whileTap={{ scale: 0.94 }}
                className="flex flex-col items-center gap-2.5 rounded-2xl bg-card p-3.5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.bg}`}
                >
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-[11px] font-medium leading-tight text-foreground">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming payments */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming Payments</CardTitle>
            <CardDescription>Next 30 days</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3 px-6 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{payment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {payment.due}
                    {payment.daysLeft <= 3 && (
                      <span className="ml-1.5 font-semibold text-amber-600">
                        · {payment.daysLeft}d left
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold">{payment.amount}</span>
                  <Button size="sm" className="h-8 rounded-lg px-3 text-xs shadow-sm">
                    Pay
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Maintenance */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Maintenance</CardTitle>
              <CardDescription>Your requests</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 rounded-lg text-xs shadow-sm"
            >
              <Wrench className="h-3.5 w-3.5" />
              New
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 p-0">
            {maintenanceRequests.map((req) => {
              const resolved = req.status === "resolved";
              return (
                <div key={req.id} className="flex items-center gap-3 px-6 py-4">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      resolved ? "bg-emerald-50" : "bg-amber-50"
                    }`}
                  >
                    {resolved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{req.title}</p>
                    <p className="text-xs text-muted-foreground">Submitted {req.created}</p>
                  </div>
                  <Badge
                    variant={resolved ? "success" : "warning"}
                    className="shrink-0 text-[10px]"
                  >
                    {resolved ? "Resolved" : "In Progress"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
