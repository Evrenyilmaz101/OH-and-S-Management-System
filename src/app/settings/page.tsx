"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  Info,
  Database,
  Shield,
  Briefcase,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  ChevronDown,
  ClipboardCheck,
  GripVertical,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { RoleDialog } from "@/components/role-dialog";
import { TaskDialog } from "@/components/task-dialog";
import { getRoles, updateRole } from "@/lib/store/roles";
import { getTasks, addTask, updateTask, deleteTask } from "@/lib/store/tasks";
import { deleteAllData } from "@/lib/store";
import {
  getVOCTemplates,
  addVOCTemplate,
  updateVOCTemplate,
  deleteVOCTemplate,
} from "@/lib/store/voc-assessments";
import { toast } from "sonner";
import { cn, generateId } from "@/lib/utils";
import type { RoleDefinition, Task, VOCAssessmentTemplate } from "@/lib/types";

// --- Collapsible Section wrapper ---
function CollapsibleSection({
  icon,
  iconColor,
  title,
  subtitle,
  defaultOpen = true,
  headerRight,
  children,
}: {
  icon: ReactNode;
  iconColor: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={iconColor}>{icon}</span>
          <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-foreground">
            {title}
          </span>
          {subtitle && (
            <span className="text-[10px] font-normal text-muted-foreground tracking-normal normal-case ml-1 hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {open && headerRight && (
            <div onClick={(e) => e.stopPropagation()}>{headerRight}</div>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              !open && "-rotate-90"
            )}
          />
        </div>
      </button>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}

export default function DataHubPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<VOCAssessmentTemplate[]>([]);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<VOCAssessmentTemplate | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const loadData = async () => {
    const [loadedRoles, loadedTasks, loadedTemplates] = await Promise.all([
      getRoles(),
      getTasks(),
      getVOCTemplates(),
    ]);
    setRoles(loadedRoles);
    setTasks(loadedTasks);
    setTemplates(loadedTemplates);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Role handlers
  const handleEditRole = (role: RoleDefinition) => {
    setEditingRole(role);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async (role: RoleDefinition) => {
    const result = await updateRole(role);
    if (result) {
      toast.success("Role updated");
    } else {
      toast.error("Failed to save role — check console for details");
    }
    await loadData();
    setEditingRole(null);
  };

  // Task handlers
  const handleAddTask = () => {
    setEditingTask(null);
    setTaskDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    if (editingTask) {
      await updateTask(task);
      toast.success("Competency updated");
    } else {
      await addTask(task);
      toast.success("Competency added");
    }
    await loadData();
    setEditingTask(null);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Delete "${task.name}"? This cannot be undone.`)) return;
    await deleteTask(task.id);
    toast.success("Competency deleted");
    await loadData();
  };

  // Template handlers
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (tmpl: VOCAssessmentTemplate) => {
    setEditingTemplate(tmpl);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async (tmpl: VOCAssessmentTemplate) => {
    if (editingTemplate) {
      await updateVOCTemplate(tmpl);
      toast.success("Template updated");
    } else {
      await addVOCTemplate(tmpl);
      toast.success("Template created");
    }
    await loadData();
    setTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this assessment template?")) return;
    await deleteVOCTemplate(id);
    toast.success("Template deleted");
    await loadData();
  };

  const getTaskName = (id: string) =>
    tasks.find((t) => t.id === id)?.name || id;

  const activeTasks = tasks.filter((t) => t.active);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Data Hub"
        description="System configuration, role definitions, templates, and data management"
      />

      {/* System Info */}
      <CollapsibleSection
        icon={<Info className="w-3.5 h-3.5" />}
        iconColor="text-blue-400"
        title="System Information"
        defaultOpen={false}
      >
        <div className="space-y-2">
          {[
            {
              label: "Application",
              value: "Thornton Engineering OH&S Management System",
            },
            { label: "Version", value: "2.1.0" },
            {
              label: "Compliance",
              value: "OHS Act 2004 (Vic) / WorkSafe Victoria",
            },
            {
              label: "Framework",
              value: "Next.js 16 + React 19 + TypeScript",
            },
            {
              label: "Data Storage",
              value: "Supabase (PostgreSQL + Storage)",
            },
            { label: "Date Format", value: "DD MMM YYYY (en-AU)" },
            { label: "VOC Expiry", value: "2 years from assessment date" },
            { label: "Cert Warning", value: "30 days before expiry" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-sm font-medium data-value">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Role Definitions */}
      <CollapsibleSection
        icon={<Briefcase className="w-3.5 h-3.5" />}
        iconColor="text-amber-500"
        title="Role Definitions"
        subtitle="Required competencies per role for skills matrix gap detection"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Role
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Required Competencies (VOC)
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Required Certifications
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider w-24">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{role.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {role.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.required_task_ids.map((taskId) => (
                        <span
                          key={taskId}
                          className="inline-flex px-2 py-0.5 bg-amber-500/8 text-amber-400 text-[11px] rounded border border-amber-500/15"
                        >
                          {getTaskName(taskId)}
                        </span>
                      ))}
                      {role.required_task_ids.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.required_cert_types.map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex px-2 py-0.5 bg-blue-500/8 text-blue-400 text-[11px] rounded border border-blue-500/15"
                        >
                          {cert}
                        </span>
                      ))}
                      {role.required_cert_types.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          None
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={role.active ? "Active" : "Inactive"}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleEditRole(role)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CollapsibleSection>

      {/* Competency Definitions */}
      <CollapsibleSection
        icon={<ShieldCheck className="w-3.5 h-3.5" />}
        iconColor="text-emerald-400"
        title="Competency Definitions"
        subtitle="Tasks / skills used in Verification of Competencies"
        headerRight={
          <Button size="sm" onClick={handleAddTask} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add Competency
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Name
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Category
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider w-24">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <p className="text-sm">No competencies defined yet.</p>
                    <p className="text-xs mt-1">
                      Click &ldquo;Add Competency&rdquo; to create one.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{task.name}</p>
                      {task.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[300px] truncate">
                          {task.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.category || "\u2014"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={task.active ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditTask(task)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDeleteTask(task)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CollapsibleSection>

      {/* VOC Assessment Templates */}
      <CollapsibleSection
        icon={<ClipboardCheck className="w-3.5 h-3.5" />}
        iconColor="text-orange-400"
        title="VOC Assessment Templates"
        subtitle="Knowledge questions and practical tasks per competency"
        headerRight={
          <Button size="sm" onClick={handleAddTemplate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Template
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Template Name
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  Task
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">
                  SOP Reference
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">
                  Knowledge Q&apos;s
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center">
                  Practical Tasks
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-center w-24">
                  Status
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No assessment templates yet. Create one to start digital
                    assessments.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tmpl) => (
                  <TableRow key={tmpl.id}>
                    <TableCell className="font-medium text-sm">
                      {tmpl.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getTaskName(tmpl.task_id)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tmpl.sop_reference || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      {tmpl.knowledge_questions?.length || 0}
                    </TableCell>
                    <TableCell className="text-sm text-center">
                      {tmpl.practical_tasks?.length || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge
                        status={tmpl.active ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditTemplate(tmpl)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => handleDeleteTemplate(tmpl.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CollapsibleSection>

      {/* Data Storage */}
      <CollapsibleSection
        icon={<Database className="w-3.5 h-3.5" />}
        iconColor="text-purple-400"
        title="Data Storage"
        defaultOpen={false}
      >
        <p className="text-sm text-muted-foreground mb-4">
          All data is stored in Supabase (PostgreSQL) with file storage for
          document attachments. Data is accessible from any device with proper
          authentication.
        </p>
        <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-500/80">
              Connected to Supabase with row-level security enabled. Document
              files stored in Supabase Storage.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Danger Zone */}
      <CollapsibleSection
        icon={<AlertTriangle className="w-3.5 h-3.5" />}
        iconColor="text-red-500"
        title="Danger Zone"
        defaultOpen={false}
      >
        <DeleteAllDataSection onDeleted={loadData} />
      </CollapsibleSection>

      {/* Dialogs */}
      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
        tasks={tasks}
        onSave={handleSaveRole}
      />

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />

      <TemplateFormDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        tasks={activeTasks}
        existingTemplates={templates}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}

// === Delete All Data Section ===
function DeleteAllDataSection({ onDeleted }: { onDeleted: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE ALL") return;
    setDeleting(true);
    const { success, errors } = await deleteAllData();
    setDeleting(false);
    setConfirmOpen(false);
    setConfirmText("");
    if (success) {
      toast.success("All data has been deleted");
      onDeleted();
    } else {
      toast.error(`Deleted with ${errors.length} error(s) — check console`);
      onDeleted();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-red-400">
                Delete all data
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently remove all employees, VOC records, certifications,
                documents, incidents, and all other data from the system. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete All Data
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => { setConfirmOpen(open); if (!open) setConfirmText(""); }}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete All Data
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded bg-red-500/5 border border-red-500/15">
              <p className="text-sm text-red-400/90">
                This will permanently delete all records from every table in the
                system including employees, VOC records, certifications,
                inductions, documents, incidents, and more.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Type <span className="font-mono font-bold text-foreground">DELETE ALL</span> to confirm:
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE ALL"
              className="font-mono"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setConfirmOpen(false); setConfirmText(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmText !== "DELETE ALL" || deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Everything"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// === VOC Template Form Dialog ===
function TemplateFormDialog({
  open,
  onOpenChange,
  template,
  tasks,
  existingTemplates,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: VOCAssessmentTemplate | null;
  tasks: Task[];
  existingTemplates: VOCAssessmentTemplate[];
  onSave: (tmpl: VOCAssessmentTemplate) => void;
}) {
  const [name, setName] = useState("");
  const [taskId, setTaskId] = useState("");
  const [sopReference, setSopReference] = useState("");
  const [active, setActive] = useState(true);
  const [questions, setQuestions] = useState<{ question: string }[]>([
    { question: "" },
  ]);
  const [practicalTasks, setPracticalTasks] = useState<
    { task: string; criteria: string }[]
  >([{ task: "", criteria: "" }]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setTaskId(template.task_id);
      setSopReference(template.sop_reference || "");
      setActive(template.active);
      setQuestions(
        template.knowledge_questions?.length
          ? template.knowledge_questions
          : [{ question: "" }]
      );
      setPracticalTasks(
        template.practical_tasks?.length
          ? template.practical_tasks
          : [{ task: "", criteria: "" }]
      );
    } else {
      setName("");
      setTaskId(tasks[0]?.id || "");
      setSopReference("");
      setActive(true);
      setQuestions([
        { question: "What is the primary function of this equipment/tool?" },
        { question: "List 3 pre-start checks." },
        { question: "Name 2 safety issues that may affect this equipment." },
        { question: "What action should be taken if faults are found?" },
        { question: "List 2 safety features and describe their purpose." },
        { question: "Identify 3 hazards and a control for each." },
        { question: "List the PPE requirements for this task." },
      ]);
      setPracticalTasks([{ task: "", criteria: "" }]);
    }
  }, [template, open, tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = questions.filter((q) => q.question.trim());
    const cleanP = practicalTasks.filter(
      (p) => p.task.trim() || p.criteria.trim()
    );
    onSave({
      id: template?.id || generateId(),
      task_id: taskId,
      name,
      sop_reference: sopReference,
      knowledge_questions: cleanQ,
      practical_tasks: cleanP,
      active,
    });
  };

  const availableTasks = tasks.filter(
    (t) =>
      !existingTemplates.some(
        (et) => et.task_id === t.id && et.id !== template?.id
      )
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Assessment Template" : "New Assessment Template"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Angle Grinder VOC"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Task / Competency</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                required
              >
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>SOP Reference</Label>
              <Input
                value={sopReference}
                onChange={(e) => setSopReference(e.target.value)}
                placeholder="e.g. SOP-HS-G-004"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={active ? "active" : "inactive"}
                onChange={(e) => setActive(e.target.value === "active")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Knowledge Questions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-amber-400 font-bold">
                Knowledge Questions
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() =>
                  setQuestions([...questions, { question: "" }])
                }
              >
                <Plus className="w-3 h-3" />
                Add Question
              </Button>
            </div>
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground/30 shrink-0" />
                <Input
                  value={q.question}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[idx] = { question: e.target.value };
                    setQuestions(updated);
                  }}
                  placeholder={`Question ${idx + 1}...`}
                  className="flex-1"
                />
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive hover:text-destructive h-9 w-9 p-0"
                    onClick={() =>
                      setQuestions(questions.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Practical Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-amber-400 font-bold">
                Practical Tasks
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() =>
                  setPracticalTasks([
                    ...practicalTasks,
                    { task: "", criteria: "" },
                  ])
                }
              >
                <Plus className="w-3 h-3" />
                Add Task
              </Button>
            </div>
            {practicalTasks.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 border border-border/40 rounded-lg p-3"
              >
                <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground/30 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={pt.task}
                    onChange={(e) => {
                      const updated = [...practicalTasks];
                      updated[idx] = { ...pt, task: e.target.value };
                      setPracticalTasks(updated);
                    }}
                    placeholder="Task name (e.g. Pre-Start Inspection)"
                  />
                  <textarea
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    placeholder="Assessment criteria..."
                    value={pt.criteria}
                    onChange={(e) => {
                      const updated = [...practicalTasks];
                      updated[idx] = { ...pt, criteria: e.target.value };
                      setPracticalTasks(updated);
                    }}
                  />
                </div>
                {practicalTasks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-destructive hover:text-destructive h-9 w-9 p-0"
                    onClick={() =>
                      setPracticalTasks(
                        practicalTasks.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {template ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
