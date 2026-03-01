"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, MapPin, BedDouble, IndianRupee } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getProperty, getTenantRecord } from "@/lib/db";
import type { Property, TenantRecord } from "@/types";

/* ── Animation ────────────────────────────────────────────────────────── */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
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

export default function TenantHome() {
  const { userProfile, currentUser, loading: authLoading } = useRequireAuth("TENANT");
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [tenantRecord, setTenantRecord] = useState<TenantRecord | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !userProfile || !currentUser) return;
    if (!userProfile.activePropertyId) {
      router.replace("/tenant/join");
      return;
    }
    const pid = userProfile.activePropertyId;
    setDataLoading(true);
    Promise.all([
      getProperty(pid),
      getTenantRecord(pid, currentUser.uid),
    ])
      .then(([prop, rec]) => {
        if (!rec || rec.status === "PENDING_APPROVAL") {
          router.replace("/tenant/pending");
          return;
        }
        setProperty(prop as Property | null);
        setTenantRecord(rec as TenantRecord | null);
      })
      .finally(() => setDataLoading(false));
  }, [authLoading, userProfile, currentUser, router]);

  if (authLoading || dataLoading) return <LoadingState />;

  const name = userProfile?.email?.split("@")[0] ?? "there";

  // Effective rent: own record first, fall back to property default
  const rent = tenantRecord?.rentMonthly ?? (property as unknown as { defaultRent?: number | null })?.defaultRent ?? null;
  const deposit = tenantRecord?.deposit ?? (property as unknown as { defaultDeposit?: number | null })?.defaultDeposit ?? null;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Hello, {name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Here&apos;s your home overview.</p>
      </motion.div>

      {/* Property card */}
      <motion.div variants={item}>
        <Card className="overflow-hidden transition-all hover:shadow-card-hover">
          <div className="h-1.5 bg-gradient-to-r from-primary to-primary/40" />
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{property?.name ?? "—"}</CardTitle>
                  <CardDescription>Your property</CardDescription>
                </div>
              </div>
              {property?.type && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-0">
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Tenancy summary */}
      {(rent !== null || deposit !== null) && (
        <motion.div variants={item}>
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tenancy details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border/60 p-0">
              {rent !== null && (
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4 shrink-0" />
                    Monthly rent
                  </div>
                  <span className="text-sm font-semibold">₹{rent.toLocaleString("en-IN")}</span>
                </div>
              )}
              {deposit !== null && (
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IndianRupee className="h-4 w-4 shrink-0" />
                    Security deposit
                  </div>
                  <span className="text-sm font-semibold">₹{deposit.toLocaleString("en-IN")}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
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
