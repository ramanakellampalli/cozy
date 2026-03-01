"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Users,
  Wrench,
  Plus,
  TrendingUp,
  FileText,
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

const stats = [
  {
    label: "Properties",
    value: "4",
    change: "+1 this month",
    icon: Building2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    up: true,
  },
  {
    label: "Tenants",
    value: "11",
    change: "+2 this month",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    up: true,
  },
  {
    label: "Monthly Revenue",
    value: "$8,400",
    change: "+5.2%",
    icon: DollarSign,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    up: true,
  },
  {
    label: "Open Requests",
    value: "3",
    change: "2 urgent",
    icon: Wrench,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    up: false,
  },
];

const activityConfig: Record<string, { icon: typeof DollarSign; bg: string; color: string }> = {
  payment:     { icon: DollarSign, bg: "bg-emerald-100", color: "text-emerald-600" },
  maintenance: { icon: Wrench,     bg: "bg-orange-100",  color: "text-orange-600" },
  lease:       { icon: FileText,   bg: "bg-blue-100",    color: "text-blue-600" },
};

const recentActivity = [
  { id: 1, type: "payment",     title: "Rent received",      desc: "Unit 2B — $1,200",        time: "2h ago",  badge: "Paid",    badgeVariant: "success" as const },
  { id: 2, type: "maintenance", title: "Maintenance request", desc: "Unit 4A — Leaking faucet", time: "5h ago",  badge: "Urgent",  badgeVariant: "destructive" as const },
  { id: 3, type: "lease",       title: "Lease renewal",      desc: "Unit 1C — Jane Smith",     time: "1d ago",  badge: "Pending", badgeVariant: "secondary" as const },
  { id: 4, type: "payment",     title: "Rent received",      desc: "Unit 3B — $1,050",        time: "1d ago",  badge: "Paid",    badgeVariant: "success" as const },
];

const revenueData = [
  { month: "Aug", amount: 6800 },
  { month: "Sep", amount: 7200 },
  { month: "Oct", amount: 6500 },
  { month: "Nov", amount: 7800 },
  { month: "Dec", amount: 8100 },
  { month: "Jan", amount: 7600 },
  { month: "Feb", amount: 8400 },
];
const maxRevenue = Math.max(...revenueData.map((d) => d.amount));

/* ── Animation ────────────────────────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function OwnerDashboard() {
  const { userProfile, loading } = useRequireAuth("OWNER");
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile && !userProfile.activePropertyId) {
      router.replace("/owner/onboarding/property");
    }
  }, [loading, userProfile, router]);

  if (loading || (userProfile && !userProfile.activePropertyId)) return <LoadingState />;

  const name = userProfile?.email?.split("@")[0] ?? "Owner";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div variants={item} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting}, {name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your properties.
          </p>
        </div>
        <Button size="sm" className="shrink-0 gap-1.5 rounded-xl shadow-sm" asChild>
          <Link href="/owner/onboarding/property">
            <Plus className="h-4 w-4" />
            Add property
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="transition-all duration-200 hover:shadow-card-hover">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.iconBg}`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {stat.up && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Revenue chart */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Monthly rental income</CardDescription>
                </div>
                <span className="text-2xl font-bold text-primary">$8,400</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex h-36 items-end gap-2">
                {revenueData.map((d, i) => {
                  const isLast = i === revenueData.length - 1;
                  return (
                    <div key={d.month} className="group flex flex-1 flex-col items-center gap-1.5">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isLast ? "bg-primary" : "bg-primary/20 group-hover:bg-primary/35"
                        }`}
                        style={{ height: `${(d.amount / maxRevenue) * 100}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent activity */}
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Latest updates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
                View all <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              {recentActivity.map((a) => {
                const cfg = activityConfig[a.type];
                const Icon = cfg.icon;
                return (
                  <div key={a.id} className="flex items-center gap-3 px-6 py-3.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={a.badgeVariant} className="text-[10px]">
                        {a.badge}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
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
