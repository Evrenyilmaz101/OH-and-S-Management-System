"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Eye,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getIncident } from "@/lib/store/incidents";
import { getCorrectiveActionsBySource } from "@/lib/store/incidents";
import { getEmployees } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type {
  IncidentReport,
  IncidentStatus,
  IncidentSeverity,
  CorrectiveAction,
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

const correctiveStatusStyles: Record<string, string> = {
  Open: "bg-red-500/10 text-red-500 border-red-500/20",
  "In Progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Overdue: "bg-red-500/10 text-red-500 border-red-500/20",
  Closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>([]);

  useEffect(() => {
    async function load() {
      const id = params.id as string;
      const inc = await getIncident(id);
      if (!inc) {
        router.push("/incidents");
        return;
      }
      const [employees, correctiveActions] = await Promise.all([getEmployees(), getCorrectiveActionsBySource("Incident", id)]);
      setIncident(inc);
      setEmployees(employees);
      setCorrectiveActions(correctiveActions);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  if (!incident) return null;

  const isCritical =
    incident.severity === "Catastrophic" || incident.severity === "Major";

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-12 lg:pt-0">
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Incidents
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground data-value">
                {incident.incident_number}
              </h1>
              <Badge
                variant="outline"
                className={`text-xs font-medium border ${severityStyles[incident.severity]}`}
              >
                {incident.severity}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs font-medium border ${statusStyles[incident.status]}`}
              >
                {incident.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {incident.type}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="investigation">Investigation</TabsTrigger>
          <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Calendar className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium data-value">
                    {formatDate(incident.date)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium data-value">
                    {incident.time}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <MapPin className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{incident.location}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <User className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reported By</p>
                  <p className="text-sm font-medium">
                    {getEmployeeName(incident.reported_by)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className={`border-border/60 ${isCritical ? "hazard-stripe" : ""}`}>
            <CardContent className="p-6">
              <h3 className="section-header">Description</h3>
              <p className="text-sm text-foreground leading-relaxed">
                {incident.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Immediate Actions */}
          {incident.immediate_actions && (
            <Card className="border-border/60">
              <CardContent className="p-6">
                <h3 className="section-header">Immediate Actions Taken</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {incident.immediate_actions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Involved Persons & Witnesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Involved Persons
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {incident.involved_person_ids.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incident.involved_person_ids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No persons recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incident.involved_person_ids.map((personId) => {
                      const emp = employees.find((e) => e.id === personId);
                      return (
                        <div
                          key={personId}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50"
                        >
                          <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {emp
                                ? `${emp.first_name} ${emp.last_name}`
                                : "Unknown"}
                            </p>
                            {emp && (
                              <p className="text-xs text-muted-foreground">
                                {emp.role}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  Witnesses
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {incident.witness_ids.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incident.witness_ids.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No witnesses recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {incident.witness_ids.map((witnessId) => {
                      const emp = employees.find((e) => e.id === witnessId);
                      return (
                        <div
                          key={witnessId}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50"
                        >
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {emp
                                ? `${emp.first_name} ${emp.last_name}`
                                : "Unknown"}
                            </p>
                            {emp && (
                              <p className="text-xs text-muted-foreground">
                                {emp.role}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Investigation Tab */}
        <TabsContent value="investigation" className="space-y-6">
          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="section-header">Investigation Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Investigated By
                  </p>
                  <p className="text-sm font-medium">
                    {incident.investigated_by
                      ? getEmployeeName(incident.investigated_by)
                      : "Not yet assigned"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Investigation Date
                  </p>
                  <p className="text-sm font-medium data-value">
                    {incident.investigation_date
                      ? formatDate(incident.investigation_date)
                      : "Pending"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="section-header">Root Cause</h3>
              <p className="text-sm text-foreground leading-relaxed">
                {incident.root_cause || "Root cause analysis not yet completed."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-6">
              <h3 className="section-header">Contributing Factors</h3>
              <p className="text-sm text-foreground leading-relaxed">
                {incident.contributing_factors ||
                  "Contributing factors not yet identified."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Corrective Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                Corrective Actions
                <span className="ml-auto text-xs font-normal text-muted-foreground">
                  {correctiveActions.length} action
                  {correctiveActions.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Action No.</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                      <TableHead className="text-xs">Priority</TableHead>
                      <TableHead className="text-xs">Assigned To</TableHead>
                      <TableHead className="text-xs">Due Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {correctiveActions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No corrective actions linked to this incident
                        </TableCell>
                      </TableRow>
                    ) : (
                      correctiveActions.map((action) => (
                        <TableRow
                          key={action.id}
                          className={
                            action.priority === "Critical" ? "hazard-stripe" : ""
                          }
                        >
                          <TableCell className="font-medium text-sm data-value text-amber-500">
                            {action.action_number}
                          </TableCell>
                          <TableCell className="text-sm max-w-[250px]">
                            {action.description}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium border ${
                                priorityStyles[action.priority] || ""
                              }`}
                            >
                              {action.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getEmployeeName(action.assigned_to)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground data-value">
                            {action.due_date
                              ? formatDate(action.due_date)
                              : "No date"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium border ${
                                correctiveStatusStyles[action.status] || ""
                              }`}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
