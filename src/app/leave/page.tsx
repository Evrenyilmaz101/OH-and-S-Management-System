"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getEmployees } from "@/lib/store/employees";
import { getLeaveRequests, addLeaveRequest } from "@/lib/store/leave-requests";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Employee, LeaveRequest, LeaveType } from "@/lib/types";

const LEAVE_TYPES: LeaveType[] = [
  "Annual Leave",
  "Personal/Sick Leave",
  "Long Service Leave",
  "Unpaid Leave",
  "Compassionate Leave",
  "Parental Leave",
];

const emptyForm = {
  employee_id: "",
  leave_type: "Annual Leave" as LeaveType,
  start_date: "",
  end_date: "",
  reason: "",
};

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    const [reqs, emps] = await Promise.all([getLeaveRequests(), getEmployees()]);
    setRequests(reqs.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")));
    setEmployees(emps);
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedEmployee = employees.find((e) => e.id === form.employee_id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const employee = employees.find((emp) => emp.id === form.employee_id);
    if (!employee) {
      toast.error("Please select an employee");
      return;
    }

    if (!employee.manager_id) {
      toast.error("This employee has no manager assigned. Update their profile in Employee Files first.");
      return;
    }

    if (form.end_date < form.start_date) {
      toast.error("End date must be on or after start date");
      return;
    }

    setSubmitting(true);

    const lr = await addLeaveRequest({
      employee_id: form.employee_id,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      reason: form.reason,
      status: "Pending",
      manager_id: employee.manager_id,
    });

    if (!lr) {
      toast.error("Failed to submit leave application");
      setSubmitting(false);
      return;
    }

    // Notify manager via email
    try {
      const res = await fetch("/api/leave/notify-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveRequestId: lr.id }),
      });
      if (!res.ok) {
        toast.warning("Leave submitted but manager email notification failed");
      } else {
        toast.success("Leave application submitted — manager notified by email");
      }
    } catch {
      toast.warning("Leave submitted but email notification failed");
    }

    setSubmitting(false);
    setDialogOpen(false);
    setForm(emptyForm);
    loadData();
  }

  const pending = requests.filter((r) => r.status === "Pending").length;
  const approved = requests.filter((r) => r.status === "Approved").length;
  const rejected = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        title="Leave Applications"
        description="Submit and track leave requests"
      >
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Application
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold data-value">{pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold data-value">{approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold data-value">{rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <Calendar className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm">No leave applications yet.</p>
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">From</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">To</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-border/30 last:border-0">
                      <td className="px-4 py-3 font-medium">{r.employee_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.leave_type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(r.start_date)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(r.end_date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(r.created_at || "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setForm(emptyForm); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>New Leave Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
              <select
                id="employee_id"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              >
                <option value="">Select employee...</option>
                {employees
                  .filter((e) => e.status === "Active")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </option>
                  ))}
              </select>
              {form.employee_id && selectedEmployee && !selectedEmployee.manager_id && (
                <p className="text-xs text-amber-500">
                  This employee has no manager assigned. Assign one in Employee Files before submitting.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type</Label>
              <select
                id="leave_type"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.leave_type}
                onChange={(e) => setForm({ ...form, leave_type: e.target.value as LeaveType })}
              >
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  required
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Notes</Label>
              <textarea
                id="reason"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Optional"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
