"use client";

import { motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Users,
  Wrench,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const stats = [
  { label: "Properties", value: "4", change: "+1 this month", icon: Building2, color: "text-blue-500" },
  { label: "Total Tenants", value: "11", change: "+2 this month", icon: Users, color: "text-green-500" },
  { label: "Monthly Revenue", value: "$8,400", change: "+5.2%", icon: DollarSign, color: "text-emerald-500" },
  { label: "Open Requests", value: "3", change: "2 urgent", icon: Wrench, color: "text-orange-500" },
];

const recentActivity = [
  { id: 1, type: "payment", title: "Rent received", desc: "Unit 2B – $1,200", time: "2h ago", badge: "Paid", badgeVariant: "default" as const },
  { id: 2, type: "maintenance", title: "Maintenance request", desc: "Unit 4A – Leaking faucet", time: "5h ago", badge: "Urgent", badgeVariant: "destructive" as const },
  { id: 3, type: "lease", title: "Lease renewal", desc: "Unit 1C – Jane Smith", time: "1d ago", badge: "Pending", badgeVariant: "secondary" as const },
  { id: 4, type: "payment", title: "Rent received", desc: "Unit 3B – $1,050", time: "1d ago", badge: "Paid", badgeVariant: "default" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function OwnerDashboard() {
  const { userProfile, loading } = useRequireAuth("OWNER");

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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Good morning, {userProfile?.email?.split("@")[0] ?? "Owner"}
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add property
        </Button>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest updates across your properties</CardDescription>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={activity.badgeVariant} className="text-[10px]">
                    {activity.badge}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Placeholder chart section */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <CardDescription>Monthly rental income (chart coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-center justify-center rounded-lg bg-muted/50">
              <div className="text-center">
                <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Revenue chart placeholder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
