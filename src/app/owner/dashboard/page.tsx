"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Clock,
  Plus,
  ArrowUpRight,
  MapPin,
  BedDouble,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getProperty, countTenants } from "@/lib/db";
import type { Property } from "@/types";

/* ── Animation ────────────────────────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOSTEL: "Hostel",
  PG: "PG",
  COLIVING: "Co-living",
};

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function OwnerDashboard() {
  const { userProfile, loading: authLoading } = useRequireAuth("OWNER");
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeTenants, setActiveTenants] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && userProfile && !userProfile.activePropertyId) {
      router.replace("/owner/onboarding/property");
    }
  }, [authLoading, userProfile, router]);

  useEffect(() => {
    if (authLoading || !userProfile?.activePropertyId) return;
    const pid = userProfile.activePropertyId;
    setDataLoading(true);
    Promise.all([
      getProperty(pid),
      countTenants(pid, "ACTIVE"),
      countTenants(pid, "PENDING_APPROVAL"),
    ])
      .then(([prop, active, pending]) => {
        setProperty(prop as Property | null);
        setActiveTenants(active);
        setPendingCount(pending);
      })
      .finally(() => setDataLoading(false));
  }, [authLoading, userProfile]);

  const loading = authLoading || dataLoading;

  if (loading || (userProfile && !userProfile.activePropertyId)) return <LoadingState />;

  const name = userProfile?.email?.split("@")[0] ?? "Owner";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const propertiesCount = userProfile?.propertyIds?.length ?? 1;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-6">
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
      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Properties */}
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Properties</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{propertiesCount}</p>
          </CardContent>
        </Card>

        {/* Active Tenants */}
        <Card className="transition-all duration-200 hover:shadow-card-hover">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Active Tenants</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50">
                <Users className="h-4 w-4 text-violet-500" />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{activeTenants}</p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card
          className={`transition-all duration-200 hover:shadow-card-hover ${
            pendingCount > 0 ? "border-amber-200" : ""
          }`}
        >
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Pending Approvals</p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  pendingCount > 0 ? "bg-amber-50" : "bg-muted"
                }`}
              >
                <Clock
                  className={`h-4 w-4 ${
                    pendingCount > 0 ? "text-amber-500" : "text-muted-foreground"
                  }`}
                />
              </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{pendingCount}</p>
            {pendingCount > 0 && (
              <Link
                href="/owner/approvals"
                className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
              >
                Review now <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Property details + Quick actions */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Active property */}
        <motion.div variants={item}>
          <Card className="h-full border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{property?.name ?? "—"}</CardTitle>
                  <CardDescription>Active property</CardDescription>
                </div>
                {property?.type && (
                  <Badge variant="secondary" className="text-xs">
                    {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {property?.city && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {property.city}
                    {property.address ? ` — ${property.address}` : ""}
                  </span>
                </div>
              )}
              {(property?.totalRooms || property?.bedsPerRoom) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BedDouble className="h-4 w-4 shrink-0" />
                  <span>
                    {property.totalRooms ? `${property.totalRooms} rooms` : ""}
                    {property.totalRooms && property.bedsPerRoom ? " · " : ""}
                    {property.bedsPerRoom ? `${property.bedsPerRoom} beds/room` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>
                  {property?.requireApproval
                    ? "Approval required for new tenants"
                    : "Tenants join without approval"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={item}>
          <Card className="h-full border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {pendingCount > 0 && (
                <Button
                  variant="outline"
                  className="justify-start gap-2 rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                  asChild
                >
                  <Link href="/owner/approvals">
                    <Clock className="h-4 w-4" />
                    Review {pendingCount} pending{" "}
                    {pendingCount === 1 ? "request" : "requests"}
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="justify-start gap-2 rounded-xl" asChild>
                <Link href="/owner/onboarding/property">
                  <Plus className="h-4 w-4" />
                  Add another property
                </Link>
              </Button>
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
