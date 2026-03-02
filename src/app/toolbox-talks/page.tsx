"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Users,
  MapPin,
  Calendar,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { getToolboxTalks } from "@/lib/store/compliance";
import { getEmployees } from "@/lib/store/employees";
import { formatDate } from "@/lib/utils";
import type { ToolboxTalk, Employee } from "@/lib/types";

export default function ToolboxTalksPage() {
  const [talks, setTalks] = useState<ToolboxTalk[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [t, emps] = await Promise.all([getToolboxTalks(), getEmployees()]);
      setTalks(t);
      setEmployees(emps);
    }
    load();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : id || "—";
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return talks.filter((talk) => {
      if (search === "") return true;
      return (
        talk.title.toLowerCase().includes(q) ||
        talk.location.toLowerCase().includes(q) ||
        talk.topics_covered.some((t) => t.toLowerCase().includes(q)) ||
        getEmployeeName(talk.conducted_by).toLowerCase().includes(q) ||
        talk.actions_arising.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talks, employees, search]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      <PageHeader
        title="Toolbox Talks"
        description="Record of workplace toolbox talks, safety briefings and team communications"
      />

      {/* Search Bar */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, topic, or presenter..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toolbox Talk Cards */}
      {filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
              <span className="text-sm">No toolbox talks found</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((talk) => (
            <Card
              key={talk.id}
              className="border-border/60 hover:shadow-md hover:border-amber-500/20 transition-all bg-[#1a1d27]"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold leading-tight">
                  {talk.title}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs">
                      {formatDate(talk.date)}
                      {talk.time && ` at ${talk.time}`}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Conducted By & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Conducted By
                    </span>
                    <p className="text-sm font-medium mt-0.5">
                      {getEmployeeName(talk.conducted_by)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                    </div>
                    <p className="text-sm mt-0.5">{talk.location || "—"}</p>
                  </div>
                </div>

                {/* Topics Covered */}
                <div>
                  <span className="text-xs text-muted-foreground mb-1.5 block">
                    Topics Covered
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {talk.topics_covered.length > 0 ? (
                      talk.topics_covered.map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20 font-normal"
                        >
                          {topic}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No topics listed
                      </span>
                    )}
                  </div>
                </div>

                {/* Attendee Count */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Attendees:
                  </span>
                  <span className="text-xs font-semibold">
                    {talk.attendee_ids.length}
                  </span>
                </div>

                {/* Actions Arising */}
                {talk.actions_arising && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-muted-foreground font-medium">
                        Actions Arising
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-[#0f1117] border border-border/40 text-sm font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {talk.actions_arising}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {talk.notes && (
                  <div>
                    <span className="text-xs text-muted-foreground">Notes</span>
                    <p className="text-sm mt-0.5 text-muted-foreground">
                      {talk.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
