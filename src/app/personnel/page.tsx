"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, UserCircle } from "lucide-react";
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
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EmployeeDialog } from "@/components/employee-dialog";
import {
  getEmployees,
  updateEmployee,
  createEmployeeWithOnboarding,
} from "@/lib/store/index";
import { getAllEmployeeCompliance } from "@/lib/store/compliance-engine";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Employee, EmploymentType, EmployeeStatus } from "@/lib/types";
import type { ComplianceStatus } from "@/lib/store/compliance-engine";

function getComplianceColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (pct >= 50) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

export default function PersonnelPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [complianceMap, setComplianceMap] = useState<
    Map<string, ComplianceStatus>
  >(new Map());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EmploymentType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "All">(
    "All"
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const loadData = async () => {
    const [emps, complianceList] = await Promise.all([
      getEmployees(),
      getAllEmployeeCompliance(),
    ]);
    setEmployees(emps);
    const map = new Map<string, ComplianceStatus>();
    complianceList.forEach((c) => map.set(c.employeeId, c));
    setComplianceMap(map);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesSearch =
        search === "" ||
        `${e.first_name} ${e.last_name} ${e.role} ${e.email}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesType =
        typeFilter === "All" || e.employment_type === typeFilter;
      const matchesStatus =
        statusFilter === "All" || e.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [employees, search, typeFilter, statusFilter]);

  const handleSave = async (employee: Employee) => {
    if (editingEmployee) {
      await updateEmployee(employee);
    } else {
      await createEmployeeWithOnboarding(employee);
      toast.success("Employee created with onboarding records");
    }
    await loadData();
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      <PageHeader
        title="Employee Files"
        description="Manage employees, apprentices, and contractors — click a name to open their file"
      >
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, or email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as EmploymentType | "All")
              }
            >
              <option value="All">All Types</option>
              <option value="Employee">Employee</option>
              <option value="Contractor">Contractor</option>
              <option value="Visitor">Visitor</option>
            </select>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as EmployeeStatus | "All")
              }
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Compliance</TableHead>
                  <TableHead className="text-xs">Start Date</TableHead>
                  <TableHead className="text-xs">Contact</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No personnel found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((employee) => {
                    const compliance = complianceMap.get(employee.id);
                    const pct = compliance?.overallCompliance ?? 0;
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Link
                            href={`/personnel/${employee.id}`}
                            className="flex items-center gap-2.5 hover:underline"
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <UserCircle className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {employee.first_name} {employee.last_name}
                              </p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {employee.role}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={employee.employment_type} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={employee.status} />
                        </TableCell>
                        <TableCell>
                          {employee.status === "Active" ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getComplianceColor(pct)}`}
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(employee.start_date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {employee.phone}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                          >
                            Edit
                          </Button>
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

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editingEmployee}
        onSave={handleSave}
      />
    </div>
  );
}
