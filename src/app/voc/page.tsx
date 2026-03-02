"use client";

/* VOC Assessment Hub */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Upload,
  FileText,
  Users,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import {
  getVOCRecords,
  getEmployees,
  getTasks,
  addVOCRecord,
  getVOCTemplates,
} from "@/lib/store/index";
import { formatDate, generateId } from "@/lib/utils";
import type { Employee, Task, VOCStatus, VOCAssessmentTemplate } from "@/lib/types";

export default function VOCPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<VOCAssessmentTemplate[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<
    { employeeName: string; taskName: string; status: string; date: string; employeeId: string }[]
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, competent: 0, expiringSoon: 0 });

  useEffect(() => {
    (async () => {
      const [vocRecords, emps, tsks, tmpls] = await Promise.all([
        getVOCRecords(),
        getEmployees(),
        getTasks(),
        getVOCTemplates(),
      ]);
      setEmployees(emps.filter((e) => e.status === "Active"));
      setTasks(tsks.filter((t) => t.active));
      setTemplates(tmpls.filter((t) => t.active));

      // Stats
      const now = new Date();
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);
      const competentCount = vocRecords.filter((v) => v.status === "Competent").length;
      const expiringCount = vocRecords.filter((v) => {
        const exp = new Date(v.expiry_date);
        return v.status === "Competent" && exp <= soon && exp >= now;
      }).length;
      setStats({ total: vocRecords.length, competent: competentCount, expiringSoon: expiringCount });

      // Recent 5
      const sorted = [...vocRecords].sort(
        (a, b) => new Date(b.assessed_date).getTime() - new Date(a.assessed_date).getTime()
      );
      setRecentAssessments(
        sorted.slice(0, 5).map((v) => {
          const emp = emps.find((e) => e.id === v.employee_id);
          const task = tsks.find((t) => t.id === v.task_id);
          return {
            employeeName: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
            taskName: task?.name || "Unknown",
            status: v.status,
            date: v.assessed_date,
            employeeId: v.employee_id,
          };
        })
      );
    })();
  }, []);

  const handlePaperSave = async (form: {
    employee_id: string;
    task_id: string;
    status: VOCStatus;
    assessed_date: string;
    assessed_by: string;
    notes: string;
  }) => {
    const assessedDate = new Date(form.assessed_date);
    const expiryDate = new Date(assessedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    await addVOCRecord({
      id: generateId(),
      ...form,
      expiry_date: expiryDate.toISOString().split("T")[0],
    });
    setDialogOpen(false);
    // Reload to get updated recent list
    window.location.reload();
  };

  const templateCount = templates.length;
  const tasksWithTemplates = new Set(templates.map((t) => t.task_id));

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <PageHeader
        title="VOC Assessment"
        description="Perform Verification of Competency assessments digitally or record paper-based results"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Assessments", value: stats.total, color: "text-blue-400" },
          { label: "Competent", value: stats.competent, color: "text-emerald-400" },
          { label: "Expiring Soon", value: stats.expiringSoon, color: stats.expiringSoon > 0 ? "text-amber-400" : "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Digital Assessment */}
        <Card className="border-border/60 hover:border-amber-500/30 transition-colors group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/15 transition-colors">
                <ClipboardCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">Digital Assessment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete a full VOC assessment form digitally with knowledge questions,
                  practical tasks, and signatures. Auto-generates a PDF.
                </p>
                {templateCount === 0 ? (
                  <div className="p-3 rounded bg-amber-500/5 border border-amber-500/20 mb-3">
                    <p className="text-xs text-amber-400">
                      No assessment templates created yet. Go to{" "}
                      <Link href="/settings" className="underline font-medium">
                        Data Hub
                      </Link>{" "}
                      to create templates first.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mb-3">
                    {templateCount} template{templateCount !== 1 ? "s" : ""} available
                    ({tasksWithTemplates.size} competencies covered)
                  </p>
                )}
                <Link href="/voc/assess">
                  <Button className="gap-2" disabled={templateCount === 0}>
                    <ClipboardCheck className="w-4 h-4" />
                    Start Assessment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record Paper Assessment */}
        <Card className="border-border/60 hover:border-blue-500/30 transition-colors group">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/15 transition-colors">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold mb-1">Record Paper Assessment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manually record the results of a paper-based VOC assessment.
                  Upload a scanned copy from the employee&apos;s profile afterwards.
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Records the competency status and expiry. Attach the paper
                  copy via the employee&apos;s Documents tab.
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setDialogOpen(true)}
                >
                  <Upload className="w-4 h-4" />
                  Record Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      {recentAssessments.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Assessments
              </h3>
            </div>
            <div className="space-y-2">
              {recentAssessments.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    <div className="min-w-0">
                      <Link
                        href={`/personnel/${a.employeeId}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {a.employeeName}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.taskName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              View full assessment history and documents in each{" "}
              <Link href="/personnel" className="text-amber-400 hover:underline">
                employee&apos;s profile
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      <PaperAssessmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={employees}
        tasks={tasks}
        onSave={handlePaperSave}
      />
    </div>
  );
}

function PaperAssessmentDialog({
  open,
  onOpenChange,
  employees,
  tasks,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  tasks: Task[];
  onSave: (form: {
    employee_id: string;
    task_id: string;
    status: VOCStatus;
    assessed_date: string;
    assessed_by: string;
    notes: string;
  }) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    employee_id: "",
    task_id: "",
    status: "Competent" as VOCStatus,
    assessed_date: today,
    assessed_by: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        employee_id: employees[0]?.id || "",
        task_id: tasks[0]?.id || "",
        status: "Competent",
        assessed_date: today,
        assessed_by: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Record Paper Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.employee_id}
                onChange={(e) =>
                  setForm({ ...form, employee_id: e.target.value })
                }
                required
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Task</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.task_id}
                onChange={(e) =>
                  setForm({ ...form, task_id: e.target.value })
                }
                required
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as VOCStatus })
                }
              >
                <option value="Competent">Competent</option>
                <option value="In Training">In Training</option>
                <option value="Not Competent">Not Competent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Assessed Date</Label>
              <Input
                type="date"
                value={form.assessed_date}
                onChange={(e) =>
                  setForm({ ...form, assessed_date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assessed By</Label>
            <Input
              value={form.assessed_by}
              onChange={(e) =>
                setForm({ ...form, assessed_by: e.target.value })
              }
              required
              placeholder="Assessor name"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <textarea
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Expiry automatically set to 2 years. Upload the paper copy from the
            employee&apos;s profile &rarr; Documents tab.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Assessment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
