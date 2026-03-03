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
import type { Employee, EmploymentType, EmployeeStatus, RoleDefinition, Manager, Workshop } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { getRoles } from "@/lib/store/roles";
import { getManagers } from "@/lib/store/managers";
import { getWorkshops } from "@/lib/store/workshops";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSave: (employee: Employee) => void;
  defaultWorkshopId?: string | null;
}

const emptyEmployee: Omit<Employee, "id"> = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  role_id: "",
  employment_type: "Employee",
  start_date: new Date().toISOString().split("T")[0],
  status: "Active",
  induction_status: "Not Started",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

export function EmployeeDialog({ open, onOpenChange, employee, onSave, defaultWorkshopId }: EmployeeDialogProps) {
  const [form, setForm] = useState(emptyEmployee);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [managers, setManagersList] = useState<Manager[]>([]);
  const [workshops, setWorkshopsList] = useState<Workshop[]>([]);

  useEffect(() => {
    async function loadData() {
      const [allRoles, mgrs, wkshps] = await Promise.all([getRoles(), getManagers(), getWorkshops()]);
      setRoles(allRoles.filter(r => r.active));
      setManagersList(mgrs.filter(m => m.active));
      setWorkshopsList(wkshps.filter(w => w.active));
    }
    loadData();
  }, [open]);

  useEffect(() => {
    if (employee) {
      const { id, ...rest } = employee;
      void id;
      setForm(rest);
    } else {
      setForm({ ...emptyEmployee, workshop_id: defaultWorkshopId || undefined });
    }
  }, [employee, open, defaultWorkshopId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: employee?.id || generateId(),
      ...form,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="employee_number">Employee Number</Label>
            <Input
              id="employee_number"
              placeholder="e.g. EMP-001"
              value={form.employee_number || ""}
              onChange={(e) => setForm({ ...form, employee_number: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role_id">Role</Label>
            <select
              id="role_id"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.role_id}
              onChange={(e) => {
                const r = roles.find(r => r.id === e.target.value);
                setForm({ ...form, role_id: e.target.value, role: r?.name || form.role });
              }}
            >
              <option value="">Select a role...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workshop_id">Workshop</Label>
              <select
                id="workshop_id"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.workshop_id || ""}
                onChange={(e) => setForm({ ...form, workshop_id: e.target.value || undefined })}
              >
                <option value="">No workshop assigned</option>
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.code} — {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager_id">Manager / Supervisor</Label>
              <select
                id="manager_id"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.manager_id || ""}
                onChange={(e) => setForm({ ...form, manager_id: e.target.value || undefined })}
              >
                <option value="">No manager assigned</option>
                {managers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name} — {mgr.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact</Label>
              <Input
                id="emergency_contact_name"
                placeholder="Contact name"
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Phone</Label>
              <Input
                id="emergency_contact_phone"
                placeholder="Phone number"
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employment_type">Type</Label>
              <select
                id="employment_type"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value as EmploymentType })}
              >
                <option value="Employee">Employee</option>
                <option value="Contractor">Contractor</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {employee ? "Save Changes" : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
