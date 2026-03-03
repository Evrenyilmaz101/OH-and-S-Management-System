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
import { Switch } from "@/components/ui/switch";
import type { Manager, Workshop } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface ManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manager?: Manager | null;
  workshops: Workshop[];
  onSave: (manager: Manager) => void;
}

const emptyManager: Omit<Manager, "id"> = {
  name: "",
  email: "",
  workshop_id: undefined,
  active: true,
};

export function ManagerDialog({ open, onOpenChange, manager, workshops, onSave }: ManagerDialogProps) {
  const [form, setForm] = useState(emptyManager);

  useEffect(() => {
    if (manager) {
      const { id, ...rest } = manager;
      void id;
      setForm(rest);
    } else {
      setForm(emptyManager);
    }
  }, [manager, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: manager?.id || generateId(),
      ...form,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{manager ? "Edit Manager" : "Add Manager"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="manager@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workshop_id">Workshop</Label>
            <select
              id="workshop_id"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.workshop_id || ""}
              onChange={(e) => setForm({ ...form, workshop_id: e.target.value || undefined })}
            >
              <option value="">No workshop assigned</option>
              {workshops.filter((w) => w.active).map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="active"
              checked={form.active}
              onCheckedChange={(checked) => setForm({ ...form, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {manager ? "Save Changes" : "Add Manager"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
