"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Tag,
  Wrench,
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSOP, getSOPAcksBySOP } from "@/lib/store/sops";
import { getEmployees } from "@/lib/store/employees";
import { getTasks } from "@/lib/store/tasks";
import { formatDate } from "@/lib/utils";
import type { SOP, SOPAcknowledgment, Employee, Task } from "@/lib/types";

const statusConfig: Record<string, { label: string; className: string }> = {
  Current: {
    label: "Current",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  "Under Review": {
    label: "Under Review",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Archived: {
    label: "Archived",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export default function SOPDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sop, setSOP] = useState<SOP | null>(null);
  const [acknowledgments, setAcknowledgments] = useState<SOPAcknowledgment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function load() {
      const id = params.id as string;
      const found = await getSOP(id);
      if (!found) {
        router.push("/sops");
        return;
      }
      const [acks, emps, tasks] = await Promise.all([getSOPAcksBySOP(id), getEmployees(), getTasks()]);
      setSOP(found);
      setAcknowledgments(acks);
      setEmployees(emps);
      setAllTasks(tasks);
    }
    load();
  }, [params.id, router]);

  const getEmployeeName = (employeeId: string): string => {
    const emp = employees.find((e) => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getTaskName = (taskId: string): string => {
    const task = allTasks.find((t) => t.id === taskId);
    return task ? task.name : "Unknown Task";
  };

  if (!sop) return null;

  const badge = statusConfig[sop.status] || statusConfig.Current;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-12 lg:pt-0">
        <Link
          href="/sops"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SOPs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {sop.title}
              </h1>
              <Badge variant="outline" className={badge.className}>
                {badge.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono">{sop.document_number}</span>
              <span>&#183;</span>
              <span>Version {sop.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Tag className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium">{sop.category}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className={badge.className}>
                {badge.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Review Date</p>
              <p className="text-sm font-medium">{formatDate(sop.review_date)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <User className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Reviewed By</p>
              <p className="text-sm font-medium">{sop.last_reviewed_by || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {sop.description && (
        <Card className="mb-8 border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Description
            </p>
            <p className="text-sm">{sop.description}</p>
          </CardContent>
        </Card>
      )}

      {/* SOP Content */}
      <Card className="mb-8 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            <span className="section-header">SOP Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="rounded-lg bg-[#0f1117] border border-border/40 p-5">
            <div className="whitespace-pre-wrap font-mono text-sm text-zinc-300 leading-relaxed">
              {sop.content || "No content available."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associated Equipment */}
      {sop.associated_equipment && sop.associated_equipment.length > 0 && (
        <Card className="mb-8 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              <span className="section-header">Associated Equipment</span>
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {sop.associated_equipment.length} item
                {sop.associated_equipment.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {sop.associated_equipment.map((equip) => (
                <Badge
                  key={equip}
                  variant="outline"
                  className="bg-zinc-500/10 text-zinc-300 border-zinc-500/20"
                >
                  {equip}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Associated Tasks */}
      {sop.associated_task_ids && sop.associated_task_ids.length > 0 && (
        <Card className="mb-8 border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-amber-500" />
              <span className="section-header">Associated Tasks</span>
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {sop.associated_task_ids.length} task
                {sop.associated_task_ids.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {sop.associated_task_ids.map((taskId) => (
                <Badge
                  key={taskId}
                  variant="outline"
                  className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                >
                  {getTaskName(taskId)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Acknowledgments */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span className="section-header">Employee Acknowledgments</span>
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {acknowledgments.length} acknowledgment
              {acknowledgments.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Employee</TableHead>
                  <TableHead className="text-xs">Acknowledged</TableHead>
                  <TableHead className="text-xs">Acknowledged Date</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acknowledgments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No acknowledgments recorded
                    </TableCell>
                  </TableRow>
                ) : (
                  acknowledgments.map((ack) => (
                    <TableRow key={ack.id}>
                      <TableCell className="font-medium text-sm">
                        {getEmployeeName(ack.employee_id)}
                      </TableCell>
                      <TableCell>
                        {ack.acknowledged ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          >
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-500 border-red-500/20"
                          >
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ack.acknowledged_date
                          ? formatDate(ack.acknowledged_date)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                        {ack.notes || "—"}
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
  );
}
