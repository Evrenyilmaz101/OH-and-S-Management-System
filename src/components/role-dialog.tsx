"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { RoleDefinition, Task } from "@/lib/types";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleDefinition | null;
  tasks: Task[];
  onSave: (role: RoleDefinition) => void;
}

export function RoleDialog({ open, onOpenChange, role, tasks, onSave }: RoleDialogProps) {
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [certTypes, setCertTypes] = useState<string[]>([]);
  const [newCertType, setNewCertType] = useState("");
  const [taskSelectValue, setTaskSelectValue] = useState("");

  useEffect(() => {
    if (role) {
      setDescription(role.description);
      setActive(role.active);
      setSelectedTaskIds([...role.required_task_ids]);
      setCertTypes([...role.required_cert_types]);
    } else {
      setDescription("");
      setActive(true);
      setSelectedTaskIds([]);
      setCertTypes([]);
    }
    setNewCertType("");
    setTaskSelectValue("");
  }, [role, open]);

  const handleAddTask = (taskId: string) => {
    if (taskId && !selectedTaskIds.includes(taskId)) {
      setSelectedTaskIds([...selectedTaskIds, taskId]);
    }
    setTaskSelectValue("");
  };

  const handleRemoveTask = (taskId: string) => {
    setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
  };

  const handleAddCertType = () => {
    const trimmed = newCertType.trim();
    if (trimmed && !certTypes.includes(trimmed)) {
      setCertTypes([...certTypes, trimmed]);
    }
    setNewCertType("");
  };

  const handleRemoveCertType = (certType: string) => {
    setCertTypes(certTypes.filter((ct) => ct !== certType));
  };

  const handleCertKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCertType();
    }
  };

  const handleSave = () => {
    if (!role) return;
    onSave({
      ...role,
      description,
      active,
      required_task_ids: selectedTaskIds,
      required_cert_types: certTypes,
    });
    onOpenChange(false);
  };

  const availableTasks = tasks.filter(
    (task) => task.active && !selectedTaskIds.includes(task.id)
  );

  const getTaskName = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    return task?.name ?? taskId;
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Role Name - readonly */}
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={role.name}
              readOnly
              className="bg-muted"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="role-description">Description</Label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role description..."
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="role-active">Active</Label>
            <Switch
              id="role-active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>

          {/* Required VOC Competencies */}
          <div className="space-y-2">
            <Label>Required VOC Competencies</Label>
            {selectedTaskIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTaskIds.map((taskId) => (
                  <span
                    key={taskId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20"
                  >
                    {getTaskName(taskId)}
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(taskId)}
                      className="ml-0.5 hover:text-amber-200 transition-colors"
                      aria-label={`Remove ${getTaskName(taskId)}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={taskSelectValue}
              onChange={(e) => handleAddTask(e.target.value)}
            >
              <option value="">Add a competency...</option>
              {availableTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>

          {/* Required Certification Types */}
          <div className="space-y-2">
            <Label>Required Certification Types</Label>
            {certTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {certTypes.map((certType) => (
                  <span
                    key={certType}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20"
                  >
                    {certType}
                    <button
                      type="button"
                      onClick={() => handleRemoveCertType(certType)}
                      className="ml-0.5 hover:text-blue-200 transition-colors"
                      aria-label={`Remove ${certType}`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newCertType}
                onChange={(e) => setNewCertType(e.target.value)}
                onKeyDown={handleCertKeyDown}
                placeholder="e.g. White Card, EWP Licence..."
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCertType}
                disabled={!newCertType.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
