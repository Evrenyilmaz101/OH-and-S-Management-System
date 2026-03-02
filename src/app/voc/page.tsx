"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ClipboardCheck, FileDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  updateVOCRecord,
  getDocuments,
} from "@/lib/store/index";
import { getDocumentFileUrl } from "@/lib/store/document-storage";
import { formatDate, getExpiryStatus, generateId } from "@/lib/utils";
import type { VOCRecord, Employee, Task, VOCStatus, Document } from "@/lib/types";

export default function VOCPage() {
  const [vocRecords, setVocRecords] = useState<VOCRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VOCStatus | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VOCRecord | null>(null);

  const loadData = async () => {
    const [vocRecords, employees, tasks, docs] = await Promise.all([
      getVOCRecords(),
      getEmployees(),
      getTasks(),
      getDocuments(),
    ]);
    setVocRecords(vocRecords);
    setEmployees(employees);
    setTasks(tasks);
    // Filter to only VOC Verification documents
    setDocuments(docs.filter((d) => d.category === "VOC Verification"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getTaskName = (id: string) => {
    return tasks.find((t) => t.id === id)?.name || "Unknown";
  };

  // Find the VOC Verification document for a given employee+task
  const getVocDoc = (employeeId: string, taskId: string): Document | undefined => {
    return documents.find(
      (d) =>
        d.related_entity_id === taskId &&
        d.related_entity_type === "voc_item" &&
        d.tags?.includes(`emp:${employeeId}`)
    );
  };

  const handleViewPdf = async (doc: Document) => {
    if (!doc.file_url) return;
    const url = await getDocumentFileUrl(doc.file_url);
    if (url) {
      window.open(url, "_blank");
    }
  };

  const filtered = useMemo(() => {
    return vocRecords.filter((v) => {
      const employeeName = getEmployeeName(v.employee_id).toLowerCase();
      const taskName = getTaskName(v.task_id).toLowerCase();
      const matchesSearch =
        search === "" ||
        employeeName.includes(search.toLowerCase()) ||
        taskName.includes(search.toLowerCase()) ||
        v.assessed_by.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocRecords, employees, tasks, search, statusFilter]);

  const handleSave = async (record: VOCRecord) => {
    if (editing) {
      await updateVOCRecord(record);
    } else {
      await addVOCRecord(record);
    }
    await loadData();
    setEditing(null);
    setDialogOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="VOC Assessment"
        description="Verification of Competency assessments — auto 2-year expiry"
      >
        <div className="flex gap-2">
          <Link href="/voc/assess">
            <Button size="sm" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Digital Assessment
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Quick Entry
          </Button>
        </div>
      </PageHeader>

      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, task, or assessor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VOCStatus | "All")}
            >
              <option value="All">All Status</option>
              <option value="Competent">Competent</option>
              <option value="In Training">In Training</option>
              <option value="Not Competent">Not Competent</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Employee</TableHead>
                  <TableHead className="text-xs">Task</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Assessed Date</TableHead>
                  <TableHead className="text-xs">Assessed By</TableHead>
                  <TableHead className="text-xs">Expiry</TableHead>
                  <TableHead className="text-xs">Expiry Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No VOC records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((voc) => {
                    const vocDoc = getVocDoc(voc.employee_id, voc.task_id);
                    return (
                      <TableRow key={voc.id}>
                        <TableCell className="font-medium text-sm">
                          <Link
                            href={`/personnel/${voc.employee_id}`}
                            className="hover:underline"
                          >
                            {getEmployeeName(voc.employee_id)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getTaskName(voc.task_id)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={voc.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(voc.assessed_date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {voc.assessed_by}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(voc.expiry_date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={getExpiryStatus(voc.expiry_date)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {vocDoc && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1 text-amber-400 hover:text-amber-300"
                                onClick={() => handleViewPdf(vocDoc)}
                                title="View/Download PDF"
                              >
                                <FileDown className="w-3.5 h-3.5" />
                                PDF
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => {
                                setEditing(voc);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <VOCDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        record={editing}
        employees={employees}
        tasks={tasks}
        onSave={handleSave}
      />
    </div>
  );
}

function VOCDialog({
  open,
  onOpenChange,
  record,
  employees,
  tasks,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: VOCRecord | null;
  employees: Employee[];
  tasks: Task[];
  onSave: (record: VOCRecord) => void;
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
    if (record) {
      setForm({
        employee_id: record.employee_id,
        task_id: record.task_id,
        status: record.status,
        assessed_date: record.assessed_date,
        assessed_by: record.assessed_by,
        notes: record.notes,
      });
    } else {
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
  }, [record, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assessedDate = new Date(form.assessed_date);
    const expiryDate = new Date(assessedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    onSave({
      id: record?.id || generateId(),
      ...form,
      expiry_date: expiryDate.toISOString().split("T")[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{record ? "Edit VOC Record" : "New VOC Assessment"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                required
              >
                {employees
                  .filter((e) => e.status === "Active")
                  .map((e) => (
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
                onChange={(e) => setForm({ ...form, task_id: e.target.value })}
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
                onChange={(e) => setForm({ ...form, status: e.target.value as VOCStatus })}
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
                onChange={(e) => setForm({ ...form, assessed_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Assessed By</Label>
            <Input
              value={form.assessed_by}
              onChange={(e) => setForm({ ...form, assessed_by: e.target.value })}
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
            Expiry will be automatically set to 2 years from the assessed date.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{record ? "Save Changes" : "Create Record"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
