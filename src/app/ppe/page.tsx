"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, HardHat, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { PageHeader } from "@/components/page-header";
import { getPPERecords } from "@/lib/store/registers";
import { getEmployees } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type { PPERecord, PPECondition, Employee } from "@/lib/types";

const conditionConfig: Record<PPECondition, { label: string; className: string }> = {
  Good: {
    label: "Good",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  Fair: {
    label: "Fair",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Replace: {
    label: "Replace",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

function isExpired(dateString: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

interface EmployeePPEGroup {
  employee: Employee;
  records: PPERecord[];
}

export default function PPEPage() {
  const [records, setRecords] = useState<PPERecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<PPECondition | "All">("All");

  useEffect(() => {
    async function load() {
      const [recs, emps] = await Promise.all([getPPERecords(), getEmployees()]);
      setRecords(recs);
      setEmployees(emps);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const groupedByEmployee = useMemo(() => {
    // First filter records
    const filteredRecords = records.filter((r) => {
      const empName = getEmployeeName(r.employee_id).toLowerCase();
      const matchesSearch =
        search === "" ||
        empName.includes(search.toLowerCase()) ||
        r.ppe_type.toLowerCase().includes(search.toLowerCase()) ||
        r.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCondition = conditionFilter === "All" || r.condition === conditionFilter;
      return matchesSearch && matchesCondition;
    });

    // Group by employee
    const groups: Record<string, PPERecord[]> = {};
    filteredRecords.forEach((r) => {
      if (!groups[r.employee_id]) {
        groups[r.employee_id] = [];
      }
      groups[r.employee_id].push(r);
    });

    // Convert to array and sort by employee name
    const result: EmployeePPEGroup[] = Object.entries(groups)
      .map(([empId, recs]) => ({
        employee: employees.find((e) => e.id === empId) || {
          id: empId,
          first_name: "Unknown",
          last_name: "",
        } as Employee,
        records: recs,
      }))
      .sort((a, b) =>
        `${a.employee.first_name} ${a.employee.last_name}`.localeCompare(
          `${b.employee.first_name} ${b.employee.last_name}`
        )
      );

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, employees, search, conditionFilter]);

  const totalRecords = groupedByEmployee.reduce((sum, g) => sum + g.records.length, 0);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="PPE Register"
        description="Track personal protective equipment issued to employees"
      />

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee, PPE type, or brand..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as PPECondition | "All")}
            >
              <option value="All">All Conditions</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Replace">Replace</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Tables */}
      {groupedByEmployee.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <HardHat className="w-8 h-8 text-muted-foreground/40" />
              <span>No PPE records found</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByEmployee.map((group) => (
            <Card key={group.employee.id} className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {group.employee.first_name} {group.employee.last_name}
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    {group.records.length} item{group.records.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">PPE Type</TableHead>
                        <TableHead className="text-xs">Brand</TableHead>
                        <TableHead className="text-xs">Date Issued</TableHead>
                        <TableHead className="text-xs">Expiry Date</TableHead>
                        <TableHead className="text-xs">Condition</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.records.map((record) => {
                        const cc = conditionConfig[record.condition];
                        const expired = isExpired(record.expiry_date);

                        return (
                          <TableRow key={record.id} className={expired ? "bg-red-500/5" : ""}>
                            <TableCell className="text-sm font-medium">
                              {record.ppe_type}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {record.brand || "\u2014"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground data-value">
                              {record.date_issued ? formatDate(record.date_issued) : "\u2014"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`text-sm data-value ${
                                  expired ? "text-red-500 font-semibold" : "text-muted-foreground"
                                }`}
                              >
                                {record.expiry_date ? formatDate(record.expiry_date) : "\u2014"}
                                {expired && (
                                  <span className="ml-1.5 text-[10px] uppercase tracking-wider font-bold text-red-500">
                                    Expired
                                  </span>
                                )}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={cc.className}>
                                {cc.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Summary footer */}
          <div className="text-xs text-muted-foreground text-right pr-1">
            Showing {totalRecords} PPE record{totalRecords !== 1 ? "s" : ""} across{" "}
            {groupedByEmployee.length} employee{groupedByEmployee.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
