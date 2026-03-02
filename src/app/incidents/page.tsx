"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
  Search,
  FileWarning,
  ShieldAlert,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { getIncidents } from "@/lib/store/incidents";
import { getEmployees } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type {
  IncidentReport,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  Employee,
} from "@/lib/types";

const statusStyles: Record<IncidentStatus, string> = {
  Open: "bg-red-500/10 text-red-500 border-red-500/20",
  "Under Investigation": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Corrective Actions": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Closed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const severityStyles: Record<IncidentSeverity, string> = {
  Insignificant: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Minor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Moderate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Major: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Catastrophic: "bg-red-500/10 text-red-500 border-red-500/20",
};

const incidentTypes: IncidentType[] = [
  "Near Miss",
  "First Aid",
  "Medical Treatment",
  "Lost Time Injury",
  "Dangerous Occurrence",
  "Property Damage",
];

const incidentSeverities: IncidentSeverity[] = [
  "Insignificant",
  "Minor",
  "Moderate",
  "Major",
  "Catastrophic",
];

const incidentStatuses: IncidentStatus[] = [
  "Open",
  "Under Investigation",
  "Corrective Actions",
  "Closed",
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<IncidentType | "All">("All");
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | "All">("All");

  useEffect(() => {
    async function load() {
      const [incidents, employees] = await Promise.all([getIncidents(), getEmployees()]);
      setIncidents(incidents);
      setEmployees(employees);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === "Open").length;
    const investigating = incidents.filter((i) => i.status === "Under Investigation").length;
    const closed = incidents.filter((i) => i.status === "Closed").length;
    return { total, open, investigating, closed };
  }, [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const matchesSearch =
        search === "" ||
        i.incident_number.toLowerCase().includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase()) ||
        getEmployeeName(i.reported_by).toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
      const matchesType = typeFilter === "All" || i.type === typeFilter;
      const matchesSeverity = severityFilter === "All" || i.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesType && matchesSeverity;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, employees, search, statusFilter, typeFilter, severityFilter]);

  const statCards = [
    {
      label: "Total Incidents",
      value: stats.total,
      icon: FileWarning,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Open",
      value: stats.open,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Under Investigation",
      value: stats.investigating,
      icon: ShieldAlert,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Closed",
      value: stats.closed,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Incident Register"
        description="Track and manage workplace incidents, near misses, and dangerous occurrences"
      >
        <Link href="/incidents/new">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            New Incident
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-1 data-value text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by incident number, location, or reporter..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "All")}
            >
              <option value="All">All Status</option>
              {incidentStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as IncidentType | "All")}
            >
              <option value="All">All Types</option>
              {incidentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as IncidentSeverity | "All")}
            >
              <option value="All">All Severity</option>
              {incidentSeverities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Incident Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Incident No.</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Severity</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Reported By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No incidents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((incident) => (
                    <TableRow
                      key={incident.id}
                      className={
                        incident.severity === "Catastrophic" || incident.severity === "Major"
                          ? "hazard-stripe"
                          : ""
                      }
                    >
                      <TableCell>
                        <Link
                          href={`/incidents/${incident.id}`}
                          className="font-medium text-sm data-value hover:underline text-amber-500"
                        >
                          {incident.incident_number}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(incident.date)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {incident.type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium border ${severityStyles[incident.severity]}`}
                        >
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium border ${statusStyles[incident.status]}`}
                        >
                          {incident.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {incident.location}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getEmployeeName(incident.reported_by)}
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
