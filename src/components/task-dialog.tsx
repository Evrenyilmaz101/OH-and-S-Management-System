"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Task) => void;
}

const emptyTask: Omit<Task, "id"> = {
  name: "",
  description: "",
  category: "",
  risk_level: "Low",
  required_ppe: [],
  active: true,
};

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: TaskDialogProps) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (task) {
      const { id, ...rest } = task;
      void id;
      setForm(rest);
    } else {
      setForm(emptyTask);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: task?.id || generateId(), ...form });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit Competency" : "Add Competency"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. MIG Welding"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <textarea
              id="task-description"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-category">Category</Label>
            <Input
              id="task-category"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              placeholder="e.g. Welding"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="task-active"
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-amber-500"
              checked={form.active}
              onChange={(e) =>
                setForm({ ...form, active: e.target.checked })
              }
            />
            <Label htmlFor="task-active">Active</Label>
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
              {task ? "Save Changes" : "Add Competency"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
