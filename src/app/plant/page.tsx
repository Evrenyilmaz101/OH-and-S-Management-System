"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, Wrench } from "lucide-react";
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
import { getPlantEquipment } from "@/lib/store/registers";
import { formatDate } from "@/lib/utils";
import type { PlantEquipment, PlantStatus, RegistrationStatus } from "@/lib/types";

const statusConfig: Record<PlantStatus, { label: string; className: string }> = {
  Operational: {
    label: "Operational",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  "Out of Service": {
    label: "Out of Service",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  "Under Maintenance": {
    label: "Under Maintenance",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Decommissioned: {
    label: "Decommissioned",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
};

const regConfig: Record<RegistrationStatus, { label: string; className: string }> = {
  Registered: {
    label: "Registered",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  "Not Required": {
    label: "Not Required",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
  Pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Expired: {
    label: "Expired",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

function isOverdue(dateString: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

export default function PlantPage() {
  const [equipment, setEquipment] = useState<PlantEquipment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlantStatus | "All">("All");

  useEffect(() => {
    async function load() {
      const data = await getPlantEquipment();
      setEquipment(data);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return equipment.filter((item) => {
      const matchesSearch =
        search === "" ||
        `${item.asset_number} ${item.name} ${item.type} ${item.make} ${item.model} ${item.location}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [equipment, search, statusFilter]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Plant & Equipment Register"
        description="Track all plant, equipment, and machinery with maintenance schedules"
      />

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by asset number, name, type, make, model, or location..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PlantStatus | "All")}
            >
              <option value="All">All Status</option>
              <option value="Operational">Operational</option>
              <option value="Out of Service">Out of Service</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Decommissioned">Decommissioned</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Asset Number</TableHead>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Make / Model</TableHead>
                  <TableHead className="text-xs">Location</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Registration</TableHead>
                  <TableHead className="text-xs">Next Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Wrench className="w-8 h-8 text-muted-foreground/40" />
                        <span>No plant or equipment found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => {
                    const overdue = isOverdue(item.next_maintenance_date);
                    const sc = statusConfig[item.status];
                    const rc = regConfig[item.registration_status];

                    return (
                      <TableRow key={item.id} className={overdue ? "bg-red-500/5" : ""}>
                        <TableCell className="data-value text-sm font-medium">
                          <Link
                            href={`/plant/${item.id}`}
                            className="hover:underline text-amber-500"
                          >
                            {item.asset_number}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          <Link href={`/plant/${item.id}`} className="hover:underline">
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.type}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.make} {item.model}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.location}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sc.className}>
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={rc.className}>
                            {rc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm data-value ${
                              overdue ? "text-red-500 font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            {item.next_maintenance_date
                              ? formatDate(item.next_maintenance_date)
                              : "\u2014"}
                            {overdue && (
                              <span className="ml-1.5 text-[10px] uppercase tracking-wider font-bold text-red-500">
                                Overdue
                              </span>
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
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
