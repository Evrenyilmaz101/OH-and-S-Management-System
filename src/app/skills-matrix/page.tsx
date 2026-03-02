"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getEmployees } from "@/lib/store/employees";
import { getTasks } from "@/lib/store/tasks";
import { getVOCRecords } from "@/lib/store/voc";
import { getRoles } from "@/lib/store/roles";
import { getExpiryStatus } from "@/lib/utils";
import type { Employee, Task, VOCRecord, RoleDefinition } from "@/lib/types";

type CellStatus = "competent" | "in-training" | "not-competent" | "gap" | "not-required" | "expiring";

interface MatrixCell {
  status: CellStatus;
  vocRecord: VOCRecord | null;
  label: string;
}

function getCellForEmployee(
  employee: Employee,
  taskId: string,
  vocRecords: VOCRecord[],
  roles: RoleDefinition[]
): MatrixCell {
  // Find the most recent VOC record for this employee + task
  const records = vocRecords
    .filter((v) => v.employee_id === employee.id && v.task_id === taskId)
    .sort((a, b) => new Date(b.assessed_date).getTime() - new Date(a.assessed_date).getTime());

  const latestRecord = records[0] || null;

  // Find the employee's role definition
  const role = roles.find((r) => r.id === employee.role_id);
  const isRequiredByRole = role ? role.required_task_ids.includes(taskId) : false;

  if (latestRecord) {
    if (latestRecord.status === "Competent") {
      // Check if expiring
      if (latestRecord.expiry_date && getExpiryStatus(latestRecord.expiry_date) === "expiring") {
        return { status: "expiring", vocRecord: latestRecord, label: "Expiring" };
      }
      if (latestRecord.expiry_date && getExpiryStatus(latestRecord.expiry_date) === "expired") {
        return { status: "gap", vocRecord: latestRecord, label: "Expired" };
      }
      return { status: "competent", vocRecord: latestRecord, label: "Competent" };
    }
    if (latestRecord.status === "In Training") {
      return { status: "in-training", vocRecord: latestRecord, label: "In Training" };
    }
    // Not Competent
    return { status: "not-competent", vocRecord: latestRecord, label: "Not Competent" };
  }

  // No VOC record exists
  if (isRequiredByRole) {
    return { status: "gap", vocRecord: null, label: "GAP" };
  }

  return { status: "not-required", vocRecord: null, label: "-" };
}

export default function SkillsMatrixPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vocRecords, setVocRecords] = useState<VOCRecord[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  useEffect(() => {
    async function load() {
      const [loadedEmployees, loadedTasks, loadedVocRecords, loadedRoles] = await Promise.all([
        getEmployees(),
        getTasks(),
        getVOCRecords(),
        getRoles(),
      ]);
      setEmployees(loadedEmployees);
      setTasks(loadedTasks);
      setVocRecords(loadedVocRecords);
      setRoles(loadedRoles);
    }
    load();
  }, []);

  const activeTasks = useMemo(() => tasks.filter((t) => t.active), [tasks]);
  const activeRoles = useMemo(() => roles.filter((r) => r.active), [roles]);

  // Build the full matrix
  const matrix = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === "Active");
    return activeEmployees.map((emp) => ({
      employee: emp,
      cells: activeTasks.map((task) => ({
        taskId: task.id,
        ...getCellForEmployee(emp, task.id, vocRecords, roles),
      })),
    }));
  }, [employees, activeTasks, vocRecords, roles]);

  // Apply filters
  const filteredMatrix = useMemo(() => {
    let result = matrix;

    if (roleFilter !== "All") {
      result = result.filter((row) => row.employee.role_id === roleFilter);
    }

    if (showGapsOnly) {
      result = result.filter((row) =>
        row.cells.some((c) => c.status === "gap" || c.status === "not-competent")
      );
    }

    if (showExpiringOnly) {
      result = result.filter((row) =>
        row.cells.some((c) => c.status === "expiring")
      );
    }

    return result;
  }, [matrix, roleFilter, showGapsOnly, showExpiringOnly]);

  // Summary: count competent per task
  const summaryRow = useMemo(() => {
    return activeTasks.map((task) => {
      const count = filteredMatrix.filter((row) =>
        row.cells.find(
          (c) => c.taskId === task.id && (c.status === "competent" || c.status === "expiring")
        )
      ).length;
      return { taskId: task.id, competentCount: count };
    });
  }, [activeTasks, filteredMatrix]);

  // Stats
  const totalGaps = useMemo(() => {
    return filteredMatrix.reduce(
      (acc, row) => acc + row.cells.filter((c) => c.status === "gap" || c.status === "not-competent").length,
      0
    );
  }, [filteredMatrix]);

  const totalExpiring = useMemo(() => {
    return filteredMatrix.reduce(
      (acc, row) => acc + row.cells.filter((c) => c.status === "expiring").length,
      0
    );
  }, [filteredMatrix]);

  const totalCompetent = useMemo(() => {
    return filteredMatrix.reduce(
      (acc, row) => acc + row.cells.filter((c) => c.status === "competent").length,
      0
    );
  }, [filteredMatrix]);

  const cellBg = (status: CellStatus) => {
    switch (status) {
      case "competent":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/20";
      case "in-training":
        return "bg-amber-500/15 text-amber-500 border-amber-500/20";
      case "not-competent":
        return "bg-red-500/15 text-red-500 border-red-500/20";
      case "gap":
        return "bg-red-500/20 text-red-400 border-red-500/30 font-semibold";
      case "expiring":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "not-required":
        return "bg-zinc-500/5 text-zinc-600 border-zinc-500/10";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-full mx-auto">
      <div className="pt-12 lg:pt-0">
        <div className="section-header">SKILLS MATRIX</div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Skills Matrix
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Employee vs Task competency overview — VOC gap analysis by role
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Employees</p>
            <p className="text-2xl font-bold data-value mt-1">{filteredMatrix.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Competent</p>
            <p className="text-2xl font-bold data-value mt-1 text-emerald-500">{totalCompetent}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Gaps</p>
            <p className="text-2xl font-bold data-value mt-1 text-red-500">{totalGaps}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Expiring</p>
            <p className="text-2xl font-bold data-value mt-1 text-amber-500">{totalExpiring}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Role:</label>
              <select
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                {activeRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowGapsOnly(!showGapsOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                showGapsOnly
                  ? "bg-red-500/15 border-red-500/30 text-red-400"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  showGapsOnly ? "bg-red-500" : "bg-zinc-600"
                }`}
              />
              Show gaps only
            </button>

            <button
              onClick={() => setShowExpiringOnly(!showExpiringOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                showExpiringOnly
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border/80"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  showExpiringOnly ? "bg-amber-500" : "bg-zinc-600"
                }`}
              />
              Show expiring only
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-emerald-500/40 border border-emerald-500/30" />
          Competent
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-500/40 border border-amber-500/30" />
          In Training / Expiring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/30" />
          Not Competent / Gap
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-zinc-500/20 border border-zinc-500/15" />
          Not Required
        </span>
      </div>

      {/* Matrix Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {filteredMatrix.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No employees match the current filters
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-3 sticky left-0 bg-card z-10 min-w-[180px]">
                      Employee
                    </th>
                    {activeTasks.map((task) => (
                      <th
                        key={task.id}
                        className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-2 min-w-[90px] max-w-[120px]"
                        title={task.name}
                      >
                        <div className="truncate">{task.name}</div>
                        <div className="text-[9px] font-normal text-muted-foreground/60 mt-0.5">
                          {task.risk_level}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((row) => {
                    const role = roles.find((r) => r.id === row.employee.role_id);
                    return (
                      <tr
                        key={row.employee.id}
                        className="border-b border-border/30 hover:bg-accent/30 transition-colors"
                      >
                        <td className="p-3 sticky left-0 bg-card z-10">
                          <div className="font-medium text-sm text-foreground">
                            {row.employee.first_name} {row.employee.last_name}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {role?.name || row.employee.role}
                          </div>
                        </td>
                        {row.cells.map((cell) => (
                          <td key={cell.taskId} className="p-1.5 text-center">
                            <div
                              className={`data-value inline-flex items-center justify-center px-2 py-1 rounded text-[10px] border min-w-[70px] ${cellBg(
                                cell.status
                              )}`}
                              title={
                                cell.vocRecord
                                  ? `Assessed: ${cell.vocRecord.assessed_date}${
                                      cell.vocRecord.expiry_date
                                        ? ` | Expires: ${cell.vocRecord.expiry_date}`
                                        : ""
                                    }`
                                  : cell.status === "gap"
                                  ? "Required by role - no VOC record"
                                  : "Not required by role"
                              }
                            >
                              {cell.label}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
                {/* Summary Row */}
                <tfoot>
                  <tr className="border-t-2 border-border/60 bg-accent/20">
                    <td className="p-3 sticky left-0 bg-card z-10">
                      <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                        Competent Total
                      </div>
                    </td>
                    {summaryRow.map((s) => (
                      <td key={s.taskId} className="p-1.5 text-center">
                        <span className="data-value text-xs font-semibold text-foreground">
                          {s.competentCount}
                          <span className="text-muted-foreground font-normal">
                            /{filteredMatrix.length}
                          </span>
                        </span>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
