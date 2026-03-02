"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { getRiskAssessments } from "@/lib/store/compliance";
import { getEmployees } from "@/lib/store/employees";
import { getTasks } from "@/lib/store/tasks";
import { formatDate } from "@/lib/utils";
import type {
  RiskAssessment,
  RiskAssessmentStatus,
  RiskLevel,
  Employee,
  Task,
} from "@/lib/types";

function getStatusStyle(status: RiskAssessmentStatus): string {
  switch (status) {
    case "Current":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Under Review":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Draft":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "Archived":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function getRiskStyle(level: RiskLevel): string {
  switch (level) {
    case "Low":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Medium":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "High":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "Critical":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default function RiskAssessmentsPage() {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [a, emps, t] = await Promise.all([getRiskAssessments(), getEmployees(), getTasks()]);
      setAssessments(a);
      setEmployees(emps);
      setTasks(t);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : id || "—";
  };

  const getTaskName = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    return task ? task.name : id;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return assessments.filter((ra) => {
      if (search === "") return true;
      return (
        ra.title.toLowerCase().includes(q) ||
        ra.document_number.toLowerCase().includes(q) ||
        ra.location.toLowerCase().includes(q) ||
        ra.assessment_type.toLowerCase().includes(q) ||
        ra.content.toLowerCase().includes(q)
      );
    });
  }, [assessments, search]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      <PageHeader
        title="Risk Assessments"
        description="Workplace risk assessments and job safety analyses"
      />

      {/* Search Bar */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, document number, location, or type..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Document Number</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Assessment Type</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Risk Before</TableHead>
                  <TableHead className="text-xs">Risk After</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Assessment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-muted-foreground/40" />
                        <span className="text-sm">
                          No risk assessments found
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((ra) => (
                    <>
                      <TableRow
                        key={ra.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleExpand(ra.id)}
                      >
                        <TableCell className="w-8 px-3">
                          {expandedId === ra.id ? (
                            <ChevronDown className="w-4 h-4 text-amber-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {ra.document_number}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {ra.title}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {ra.assessment_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ra.location}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getRiskStyle(ra.risk_rating_before)}`}
                          >
                            {ra.risk_rating_before}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getRiskStyle(ra.risk_rating_after)}`}
                          >
                            {ra.risk_rating_after}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getStatusStyle(ra.status)}`}
                          >
                            {ra.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(ra.assessment_date)}
                        </TableCell>
                      </TableRow>
                      {expandedId === ra.id && (
                        <TableRow key={`${ra.id}-expanded`}>
                          <TableCell colSpan={9} className="p-0">
                            <div className="bg-[#1a1d27] border-t border-b border-amber-500/20 p-6">
                              <div className="section-header">
                                ASSESSMENT DETAILS
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Assessed By
                                  </span>
                                  <p className="text-sm">
                                    {getEmployeeName(ra.assessed_by)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Review Date
                                  </span>
                                  <p className="text-sm">
                                    {formatDate(ra.review_date)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Risk Reduction
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs border ${getRiskStyle(ra.risk_rating_before)}`}
                                    >
                                      {ra.risk_rating_before}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      →
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs border ${getRiskStyle(ra.risk_rating_after)}`}
                                    >
                                      {ra.risk_rating_after}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {ra.associated_task_ids.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-xs text-muted-foreground">
                                    Associated Tasks
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {ra.associated_task_ids.map((taskId) => (
                                      <Badge
                                        key={taskId}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {getTaskName(taskId)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {ra.controls && (
                                <div className="mb-4">
                                  <span className="text-xs text-muted-foreground">
                                    Controls
                                  </span>
                                  <div className="mt-1 p-3 rounded-lg bg-[#0f1117] border border-border/40 text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
                                    {ra.controls}
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  Content
                                </span>
                                <div className="mt-1 p-4 rounded-lg bg-[#0f1117] border border-border/40 text-sm font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-96 overflow-y-auto">
                                  {ra.content || "No content available."}
                                </div>
                              </div>
                              {ra.notes && (
                                <div className="mt-4">
                                  <span className="text-xs text-muted-foreground">
                                    Notes
                                  </span>
                                  <p className="text-sm mt-0.5 text-muted-foreground">
                                    {ra.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
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
