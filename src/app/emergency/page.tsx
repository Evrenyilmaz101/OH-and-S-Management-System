"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Shield,
  Phone,
  MapPin,
  UserCircle,
  AlertTriangle,
  HeartPulse,
  ClipboardList,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getEmergencyInfo } from "@/lib/store/registers";
import { getEmployees } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type { EmergencyInfo, Employee } from "@/lib/types";

const typeIcons: Record<string, typeof Shield> = {
  Warden: Shield,
  "First Aider": HeartPulse,
  Procedure: ClipboardList,
};

const typeColors: Record<string, { bg: string; icon: string; badge: string }> = {
  Warden: {
    bg: "bg-amber-500/10",
    icon: "text-amber-500",
    badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  "First Aider": {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  Procedure: {
    bg: "bg-blue-500/10",
    icon: "text-blue-500",
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
};

function getTypeConfig(type: string) {
  return (
    typeColors[type] || {
      bg: "bg-zinc-500/10",
      icon: "text-zinc-500",
      badge: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    }
  );
}

function isReviewOverdue(dateString: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

interface GroupedEmergency {
  type: string;
  items: EmergencyInfo[];
}

export default function EmergencyPage() {
  const [emergencyItems, setEmergencyItems] = useState<EmergencyInfo[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [info, emps] = await Promise.all([getEmergencyInfo(), getEmployees()]);
      setEmergencyItems(info);
      setEmployees(emps);
    }
    load();
  }, []);

  const getPersonName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
  };

  const grouped = useMemo(() => {
    // Filter first
    const filtered = emergencyItems.filter((item) => {
      const personName = getPersonName(item.responsible_person_id).toLowerCase();
      return (
        search === "" ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        personName.includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
      );
    });

    // Group by type
    const typeOrder = ["Warden", "First Aider", "Procedure"];
    const groups: Record<string, EmergencyInfo[]> = {};

    filtered.forEach((item) => {
      const t = item.type || "Other";
      if (!groups[t]) {
        groups[t] = [];
      }
      groups[t].push(item);
    });

    // Sort groups by defined type order, then alphabetically for unknown types
    const result: GroupedEmergency[] = [];
    typeOrder.forEach((type) => {
      if (groups[type]) {
        result.push({ type, items: groups[type] });
        delete groups[type];
      }
    });
    // Add any remaining types
    Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([type, items]) => {
        result.push({ type, items });
      });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emergencyItems, employees, search]);

  const isEmergencyContact = (item: EmergencyInfo) => {
    return item.title.toLowerCase().includes("emergency") && item.contact_number;
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Emergency Information"
        description="Emergency contacts, wardens, first aiders, and emergency procedures"
      />

      {/* Search */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, description, person, location, or type..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Grouped Cards */}
      {grouped.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-muted-foreground/40" />
              <span>No emergency information found</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => {
            const config = getTypeConfig(group.type);
            const IconComponent = typeIcons[group.type] || AlertTriangle;

            return (
              <div key={group.type}>
                {/* Group Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-1.5 rounded-md ${config.bg}`}>
                    <IconComponent className={`w-4 h-4 ${config.icon}`} />
                  </div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.type}s
                  </h2>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({group.items.length})
                  </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => {
                    const isEmContact = isEmergencyContact(item);
                    const reviewOverdue = isReviewOverdue(item.review_due);

                    return (
                      <Card
                        key={item.id}
                        className={`border-border/60 ${
                          isEmContact ? "hazard-stripe border-amber-500/30" : ""
                        }`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold flex items-start justify-between gap-2">
                            <span className="leading-snug">{item.title}</span>
                            <Badge variant="outline" className={config.badge}>
                              {group.type}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {item.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          <div className="space-y-2">
                            {/* Responsible Person */}
                            {item.responsible_person_id && (
                              <div className="flex items-center gap-2 text-sm">
                                <UserCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">
                                  {getPersonName(item.responsible_person_id)}
                                </span>
                              </div>
                            )}

                            {/* Location */}
                            {item.location && (
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{item.location}</span>
                              </div>
                            )}

                            {/* Contact Number */}
                            {item.contact_number && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isEmContact ? "text-amber-500" : "text-muted-foreground"
                                  }`}
                                />
                                <span
                                  className={`data-value ${
                                    isEmContact
                                      ? "text-amber-500 font-semibold"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {item.contact_number}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Review Info */}
                          {(item.last_reviewed || item.review_due) && (
                            <div className="pt-2 border-t border-border/40">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                {item.last_reviewed && (
                                  <span>
                                    Reviewed:{" "}
                                    <span className="data-value">
                                      {formatDate(item.last_reviewed)}
                                    </span>
                                  </span>
                                )}
                                {item.review_due && (
                                  <span
                                    className={
                                      reviewOverdue ? "text-red-500 font-semibold" : ""
                                    }
                                  >
                                    Due:{" "}
                                    <span className="data-value">
                                      {formatDate(item.review_due)}
                                    </span>
                                    {reviewOverdue && (
                                      <span className="ml-1 text-[10px] uppercase tracking-wider font-bold">
                                        Overdue
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
