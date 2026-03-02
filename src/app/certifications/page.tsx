"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
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
  getCertifications,
  getEmployees,
  addCertification,
  updateCertification,
} from "@/lib/store/index";
import { formatDate, getExpiryStatus, generateId } from "@/lib/utils";
import type { Certification, Employee, ExpiryStatus } from "@/lib/types";

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | "All">("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);

  const loadData = async () => {
    const [certifications, employees] = await Promise.all([getCertifications(), getEmployees()]);
    setCertifications(certifications);
    setEmployees(employees);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const filtered = useMemo(() => {
    return certifications.filter((c) => {
      const employeeName = getEmployeeName(c.employee_id).toLowerCase();
      const matchesSearch =
        search === "" ||
        employeeName.includes(search.toLowerCase()) ||
        c.cert_name.toLowerCase().includes(search.toLowerCase()) ||
        c.cert_number.toLowerCase().includes(search.toLowerCase()) ||
        c.issuing_body.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || getExpiryStatus(c.expiry_date) === statusFilter;
      return matchesSearch && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certifications, employees, search, statusFilter]);

  const handleSave = async (cert: Certification) => {
    if (editing) {
      await updateCertification(cert);
    } else {
      await addCertification(cert);
    }
    await loadData();
    setEditing(null);
    setDialogOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Certifications & Licences"
        description="Track employee certifications with 30-day expiry warnings"
      >
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </Button>
      </PageHeader>

      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, certification, or issuing body..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ExpiryStatus | "All")}
            >
              <option value="All">All Status</option>
              <option value="valid">Valid</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
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
                  <TableHead className="text-xs">Certification</TableHead>
                  <TableHead className="text-xs">Number</TableHead>
                  <TableHead className="text-xs">Issuing Body</TableHead>
                  <TableHead className="text-xs">Issue Date</TableHead>
                  <TableHead className="text-xs">Expiry Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No certifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium text-sm">
                        <Link
                          href={`/personnel/${cert.employee_id}`}
                          className="hover:underline"
                        >
                          {getEmployeeName(cert.employee_id)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">{cert.cert_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {cert.cert_number}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cert.issuing_body}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(cert.issue_date)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(cert.expiry_date)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getExpiryStatus(cert.expiry_date)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditing(cert);
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cert={editing}
        employees={employees}
        onSave={handleSave}
      />
    </div>
  );
}

function CertDialog({
  open,
  onOpenChange,
  cert,
  employees,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cert: Certification | null;
  employees: Employee[];
  onSave: (cert: Certification) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    employee_id: "",
    cert_name: "",
    cert_number: "",
    issuing_body: "",
    issue_date: today,
    expiry_date: today,
  });

  useEffect(() => {
    if (cert) {
      setForm({
        employee_id: cert.employee_id,
        cert_name: cert.cert_name,
        cert_number: cert.cert_number,
        issuing_body: cert.issuing_body,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date,
      });
    } else {
      setForm({
        employee_id: employees[0]?.id || "",
        cert_name: "",
        cert_number: "",
        issuing_body: "",
        issue_date: today,
        expiry_date: today,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cert, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: cert?.id || generateId(),
      ...form,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {cert ? "Edit Certification" : "Add Certification"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Employee</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
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
            <Label>Certification Name</Label>
            <Input
              value={form.cert_name}
              onChange={(e) => setForm({ ...form, cert_name: e.target.value })}
              required
              placeholder="e.g. Welding Certification AS 1796"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Certificate Number</Label>
              <Input
                value={form.cert_number}
                onChange={(e) => setForm({ ...form, cert_number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Issuing Body</Label>
              <Input
                value={form.issuing_body}
                onChange={(e) => setForm({ ...form, issuing_body: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{cert ? "Save Changes" : "Add Certification"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
