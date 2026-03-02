"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ClipboardCheck, Clock, AlertTriangle, CheckCircle2, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCorrectiveActions } from "@/lib/store/incidents";
import { getEmployees, getEmployee } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type {
  CorrectiveAction,
  CorrectiveActionStatus,
  CorrectiveActionPriority,
  CorrectiveActionSource,
  Employee,
} from "@/lib/types";

const priorityBadgeStyles: Record<CorrectiveActionPriority, string> = {
  Low: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  High: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusBadgeStyles: Record<CorrectiveActionStatus, string> = {
  Open: "bg-red-500/10 text-red-400 border-red-500/20",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Overdue: "bg-red-500/15 text-red-400 border-red-500/30 font-bold",
  Closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function CorrectiveActionsPage() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CorrectiveActionStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<CorrectiveActionPriority | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<CorrectiveActionSource | "All">("All");

  useEffect(() => {
    async function load() {
      const [actions, employees] = await Promise.all([getCorrectiveActions(), getEmployees()]);
      setActions(actions);
      setEmployees(employees);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : id || "Unassigned";
  };

  const filtered = useMemo(() => {
    return actions.filter((a) => {
      const assigneeName = getEmployeeName(a.assigned_to).toLowerCase();
      const matchesSearch =
        search === "" ||
        a.action_number.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        assigneeName.includes(search.toLowerCase()) ||
        a.source_type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || a.priority === priorityFilter;
      const matchesSource = sourceFilter === "All" || a.source_type === sourceFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesSource;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, employees, search, statusFilter, priorityFilter, sourceFilter]);

  const stats = useMemo(() => {
    const total = actions.length;
    const open = actions.filter((a) => a.status === "Open").length;
    const inProgress = actions.filter((a) => a.status === "In Progress").length;
    const overdue = actions.filter((a) => a.status === "Overdue").length;
    const completed = actions.filter((a) => a.status === "Completed").length;
    return { total, open, inProgress, overdue, completed };
  }, [actions]);

  const statCards = [
    {
      label: "Total Actions",
      value: stats.total,
      icon: ListTodo,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Open",
      value: stats.open,
      icon: ClipboardCheck,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pt-12 lg:pt-0">
        <div>
          <h1 className="section-header text-2xl font-bold tracking-tight text-foreground">
            Corrective Actions Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage corrective actions from incidents, inspections, and audits
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-[#1a1d27]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="data-value text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/60 bg-[#1a1d27]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by action number, description, assignee, or source..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CorrectiveActionStatus | "All")}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
              <option value="Closed">Closed</option>
            </select>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as CorrectiveActionPriority | "All")}
            >
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as CorrectiveActionSource | "All")}
            >
              <option value="All">All Sources</option>
              <option value="Incident">Incident</option>
              <option value="Inspection">Inspection</option>
              <option value="Audit">Audit</option>
              <option value="SWMS Review">SWMS Review</option>
              <option value="Toolbox Talk">Toolbox Talk</option>
              <option value="WorkSafe Notice">WorkSafe Notice</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60 bg-[#1a1d27]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Action #</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Assigned To</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No corrective actions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((action) => (
                    <TableRow key={action.id} className="hover:bg-white/[0.02]">
                      <TableCell className="font-mono text-sm font-medium text-amber-400/90">
                        {action.action_number}
                      </TableCell>
                      <TableCell className="text-sm max-w-[280px]">
                        <span className="block truncate" title={action.description}>
                          {action.description}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{action.source_type}</span>
                          {action.source_reference && (
                            <span className="text-xs text-muted-foreground/60">
                              {action.source_reference}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${priorityBadgeStyles[action.priority]}`}
                        >
                          {action.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getEmployeeName(action.assigned_to)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <span className="data-value">{formatDate(action.due_date)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${statusBadgeStyles[action.status]}`}
                        >
                          {action.status}
                        </Badge>
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
