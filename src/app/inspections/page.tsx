"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronDown, ChevronRight, Eye } from "lucide-react";
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
import { getInspections } from "@/lib/store/registers";
import { getEmployees, getEmployee } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type {
  WorkplaceInspection,
  InspectionStatus,
  InspectionRating,
  InspectionFinding,
  Employee,
} from "@/lib/types";

const statusBadgeStyles: Record<InspectionStatus, string> = {
  Scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Overdue: "bg-red-500/10 text-red-400 border-red-500/20",
};

const ratingBadgeStyles: Record<InspectionRating, string> = {
  Satisfactory: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Needs Improvement": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Unsatisfactory: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<WorkplaceInspection[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [inspections, employees] = await Promise.all([getInspections(), getEmployees()]);
      setInspections(inspections);
      setEmployees(employees);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : id || "Unknown";
  };

  const filtered = useMemo(() => {
    return inspections.filter((i) => {
      const inspectorName = getEmployeeName(i.inspector).toLowerCase();
      const matchesSearch =
        search === "" ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.inspection_type.toLowerCase().includes(search.toLowerCase()) ||
        inspectorName.includes(search.toLowerCase()) ||
        i.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspections, employees, search, statusFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pt-12 lg:pt-0">
        <div>
          <h1 className="section-header text-2xl font-bold tracking-tight text-foreground">
            Inspections Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Scheduled and completed workplace inspections with findings
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border/60 bg-[#1a1d27]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, type, inspector, or location..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InspectionStatus | "All")}
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
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
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Scheduled Date</TableHead>
                  <TableHead className="text-xs">Completed Date</TableHead>
                  <TableHead className="text-xs">Inspector</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Rating</TableHead>
                  <TableHead className="text-xs text-center">Findings</TableHead>
                  <TableHead className="text-xs text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No inspections found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inspection) => {
                    const isExpanded = expandedId === inspection.id;
                    const findingsCount = inspection.findings?.length || 0;

                    return (
                      <>
                        <TableRow
                          key={inspection.id}
                          className="hover:bg-white/[0.02] cursor-pointer"
                          onClick={() => toggleExpand(inspection.id)}
                        >
                          <TableCell className="w-8 px-2">
                            {findingsCount > 0 && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            {inspection.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inspection.inspection_type}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="data-value">{formatDate(inspection.scheduled_date)}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="data-value">
                              {inspection.completed_date ? formatDate(inspection.completed_date) : "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getEmployeeName(inspection.inspector)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-xs border ${statusBadgeStyles[inspection.status]}`}
                            >
                              {inspection.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {inspection.overall_rating ? (
                              <Badge
                                variant="outline"
                                className={`text-xs border ${ratingBadgeStyles[inspection.overall_rating]}`}
                              >
                                {inspection.overall_rating}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="data-value text-sm font-medium">
                              {findingsCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/inspections/${inspection.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Findings */}
                        {isExpanded && findingsCount > 0 && (
                          <TableRow key={`${inspection.id}-findings`} className="bg-white/[0.01]">
                            <TableCell colSpan={10} className="p-0">
                              <div className="px-8 py-3 border-t border-border/30">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                                  Findings
                                </p>
                                <div className="space-y-2">
                                  {inspection.findings.map((finding, idx) => (
                                    <div
                                      key={finding.id}
                                      className="flex items-start gap-3 text-sm p-2 rounded-md bg-white/[0.02]"
                                    >
                                      <span className="text-xs text-muted-foreground/60 font-mono mt-0.5">
                                        {idx + 1}.
                                      </span>
                                      <div className="flex-1">
                                        <p className="text-sm text-foreground/90">
                                          {finding.description}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs border shrink-0 ${
                                          finding.severity === "Critical"
                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                            : finding.severity === "High"
                                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            : finding.severity === "Medium"
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                                        }`}
                                      >
                                        {finding.severity}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
