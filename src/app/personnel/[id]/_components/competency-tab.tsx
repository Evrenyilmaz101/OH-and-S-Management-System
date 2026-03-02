"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, getExpiryStatus } from "@/lib/utils";
import type { Employee, VOCRecord, Task, RoleDefinition } from "@/lib/types";

interface CompetencyTabProps {
  employee: Employee;
  vocRecords: VOCRecord[];
  tasks: Task[];
  role: RoleDefinition | null;
}

export function CompetencyTab({
  employee,
  vocRecords,
  tasks,
  role,
}: CompetencyTabProps) {
  const getTaskName = (taskId: string) =>
    tasks.find((t) => t.id === taskId)?.name || "Unknown Task";

  const requiredTaskIds = role?.required_task_ids || [];
  const hasRecords = vocRecords.length > 0;
  const hasRequirements = requiredTaskIds.length > 0;

  if (!hasRecords && !hasRequirements) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          No VOC records and no role requirements configured.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* VOC Records */}
      <div>
        <div className="section-header">VOC RECORDS</div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              VOC Records
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {vocRecords.length} record{vocRecords.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Task</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Assessed Date</TableHead>
                    <TableHead className="text-xs">Assessed By</TableHead>
                    <TableHead className="text-xs">Expiry</TableHead>
                    <TableHead className="text-xs">Expiry Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vocRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No VOC records
                      </TableCell>
                    </TableRow>
                  ) : (
                    vocRecords.map((voc) => (
                      <TableRow key={voc.id}>
                        <TableCell className="font-medium text-sm">
                          {getTaskName(voc.task_id)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={voc.status} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(voc.assessed_date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {voc.assessed_by}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(voc.expiry_date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={getExpiryStatus(voc.expiry_date)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Requirements / Gap Analysis */}
      {hasRequirements && (
        <div>
          <div className="section-header">ROLE REQUIREMENTS</div>
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                Required Competencies for {role?.name || "Role"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Task</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requiredTaskIds.map((taskId) => {
                      const taskName = getTaskName(taskId);
                      const vocRecord = vocRecords.find(
                        (v) => v.task_id === taskId && v.status === "Competent"
                      );

                      let statusLabel: string;
                      let statusColor: string;

                      if (!vocRecord) {
                        statusLabel = "Not Assessed";
                        statusColor =
                          "bg-red-500/10 text-red-500 border-red-500/20";
                      } else if (
                        vocRecord.expiry_date &&
                        getExpiryStatus(vocRecord.expiry_date) === "expired"
                      ) {
                        statusLabel = "Expired";
                        statusColor =
                          "bg-red-500/10 text-red-500 border-red-500/20";
                      } else {
                        statusLabel = "Competent";
                        statusColor =
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                      }

                      return (
                        <TableRow key={taskId}>
                          <TableCell className="font-medium text-sm">
                            {taskName}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground data-value">
                            {vocRecord?.expiry_date
                              ? formatDate(vocRecord.expiry_date)
                              : "\u2014"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
