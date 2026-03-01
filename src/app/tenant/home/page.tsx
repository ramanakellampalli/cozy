"use client";

import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  DollarSign,
  Wrench,
  FileText,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const quickActions = [
  { label: "Pay Rent", icon: DollarSign, color: "bg-green-500/10 text-green-600" },
  { label: "Maintenance", icon: Wrench, color: "bg-orange-500/10 text-orange-600" },
  { label: "Documents", icon: FileText, color: "bg-blue-500/10 text-blue-600" },
  { label: "My Lease", icon: Calendar, color: "bg-purple-500/10 text-purple-600" },
];

const upcomingPayments = [
  {
    id: 1,
    title: "Monthly Rent",
    amount: "$1,200",
    due: "Mar 1, 2025",
    status: "upcoming",
  },
  {
    id: 2,
    title: "Utilities",
    amount: "$85",
    due: "Mar 5, 2025",
    status: "upcoming",
  },
];

const maintenanceRequests = [
  {
    id: 1,
    title: "Leaking bathroom faucet",
    created: "Feb 10, 2025",
    status: "in-progress",
  },
  {
    id: 2,
    title: "Heater making noise",
    created: "Jan 28, 2025",
    status: "resolved",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function TenantHome() {
  const { userProfile, loading } = useRequireAuth("TENANT");

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Home</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {userProfile?.email?.split("@")[0] ?? "Tenant"}
        </p>
      </motion.div>

      {/* Property summary */}
      <motion.div variants={item}>
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Home className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium opacity-80">Your unit</p>
              <p className="text-xl font-bold">Unit 2B, 42 Maple St</p>
              <p className="text-sm opacity-70">Lease ends: Dec 31, 2025</p>
            </div>
            <ChevronRight className="h-5 w-5 opacity-60" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item}>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-all hover:shadow-sm active:scale-95"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming payments */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Payments</CardTitle>
            <CardDescription>Next 30 days</CardDescription>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{payment.title}</p>
                    <p className="text-xs text-muted-foreground">Due {payment.due}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{payment.amount}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Pay
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Maintenance requests */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Maintenance</CardTitle>
              <CardDescription>Your requests</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
              <Wrench className="h-3.5 w-3.5" />
              New request
            </Button>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {maintenanceRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-3 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {req.status === "resolved" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{req.title}</p>
                  <p className="text-xs text-muted-foreground">Submitted {req.created}</p>
                </div>
                <Badge
                  variant={req.status === "resolved" ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {req.status === "resolved" ? "Resolved" : "In Progress"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
