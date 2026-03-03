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
import type { Workshop } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface WorkshopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshop?: Workshop | null;
  onSave: (workshop: Workshop) => void;
}

const emptyWorkshop: Omit<Workshop, "id"> = {
  name: "",
  code: "",
  description: "",
  active: true,
};

export function WorkshopDialog({ open, onOpenChange, workshop, onSave }: WorkshopDialogProps) {
  const [form, setForm] = useState(emptyWorkshop);

  useEffect(() => {
    if (workshop) {
      const { id, ...rest } = workshop;
      void id;
      setForm(rest);
    } else {
      setForm(emptyWorkshop);
    }
  }, [workshop, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: workshop?.id || generateId(),
      ...form,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{workshop ? "Edit Workshop" : "Add Workshop"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                required
                placeholder="e.g. F1"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Processing"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
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
              {workshop ? "Save Changes" : "Add Workshop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
