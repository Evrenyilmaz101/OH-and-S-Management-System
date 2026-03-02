"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, ClipboardList, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { getEmployees } from "@/lib/store/employees";
import { getOnboardingRecords } from "@/lib/store/onboarding";
import { getInductionsByEmployee } from "@/lib/store/onboarding";
import { getInductionTemplates } from "@/lib/store/onboarding";
import { formatDate } from "@/lib/utils";
import type {
  Employee,
  OnboardingRecord,
  OnboardingStatus,
} from "@/lib/types";

interface OnboardingRow {
  employee: Employee;
  onboarding: OnboardingRecord;
  inductionProgress: number;
}

function getStatusBadgeClasses(status: OnboardingStatus): string {
  switch (status) {
    case "Not Started":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "In Progress":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Completed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default function OnboardingListPage() {
  const [rows, setRows] = useState<OnboardingRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OnboardingStatus | "All">(
    "All"
  );

  useEffect(() => {
    async function load() {
      const [employees, onboardingRecords, allTemplates] = await Promise.all([
        getEmployees(),
        getOnboardingRecords(),
        getInductionTemplates(),
      ]);
      const templates = allTemplates.filter((t) => t.active);

      const dataPromises = onboardingRecords.map(async (onb) => {
        const employee = employees.find((e) => e.id === onb.employee_id);
        if (!employee) return null;

        const inductionRecords = await getInductionsByEmployee(employee.id);
        const applicableTemplates = templates.filter(
          (t) =>
            t.required_for === "All" ||
            t.required_for === employee.employment_type
        );
        const totalItems = applicableTemplates.length;
        const completedItems = inductionRecords.filter(
          (r) => r.status === "Completed"
        ).length;
        const inductionProgress =
          totalItems > 0
            ? Math.round((completedItems / totalItems) * 100)
            : 0;

        return {
          employee,
          onboarding: onb,
          inductionProgress,
        } as OnboardingRow;
      });

      const data = (await Promise.all(dataPromises)).filter(Boolean) as OnboardingRow[];
      setRows(data);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        search === "" ||
        `${row.employee.first_name} ${row.employee.last_name} ${row.employee.role}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || row.onboarding.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const counts = useMemo(() => {
    const total = rows.length;
    const inProgress = rows.filter(
      (r) => r.onboarding.status === "In Progress"
    ).length;
    const completed = rows.filter(
      (r) => r.onboarding.status === "Completed"
    ).length;
    const notStarted = rows.filter(
      (r) => r.onboarding.status === "Not Started"
    ).length;
    return { total, inProgress, completed, notStarted };
  }, [rows]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Onboarding"
        description="Track employee onboarding and induction progress"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Records</p>
                <p className="text-lg font-bold data-value">{counts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <ClipboardList className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-lg font-bold data-value text-amber-500">
                  {counts.inProgress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ClipboardList className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-bold data-value text-emerald-500">
                  {counts.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-500/10">
                <ClipboardList className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Not Started</p>
                <p className="text-lg font-bold data-value">
                  {counts.notStarted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or role..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OnboardingStatus | "All")
              }
            >
              <option value="All">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Onboarding List */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-amber-500" />
            Onboarding Records
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Employee
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Start Date
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Induction Progress
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground text-sm"
                    >
                      No onboarding records found
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr
                      key={row.onboarding.id}
                      className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/onboarding/${row.employee.id}`}
                          className="font-medium text-sm hover:underline text-foreground"
                        >
                          {row.employee.first_name} {row.employee.last_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {row.employee.role}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground data-value">
                        {formatDate(row.onboarding.start_date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <Progress
                            value={row.inductionProgress}
                            className="h-2 flex-1"
                          />
                          <span className="text-xs font-medium data-value w-10 text-right">
                            {row.inductionProgress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusBadgeClasses(
                            row.onboarding.status
                          )}`}
                        >
                          {row.onboarding.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/onboarding/${row.employee.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
