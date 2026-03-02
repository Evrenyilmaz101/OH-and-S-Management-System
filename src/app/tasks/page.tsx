"use client";

import { useEffect, useState, useMemo } from "react";
import { Shield, Users, HardHat } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getTasks, getVOCRecords, getEmployees } from "@/lib/store/index";
import type { Task, VOCRecord, Employee } from "@/lib/types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vocRecords, setVocRecords] = useState<VOCRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  useEffect(() => {
    async function load() {
      const [tasks, vocRecords, employees] = await Promise.all([getTasks(), getVOCRecords(), getEmployees()]);
      setTasks(tasks);
      setVocRecords(vocRecords);
      setEmployees(employees);
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category));
    return ["All", ...Array.from(cats).sort()];
  }, [tasks]);

  const filtered = useMemo(() => {
    if (categoryFilter === "All") return tasks;
    return tasks.filter((t) => t.category === categoryFilter);
  }, [tasks, categoryFilter]);

  const getCompetentCount = (taskId: string) => {
    const activeEmployeeIds = new Set(
      employees.filter((e) => e.status === "Active").map((e) => e.id)
    );
    return vocRecords.filter(
      (v) =>
        v.task_id === taskId &&
        v.status === "Competent" &&
        activeEmployeeIds.has(v.employee_id)
    ).length;
  };

  const activeEmployeeCount = employees.filter((e) => e.status === "Active").length;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <PageHeader
        title="Tasks & Competencies"
        description="Registered tasks requiring verification of competency"
      />

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              categoryFilter === cat
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-muted-foreground border-border hover:border-foreground/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((task) => {
          const competentCount = getCompetentCount(task.id);
          return (
            <Card
              key={task.id}
              className="border-border/60 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">{task.name}</h3>
                    <span className="text-xs text-muted-foreground">{task.category}</span>
                  </div>
                  <StatusBadge status={task.risk_level} />
                </div>

                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                  {task.description}
                </p>

                {/* Competent employees */}
                <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-muted/50">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Competent:
                  </span>
                  <span className="text-xs font-semibold">
                    {competentCount}
                    <span className="text-muted-foreground font-normal">
                      {" "}/ {activeEmployeeCount}
                    </span>
                  </span>
                </div>

                {/* PPE */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">
                      Required PPE
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {task.required_ppe.map((ppe) => (
                      <span
                        key={ppe}
                        className="inline-flex px-2 py-0.5 bg-muted text-xs rounded text-muted-foreground"
                      >
                        {ppe}
                      </span>
                    ))}
                  </div>
                </div>

                {!task.active && (
                  <div className="mt-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs text-zinc-400">Inactive</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
