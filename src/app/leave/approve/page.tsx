"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HardHat, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { LeaveRequest } from "@/lib/types";

interface Approver {
  name: string;
  type: string;
  workshop_id?: string;
}

function ApprovalContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [lr, setLr] = useState<LeaveRequest | null>(null);
  const [approver, setApprover] = useState<Approver | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [done, setDone] = useState(false);
  const [escalationNotes, setEscalationNotes] = useState("");

  const isSupervisor = approver?.type === "Supervisor";

  useEffect(() => {
    async function load() {
      if (!token) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("approval_token", token)
        .single();
      setLr(data);

      // Load the approver to check if they're a Supervisor
      if (data?.manager_id) {
        const { data: mgr } = await supabase
          .from("managers")
          .select("name, type, workshop_id")
          .eq("id", data.manager_id)
          .single();
        if (mgr) setApprover(mgr);
      }

      setLoading(false);
    }
    load();
  }, [token]);

  async function handleAction(approved: boolean) {
    if (!lr) return;
    setActioning(true);

    const supabase = createClient();
    const now = new Date().toISOString();
    const approverName = approver?.name || "Manager";
    const newStatus = approved ? "Approved" : "Rejected";

    await supabase
      .from("leave_requests")
      .update({
        status: newStatus,
        approved_by: approverName,
        approved_date: now,
      })
      .eq("id", lr.id);

    // If approved, notify HR
    if (approved) {
      try {
        await fetch("/api/leave/notify-hr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leaveRequestId: lr.id }),
        });
      } catch {
        console.error("Failed to notify HR");
      }
    }

    setLr({ ...lr, status: newStatus as LeaveRequest["status"], approved_by: approverName });
    setActioning(false);
    setDone(true);
    toast.success(approved ? "Leave approved — HR has been notified" : "Leave rejected");
  }

  async function handleEscalate() {
    if (!lr || !approver) return;
    setActioning(true);

    const supabase = createClient();

    // Find the workshop's Manager
    const { data: workshopManager } = await supabase
      .from("managers")
      .select("id, name, email, workshop_id")
      .eq("workshop_id", approver.workshop_id)
      .eq("type", "Manager")
      .eq("active", true)
      .limit(1)
      .single();

    if (!workshopManager) {
      toast.error("No active manager found for this workshop. Cannot escalate.");
      setActioning(false);
      return;
    }

    // Generate a new approval token for the manager
    const newToken = crypto.randomUUID();

    // Update the leave request: set status to Escalated, record escalation info, new token
    await supabase
      .from("leave_requests")
      .update({
        status: "Escalated",
        escalated_to: workshopManager.id,
        escalated_by: approver.name,
        escalation_notes: escalationNotes || null,
        escalated_date: new Date().toISOString(),
        manager_id: workshopManager.id,
        approval_token: newToken,
      })
      .eq("id", lr.id);

    // Send escalation email to manager
    try {
      await fetch("/api/leave/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveRequestId: lr.id }),
      });
    } catch {
      console.error("Failed to send escalation email");
    }

    setLr({ ...lr, status: "Escalated" as LeaveRequest["status"] });
    setActioning(false);
    setDone(true);
    toast.success("Leave request escalated to Manager");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!token || !lr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <XCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-bold">Request Not Found</h1>
        <p className="text-sm text-muted-foreground">This approval link is invalid or has expired.</p>
      </div>
    );
  }

  const alreadyActioned = lr.status !== "Pending";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded bg-amber-500/15">
          <HardHat className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-[0.08em] text-foreground">THORNTON</h1>
          <p className="text-[9px] tracking-[0.15em] text-muted-foreground uppercase">OH&S Management System</p>
        </div>
      </div>

      <Card className="w-full max-w-md border-border/60">
        <CardContent className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Leave Application</h2>
            <p className="text-xs text-muted-foreground mt-1">Review and action this request</p>
          </div>

          <div className="space-y-3">
            <DetailRow label="Employee" value={lr.employee_name} />
            <DetailRow label="Leave Type" value={lr.leave_type} />
            <DetailRow label="From" value={formatDate(lr.start_date)} />
            <DetailRow label="To" value={formatDate(lr.end_date)} />
            {lr.reason && <DetailRow label="Reason" value={lr.reason} />}
            <DetailRow label="Status" value={lr.status} />
            {lr.approved_by && <DetailRow label="Actioned By" value={lr.approved_by} />}
            {lr.escalated_by && <DetailRow label="Escalated By" value={lr.escalated_by} />}
            {lr.escalation_notes && <DetailRow label="Escalation Notes" value={lr.escalation_notes} />}
          </div>

          {done ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-400">
                {lr.status === "Approved"
                  ? "Leave approved. HR has been notified for filing."
                  : lr.status === "Escalated"
                  ? "Leave escalated to Manager for review."
                  : "Leave rejected. The employee will be informed."}
              </p>
            </div>
          ) : alreadyActioned ? (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
              <p className="text-sm text-blue-300">
                This request has already been {lr.status.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Escalation notes — only for supervisors */}
              {isSupervisor && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Notes (optional — visible to Manager if escalated)
                  </label>
                  <textarea
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="e.g. Extended leave — escalating for Manager approval"
                    value={escalationNotes}
                    onChange={(e) => setEscalationNotes(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  disabled={actioning}
                  onClick={() => handleAction(true)}
                >
                  {actioning ? "Processing..." : "Approve"}
                </Button>
                {isSupervisor && (
                  <Button
                    variant="outline"
                    className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    disabled={actioning}
                    onClick={() => handleEscalate()}
                  >
                    Escalate
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  disabled={actioning}
                  onClick={() => handleAction(false)}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        </div>
      }
    >
      <ApprovalContent />
    </Suspense>
  );
}
