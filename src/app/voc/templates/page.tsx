"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Pencil, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { PageHeader } from "@/components/page-header";
import {
  getTasks,
  getVOCTemplates,
  addVOCTemplate,
  updateVOCTemplate,
  deleteVOCTemplate,
} from "@/lib/store/index";
import { generateId } from "@/lib/utils";
import type { Task, VOCAssessmentTemplate } from "@/lib/types";

export default function VOCTemplatesPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<VOCAssessmentTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<VOCAssessmentTemplate | null>(null);

  const loadData = async () => {
    const [t, tmpl] = await Promise.all([getTasks(), getVOCTemplates()]);
    setTasks(t.filter((t) => t.active));
    setTemplates(tmpl);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTaskName = (id: string) =>
    tasks.find((t) => t.id === id)?.name || "Unknown";

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (tmpl: VOCAssessmentTemplate) => {
    setEditing(tmpl);
    setDialogOpen(true);
  };

  const handleSave = async (tmpl: VOCAssessmentTemplate) => {
    if (editing) {
      await updateVOCTemplate(tmpl);
    } else {
      await addVOCTemplate(tmpl);
    }
    await loadData();
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assessment template?")) return;
    await deleteVOCTemplate(id);
    await loadData();
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/voc">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <PageHeader
          title="VOC Assessment Templates"
          description="Define knowledge questions and practical tasks for each competency"
        >
          <Button size="sm" className="gap-2" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            New Template
          </Button>
        </PageHeader>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Template Name</TableHead>
                  <TableHead className="text-xs">Task</TableHead>
                  <TableHead className="text-xs">SOP Reference</TableHead>
                  <TableHead className="text-xs text-center">
                    Knowledge Q&apos;s
                  </TableHead>
                  <TableHead className="text-xs text-center">
                    Practical Tasks
                  </TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
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
                        {tmpl.sop_reference || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {tmpl.knowledge_questions?.length || 0}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {tmpl.practical_tasks?.length || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            tmpl.active
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/30"
                          }`}
                        >
                          {tmpl.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(tmpl)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(tmpl.id)}
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
        </CardContent>
      </Card>

      <TemplateFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editing}
        tasks={tasks}
        existingTemplates={templates}
        onSave={handleSave}
      />
    </div>
  );
}

// === Template Form Dialog ===
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
      setQuestions([{ question: "" }]);
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

  // Filter out tasks that already have templates (unless editing)
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
          {/* Basic info */}
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
