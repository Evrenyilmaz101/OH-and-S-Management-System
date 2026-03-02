"use client";

import Link from "next/link";
import { AlertTriangle, HeartPulse } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import type {
  Employee,
  IncidentReport,
  FirstAidEntry,
} from "@/lib/types";

interface IncidentsTabProps {
  employee: Employee;
  incidents: IncidentReport[];
  firstAidEntries: FirstAidEntry[];
  employees: Employee[];
}

export function IncidentsTab({
  employee,
  incidents,
  firstAidEntries,
  employees,
}: IncidentsTabProps) {
  const getEmployeeName = (id: string): string => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const getRole = (incident: IncidentReport): string => {
    if (incident.involved_person_ids?.includes(employee.id)) return "Involved";
    if (incident.witness_ids?.includes(employee.id)) return "Witness";
    return "Related";
  };

  return (
    <div className="space-y-6">
      {/* Incident Involvement */}
      <div>
        <div className="section-header">INCIDENT INVOLVEMENT</div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Incidents
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {incidents.length} incident
                {incidents.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">
                      Incident Number
                    </TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Severity</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">
                      Role in Incident
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <AlertTriangle className="w-8 h-8 text-muted-foreground/50" />
                          <p className="text-sm">
                            No incident involvement recorded.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell className="font-medium text-sm">
                          <Link
                            href={`/incidents/${incident.id}`}
                            className="text-amber-500 hover:text-amber-400 hover:underline"
                          >
                            {incident.incident_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(incident.date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={incident.type} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={incident.severity} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={incident.status} />
                        </TableCell>
                        <TableCell className="text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide ${
                              getRole(incident) === "Involved"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            {getRole(incident)}
                          </span>
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

      {/* First Aid Entries */}
      <div>
        <div className="section-header">FIRST AID ENTRIES</div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" />
              First Aid
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {firstAidEntries.length} entr
                {firstAidEntries.length !== 1 ? "ies" : "y"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">
                      Nature of Injury
                    </TableHead>
                    <TableHead className="text-xs">Treatment</TableHead>
                    <TableHead className="text-xs">Treated By</TableHead>
                    <TableHead className="text-xs">
                      Follow-up Required
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {firstAidEntries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <HeartPulse className="w-8 h-8 text-muted-foreground/50" />
                          <p className="text-sm">
                            No first aid entries recorded.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    firstAidEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(entry.date)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {entry.nature_of_injury}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                          {entry.treatment_provided}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getEmployeeName(entry.treated_by)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide ${
                              entry.follow_up_required
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}
                          >
                            {entry.follow_up_required ? "Yes" : "No"}
                          </span>
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
    </div>
  );
}
