"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { getSOPs } from "@/lib/store/sops";
import { formatDate } from "@/lib/utils";
import type { SOP, SOPStatus } from "@/lib/types";

const statusConfig: Record<SOPStatus, { label: string; className: string }> = {
  Current: {
    label: "Current",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  "Under Review": {
    label: "Under Review",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Archived: {
    label: "Archived",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export default function SOPsPage() {
  const [sops, setSOPs] = useState<SOP[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    async function load() {
      const sops = await getSOPs();
      setSOPs(sops);
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(sops.map((s) => s.category));
    return ["All", ...Array.from(cats).sort()];
  }, [sops]);

  const filtered = useMemo(() => {
    return sops.filter((sop) => {
      const matchesSearch =
        search === "" ||
        sop.title.toLowerCase().includes(search.toLowerCase()) ||
        sop.document_number.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || sop.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [sops, search, categoryFilter]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="SOP Register"
        description="Standard Operating Procedures — document register and management"
      />

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or document number..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
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
                  <TableHead className="text-xs">Document Number</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Version</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Review Date</TableHead>
                  <TableHead className="text-xs">Last Reviewed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground/40" />
                        <span>No SOPs found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((sop) => {
                    const badge = statusConfig[sop.status] || statusConfig.Current;
                    return (
                      <TableRow key={sop.id} className="group">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {sop.document_number}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/sops/${sop.id}`}
                            className="font-medium text-sm hover:text-amber-500 transition-colors"
                          >
                            {sop.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sop.category}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          v{sop.version}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={badge.className}
                          >
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(sop.review_date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {sop.last_reviewed_by || "—"}
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
