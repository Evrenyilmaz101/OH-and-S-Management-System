"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
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
import { getFirstAidEntries } from "@/lib/store/registers";
import { getEmployees, getEmployee } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type { FirstAidEntry, Employee } from "@/lib/types";

export default function FirstAidPage() {
  const [entries, setEntries] = useState<FirstAidEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [entries, employees] = await Promise.all([getFirstAidEntries(), getEmployees()]);
      setEntries(entries);
      setEmployees(employees);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : id || "Unknown";
  };

  const filtered = useMemo(() => {
    if (search === "") return entries;

    const q = search.toLowerCase();
    return entries.filter((entry) => {
      const injuredName = getEmployeeName(entry.injured_person_id).toLowerCase();
      const treatedByName = getEmployeeName(entry.treated_by).toLowerCase();
      return (
        injuredName.includes(q) ||
        treatedByName.includes(q) ||
        entry.nature_of_injury.toLowerCase().includes(q) ||
        entry.body_part.toLowerCase().includes(q) ||
        entry.treatment_provided.toLowerCase().includes(q) ||
        entry.location.toLowerCase().includes(q) ||
        entry.date.includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, employees, search]);

  const formatTime = (time: string) => {
    if (!time) return "—";
    // Handle HH:MM format
    const parts = time.split(":");
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    return time;
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pt-12 lg:pt-0">
        <div>
          <h1 className="section-header text-2xl font-bold tracking-tight text-foreground">
            First Aid Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record of all first aid treatments administered in the workplace
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6 border-border/60 bg-[#1a1d27]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by person, injury, treatment, body part, or location..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                  <TableHead className="text-xs">Injured Person</TableHead>
                  <TableHead className="text-xs">Nature of Injury</TableHead>
                  <TableHead className="text-xs">Body Part</TableHead>
                  <TableHead className="text-xs">Treatment</TableHead>
                  <TableHead className="text-xs">Treated By</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs text-center">Follow-up</TableHead>
                  <TableHead className="text-xs text-right">Incident</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No first aid entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-white/[0.02]">
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        <span className="data-value">{formatDate(entry.date)}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        <span className="data-value">{formatTime(entry.time)}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {getEmployeeName(entry.injured_person_id)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.nature_of_injury}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.body_part}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                        <span className="block truncate" title={entry.treatment_provided}>
                          {entry.treatment_provided}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getEmployeeName(entry.treated_by)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.location}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.follow_up_required ? (
                          <Badge
                            variant="outline"
                            className="text-xs border bg-amber-500/10 text-amber-400 border-amber-500/20"
                          >
                            Required
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs border bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          >
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.incident_report_id ? (
                          <Link href={`/incidents/${entry.incident_report_id}`}>
                            <Button variant="ghost" size="sm" className="h-7 gap-1 text-amber-400/80 hover:text-amber-400">
                              <ExternalLink className="w-3 h-3" />
                              <span className="text-xs">View</span>
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Notes (shown below for entries requiring follow-up) */}
      {filtered.some((e) => e.follow_up_required && e.follow_up_notes) && (
        <Card className="mt-6 border-border/60 bg-[#1a1d27]">
          <CardHeader className="pb-3">
            <CardTitle className="section-header text-sm font-semibold text-amber-400/90">
              Follow-up Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {filtered
                .filter((e) => e.follow_up_required && e.follow_up_notes)
                .map((entry) => (
                  <div
                    key={`followup-${entry.id}`}
                    className="flex gap-3 p-3 rounded-lg bg-white/[0.02] border border-border/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground/90">
                          {getEmployeeName(entry.injured_person_id)}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.follow_up_notes}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
