"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, FlaskConical, ChevronDown, ChevronRight } from "lucide-react";
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
import { getHazardousSubstances } from "@/lib/store/registers";
import { formatDate } from "@/lib/utils";
import type { HazardousSubstance } from "@/lib/types";

const dgClassColors: Record<string, string> = {
  "1": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "2": "bg-red-500/10 text-red-500 border-red-500/20",
  "2.1": "bg-red-500/10 text-red-500 border-red-500/20",
  "2.2": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "2.3": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "3": "bg-red-500/10 text-red-500 border-red-500/20",
  "4": "bg-red-600/10 text-red-600 border-red-600/20",
  "4.1": "bg-red-600/10 text-red-600 border-red-600/20",
  "4.2": "bg-red-600/10 text-red-600 border-red-600/20",
  "4.3": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "5": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "5.1": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "5.2": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "6": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "6.1": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "7": "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  "8": "bg-zinc-500/10 text-zinc-400 border-zinc-400/20",
  "9": "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

function getDGBadgeClass(dgClass: string): string {
  if (!dgClass) return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  const base = dgClass.split(".")[0];
  return dgClassColors[dgClass] || dgClassColors[base] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
}

function isSdsExpired(dateString: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

export default function HazardousSubstancesPage() {
  const [substances, setSubstances] = useState<HazardousSubstance[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getHazardousSubstances();
      setSubstances(data);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return substances.filter((s) => {
      return (
        search === "" ||
        `${s.product_name} ${s.manufacturer} ${s.un_number} ${s.dangerous_goods_class} ${s.location_stored}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [substances, search]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Hazardous Substances Register"
        description="Track hazardous substances, SDS documents, and dangerous goods classifications"
      />

      {/* Filters */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, manufacturer, UN number, DG class, or location..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                  <TableHead className="text-xs w-8"></TableHead>
                  <TableHead className="text-xs">Product Name</TableHead>
                  <TableHead className="text-xs">Manufacturer</TableHead>
                  <TableHead className="text-xs">UN Number</TableHead>
                  <TableHead className="text-xs">DG Class</TableHead>
                  <TableHead className="text-xs">Location Stored</TableHead>
                  <TableHead className="text-xs">Quantity</TableHead>
                  <TableHead className="text-xs">SDS Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FlaskConical className="w-8 h-8 text-muted-foreground/40" />
                        <span>No hazardous substances found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((substance) => {
                    const isExpanded = expandedId === substance.id;
                    const sdsExpired = isSdsExpired(substance.sds_expiry_date);

                    return (
                      <React.Fragment key={substance.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => toggleExpand(substance.id)}
                        >
                          <TableCell className="w-8 px-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {substance.product_name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {substance.manufacturer}
                          </TableCell>
                          <TableCell className="text-sm data-value text-muted-foreground">
                            {substance.un_number || "\u2014"}
                          </TableCell>
                          <TableCell>
                            {substance.dangerous_goods_class ? (
                              <Badge
                                variant="outline"
                                className={getDGBadgeClass(substance.dangerous_goods_class)}
                              >
                                Class {substance.dangerous_goods_class}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">\u2014</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {substance.location_stored}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {substance.quantity_held}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-sm data-value ${
                                sdsExpired ? "text-red-500 font-semibold" : "text-muted-foreground"
                              }`}
                            >
                              {substance.sds_expiry_date
                                ? formatDate(substance.sds_expiry_date)
                                : "\u2014"}
                              {sdsExpired && (
                                <span className="ml-1.5 text-[10px] uppercase tracking-wider font-bold text-red-500">
                                  Expired
                                </span>
                              )}
                            </span>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details Row */}
                        {isExpanded && (
                          <TableRow className="bg-muted/20">
                            <TableCell colSpan={8} className="p-0">
                              <div className="px-6 py-4 border-l-2 border-amber-500/40 ml-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div>
                                    <p className="section-header">Risk Phrases</p>
                                    {substance.risk_phrases && substance.risk_phrases.length > 0 ? (
                                      <div className="flex flex-wrap gap-1.5">
                                        {substance.risk_phrases.map((phrase, i) => (
                                          <Badge
                                            key={i}
                                            variant="outline"
                                            className="bg-red-500/5 text-red-400 border-red-500/20 text-xs"
                                          >
                                            {phrase}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">None recorded</p>
                                    )}
                                  </div>
                                  <div>
                                    <p className="section-header">Control Measures</p>
                                    <p className="text-sm text-muted-foreground">
                                      {substance.control_measures || "None recorded"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="section-header">First Aid Measures</p>
                                    <p className="text-sm text-muted-foreground">
                                      {substance.first_aid_measures || "None recorded"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
