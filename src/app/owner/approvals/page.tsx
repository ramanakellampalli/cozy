"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserX, Users, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useToast } from "@/hooks/use-toast";
import { listPendingTenants, approveTenant, rejectTenant } from "@/lib/db";

interface PendingTenant {
  uid: string;
  email: string;
  name: string;
  createdAt: unknown;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function OwnerApprovals() {
  const { userProfile, loading: authLoading } = useRequireAuth("OWNER");
  const { toast } = useToast();

  const [tenants, setTenants] = useState<PendingTenant[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [actionUid, setActionUid] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !userProfile?.activePropertyId) return;
    listPendingTenants(userProfile.activePropertyId)
      .then((data) => setTenants(data as PendingTenant[]))
      .finally(() => setListLoading(false));
  }, [authLoading, userProfile]);

  async function handleApprove(uid: string) {
    if (!userProfile?.activePropertyId) return;
    setActionUid(uid);
    try {
      await approveTenant(userProfile.activePropertyId, uid);
      setTenants((prev) => prev.filter((t) => t.uid !== uid));
      toast({ title: "Tenant approved", description: "They can now access the property." });
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    } finally {
      setActionUid(null);
    }
  }

  async function handleReject(uid: string) {
    if (!userProfile?.activePropertyId) return;
    setActionUid(uid);
    try {
      await rejectTenant(userProfile.activePropertyId, uid);
      setTenants((prev) => prev.filter((t) => t.uid !== uid));
      toast({ title: "Tenant rejected" });
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    } finally {
      setActionUid(null);
    }
  }

  const loading = authLoading || listLoading;

  if (loading) return <LoadingState />;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-2xl space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Approvals</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Review tenants waiting to join your property.
        </p>
      </motion.div>

      {/* Count badge */}
      <motion.div variants={item}>
        {tenants.length > 0 ? (
          <Badge className="rounded-full border-0 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {tenants.length} pending {tenants.length === 1 ? "request" : "requests"}
          </Badge>
        ) : null}
      </motion.div>

      {/* List */}
      {tenants.length === 0 ? (
        <motion.div variants={item}>
          <Card className="border-border/60 shadow-card">
            <CardContent className="flex flex-col items-center gap-3 py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <p className="font-semibold">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending approval requests.</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <Card className="border-border/60 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-muted-foreground" />
                Pending requests
              </CardTitle>
              <CardDescription>Approve or reject each tenant</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 p-0">
              {tenants.map((tenant) => {
                const isActing = actionUid === tenant.uid;
                const initial = tenant.email?.[0]?.toUpperCase() ?? "T";
                return (
                  <div key={tenant.uid} className="flex items-center gap-4 px-6 py-4">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initial}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{tenant.name || tenant.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{tenant.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      {isActing ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 rounded-lg border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(tenant.uid)}
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg text-xs"
                            onClick={() => handleApprove(tenant.uid)}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
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
