"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, ShieldAlert } from "lucide-react";
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
import { getSWMSList } from "@/lib/store/compliance";
import { getEmployees } from "@/lib/store/employees";
import { getTasks } from "@/lib/store/tasks";
import { formatDate } from "@/lib/utils";
import type { SWMS, SWMSStatus, Employee, Task } from "@/lib/types";

function getStatusStyle(status: SWMSStatus): string {
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

export default function SWMSPage() {
  const [swmsList, setSwmsList] = useState<SWMS[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [swms, emps, t] = await Promise.all([getSWMSList(), getEmployees(), getTasks()]);
      setSwmsList(swms);
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
    return swmsList.filter((swms) => {
      if (search === "") return true;
      return (
        swms.title.toLowerCase().includes(q) ||
        swms.document_number.toLowerCase().includes(q) ||
        swms.content.toLowerCase().includes(q) ||
        swms.high_risk_activities.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [swmsList, search]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      <PageHeader
        title="SWMS Register"
        description="Safe Work Method Statements for high-risk construction work"
      />

      {/* Search Bar */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, document number, or high-risk activity..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SWMS Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Document Number</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Version</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">High Risk Activities</TableHead>
                  <TableHead className="text-xs">Review Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-muted-foreground/40" />
                        <span className="text-sm">No SWMS records found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((swms) => (
                    <>
                      <TableRow
                        key={swms.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleExpand(swms.id)}
                      >
                        <TableCell className="w-8 px-3">
                          {expandedId === swms.id ? (
                            <ChevronDown className="w-4 h-4 text-amber-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-muted-foreground">
                          {swms.document_number}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {swms.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          v{swms.version}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs border ${getStatusStyle(swms.status)}`}
                          >
                            {swms.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {swms.high_risk_activities.map((activity) => (
                              <Badge
                                key={activity}
                                variant="outline"
                                className="text-xs bg-red-500/10 text-red-400 border-red-500/20 font-normal"
                              >
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(swms.review_date)}
                        </TableCell>
                      </TableRow>
                      {expandedId === swms.id && (
                        <TableRow key={`${swms.id}-expanded`}>
                          <TableCell colSpan={7} className="p-0">
                            <div className="bg-[#1a1d27] border-t border-b border-amber-500/20 p-6">
                              <div className="section-header">
                                SWMS DETAILS
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Prepared By
                                  </span>
                                  <p className="text-sm">
                                    {getEmployeeName(swms.prepared_by)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Reviewed By
                                  </span>
                                  <p className="text-sm">
                                    {getEmployeeName(swms.reviewed_by)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground">
                                    Approved By
                                  </span>
                                  <p className="text-sm">
                                    {getEmployeeName(swms.approved_by)}
                                  </p>
                                </div>
                              </div>
                              {swms.associated_task_ids.length > 0 && (
                                <div className="mb-4">
                                  <span className="text-xs text-muted-foreground">
                                    Associated Tasks
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {swms.associated_task_ids.map((taskId) => (
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
                              <div>
                                <span className="text-xs text-muted-foreground">
                                  Content
                                </span>
                                <div className="mt-1 p-4 rounded-lg bg-[#0f1117] border border-border/40 text-sm font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-96 overflow-y-auto">
                                  {swms.content || "No content available."}
                                </div>
                              </div>
                              {swms.notes && (
                                <div className="mt-4">
                                  <span className="text-xs text-muted-foreground">
                                    Notes
                                  </span>
                                  <p className="text-sm mt-0.5 text-muted-foreground">
                                    {swms.notes}
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
