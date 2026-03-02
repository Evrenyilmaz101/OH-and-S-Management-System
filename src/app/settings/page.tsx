"use client";

import { useState, useEffect } from "react";
import { Info, Database, Shield, Briefcase, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { RoleDialog } from "@/components/role-dialog";
import { TaskDialog } from "@/components/task-dialog";
import { getRoles, updateRole } from "@/lib/store/roles";
import { getTasks, addTask, updateTask, deleteTask } from "@/lib/store/tasks";
import { toast } from "sonner";
import type { RoleDefinition, Task } from "@/lib/types";

export default function SettingsPage() {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const loadData = async () => {
    const [loadedRoles, loadedTasks] = await Promise.all([
      getRoles(),
      getTasks(),
    ]);
    setRoles(loadedRoles);
    setTasks(loadedTasks);
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const getTaskName = (id: string) => tasks.find((t) => t.id === id)?.name || id;

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Settings"
        description="System configuration, role definitions, and data management"
      />

      {/* System Info */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            SYSTEM INFORMATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { label: "Application", value: "Thornton Engineering OH&S Management System" },
              { label: "Version", value: "2.1.0" },
              { label: "Compliance", value: "OHS Act 2004 (Vic) / WorkSafe Victoria" },
              { label: "Framework", value: "Next.js 16 + React 19 + TypeScript" },
              { label: "Data Storage", value: "Supabase (PostgreSQL + Storage)" },
              { label: "Date Format", value: "DD MMM YYYY (en-AU)" },
              { label: "VOC Expiry", value: "2 years from assessment date" },
              { label: "Cert Warning", value: "30 days before expiry" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-medium data-value">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Definitions */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            ROLE DEFINITIONS
            <span className="text-[10px] font-normal text-muted-foreground tracking-normal normal-case ml-2">
              Required competencies per role for skills matrix gap detection
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase tracking-wider">Role</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Required Competencies (VOC)</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Required Certifications</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-24">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{role.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{role.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.required_task_ids.map((taskId) => (
                          <span key={taskId} className="inline-flex px-2 py-0.5 bg-amber-500/8 text-amber-400 text-[11px] rounded border border-amber-500/15">
                            {getTaskName(taskId)}
                          </span>
                        ))}
                        {role.required_task_ids.length === 0 && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.required_cert_types.map((cert) => (
                          <span key={cert} className="inline-flex px-2 py-0.5 bg-blue-500/8 text-blue-400 text-[11px] rounded border border-blue-500/15">
                            {cert}
                          </span>
                        ))}
                        {role.required_cert_types.length === 0 && (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={role.active ? "Active" : "Inactive"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditRole(role)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Competency Definitions */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              COMPETENCY DEFINITIONS
              <span className="text-[10px] font-normal text-muted-foreground tracking-normal normal-case ml-2">
                Tasks / skills used in Verification of Competencies
              </span>
            </CardTitle>
            <Button size="sm" onClick={handleAddTask} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Competency
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-24">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No competencies defined yet.</p>
                      <p className="text-xs mt-1">Click &ldquo;Add Competency&rdquo; to create one.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{task.name}</p>
                        {task.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[300px] truncate">{task.description}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {task.category || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.active ? "Active" : "Inactive"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditTask(task)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteTask(task)}>
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

      {/* Data Storage */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-purple-400" />
            DATA STORAGE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            All data is stored in Supabase (PostgreSQL) with file storage for document attachments.
            Data is accessible from any device with proper authentication.
          </p>
          <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/15">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-xs text-emerald-500/80">
                Connected to Supabase with row-level security enabled. Document files stored in Supabase Storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
