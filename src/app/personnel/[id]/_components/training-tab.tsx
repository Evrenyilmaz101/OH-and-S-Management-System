"use client";

import { BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type {
  Employee,
  SOPAcknowledgment,
  SOP,
  ToolboxTalk,
} from "@/lib/types";

interface TrainingTabProps {
  employee: Employee;
  sopAcknowledgments: SOPAcknowledgment[];
  sops: SOP[];
  toolboxTalks: ToolboxTalk[];
  employees: Employee[];
}

export function TrainingTab({
  employee,
  sopAcknowledgments,
  sops,
  toolboxTalks,
  employees,
}: TrainingTabProps) {
  const getSOPTitle = (sopId: string): string => {
    const sop = sops.find((s) => s.id === sopId);
    return sop?.title || "Unknown SOP";
  };

  const getSOPDocNumber = (sopId: string): string => {
    const sop = sops.find((s) => s.id === sopId);
    return sop?.document_number || "\u2014";
  };

  const getEmployeeName = (id: string): string => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* SOP Acknowledgments */}
      <div>
        <div className="section-header">SOP ACKNOWLEDGMENTS</div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              SOP Acknowledgments
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {sopAcknowledgments.length} record
                {sopAcknowledgments.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">SOP Title</TableHead>
                    <TableHead className="text-xs">
                      Document Number
                    </TableHead>
                    <TableHead className="text-xs">
                      Acknowledged Date
                    </TableHead>
                    <TableHead className="text-xs">Acknowledged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sopAcknowledgments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                          <p className="text-sm">
                            No SOP acknowledgments recorded.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sopAcknowledgments.map((ack) => (
                      <TableRow key={ack.id}>
                        <TableCell className="font-medium text-sm">
                          {getSOPTitle(ack.sop_id)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {getSOPDocNumber(ack.sop_id)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {ack.acknowledged_date
                            ? formatDate(ack.acknowledged_date)
                            : "\u2014"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide ${
                              ack.acknowledged
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {ack.acknowledged ? "Yes" : "No"}
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

      {/* Toolbox Talk Attendance */}
      <div>
        <div className="section-header">TOOLBOX TALK ATTENDANCE</div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Toolbox Talks
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {toolboxTalks.length} talk
                {toolboxTalks.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Conducted By</TableHead>
                    <TableHead className="text-xs">Topics</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {toolboxTalks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-8 h-8 text-muted-foreground/50" />
                          <p className="text-sm">
                            No toolbox talk attendance recorded.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    toolboxTalks.map((talk) => (
                      <TableRow key={talk.id}>
                        <TableCell className="font-medium text-sm">
                          {talk.title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(talk.date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {talk.location || "\u2014"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getEmployeeName(talk.conducted_by)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[300px]">
                            {talk.topics_covered.map((topic, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
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
