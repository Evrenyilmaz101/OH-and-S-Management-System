import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Expiry
  valid: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  expiring: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  expired: "bg-red-500/10 text-red-500 border-red-500/20",
  // VOC
  Competent: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "In Training": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Not Competent": "bg-red-500/10 text-red-500 border-red-500/20",
  // Risk
  Low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-500 border-red-500/20",
  // Employee
  Active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Inactive: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  Employee: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Visitor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Contractor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  // Onboarding
  "Not Started": "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  "In Progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  // SOP / Document
  Current: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Under Review": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Archived: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  Superseded: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  Draft: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  // Incident
  Open: "bg-red-500/10 text-red-500 border-red-500/20",
  "Under Investigation": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Corrective Actions": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Closed: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  // Severity
  Insignificant: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  Minor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Moderate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Major: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Catastrophic: "bg-red-500/10 text-red-500 border-red-500/20",
  // Corrective Action
  Overdue: "bg-red-500/10 text-red-500 border-red-500/20",
  // Plant
  Operational: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Out of Service": "bg-red-500/10 text-red-500 border-red-500/20",
  "Under Maintenance": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Decommissioned: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  // Registration
  Registered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Not Required": "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Expired: "bg-red-500/10 text-red-500 border-red-500/20",
  // Inspection
  Scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Satisfactory: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Needs Improvement": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Unsatisfactory: "bg-red-500/10 text-red-500 border-red-500/20",
  // PPE
  Good: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Fair: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Replace: "bg-red-500/10 text-red-500 border-red-500/20",
  // Payroll
  Submitted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "N/A": "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  // Induction (Pending already defined above in Registration section)
  // Leave
  Approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Rejected: "bg-red-500/10 text-red-500 border-red-500/20",
  Escalated: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  // Manager types
  Supervisor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Manager: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  // Incident Types
  "Near Miss": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "First Aid": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Medical Treatment": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Lost Time Injury": "bg-red-500/10 text-red-500 border-red-500/20",
  "Dangerous Occurrence": "bg-red-500/10 text-red-500 border-red-500/20",
  "Property Damage": "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const statusLabels: Record<string, string> = {
  valid: "Valid",
  expiring: "Expiring Soon",
  expired: "Expired",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  const label = statusLabels[status] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
