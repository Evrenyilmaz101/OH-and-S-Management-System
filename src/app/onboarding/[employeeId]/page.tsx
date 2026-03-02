"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getEmployee } from "@/lib/store/employees";
import {
  getOnboardingByEmployee,
} from "@/lib/store/onboarding";
import {
  getInductionsByEmployee,
  updateInductionRecord,
} from "@/lib/store/onboarding";
import { getInductionTemplates } from "@/lib/store/onboarding";
import { getRole } from "@/lib/store/roles";
import { getVOCByEmployee } from "@/lib/store/voc";
import { getCertsByEmployee } from "@/lib/store/certifications";
import { getTasks } from "@/lib/store/tasks";
import { formatDate, getExpiryStatus } from "@/lib/utils";
import type {
  Employee,
  OnboardingRecord,
  InductionRecord,
  InductionChecklistTemplate,
  RoleDefinition,
  VOCRecord,
  Certification,
  Task,
  OnboardingStatus,
  InductionItemStatus,
} from "@/lib/types";

function getStatusBadgeClasses(status: OnboardingStatus): string {
  switch (status) {
    case "Not Started":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "In Progress":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Completed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

function getInductionBadgeClasses(status: InductionItemStatus): string {
  switch (status) {
    case "Pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Completed":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "N/A":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default function OnboardingDetailPage() {
  const params = useParams();
  const employeeId = params.employeeId as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingRecord | null>(null);
  const [inductionRecords, setInductionRecords] = useState<InductionRecord[]>([]);
  const [templates, setTemplates] = useState<InductionChecklistTemplate[]>([]);
  const [role, setRole] = useState<RoleDefinition | null>(null);
  const [vocRecords, setVocRecords] = useState<VOCRecord[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadData = useCallback(async () => {
    const emp = await getEmployee(employeeId);
    if (!emp) return;
    setEmployee(emp);

    const [onb, indRecords, allTemplates, empRole, vocs, certs, allTasks] = await Promise.all([
      getOnboardingByEmployee(employeeId),
      getInductionsByEmployee(employeeId),
      getInductionTemplates(),
      emp.role_id ? getRole(emp.role_id) : Promise.resolve(undefined),
      getVOCByEmployee(employeeId),
      getCertsByEmployee(employeeId),
      getTasks(),
    ]);
    setOnboarding(onb || null);
    setInductionRecords(indRecords);
    setTemplates(allTemplates.filter((t) => t.active));
    setRole(empRole || null);
    setVocRecords(vocs);
    setCertifications(certs);
    setTasks(allTasks);
  }, [employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get applicable templates for this employee type
  const applicableTemplates = templates.filter(
    (t) =>
      employee &&
      (t.required_for === "All" ||
        t.required_for === employee.employment_type)
  );

  // Group templates by category
  const groupedTemplates = applicableTemplates.reduce(
    (acc, template) => {
      const category = template.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, InductionChecklistTemplate[]>
  );

  // Calculate induction progress
  const totalItems = applicableTemplates.length;
  const completedItems = inductionRecords.filter(
    (r) => r.status === "Completed"
  ).length;
  const inductionProgress =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Get induction record for a template item
  const getInductionRecord = (templateId: string): InductionRecord | undefined => {
    return inductionRecords.find((r) => r.checklist_item_id === templateId);
  };

  // Toggle induction item completion
  const handleToggleInduction = async (template: InductionChecklistTemplate) => {
    const existing = getInductionRecord(template.id);
    if (existing) {
      const updated: InductionRecord = {
        ...existing,
        status: existing.status === "Completed" ? "Pending" : "Completed",
        completed_date:
          existing.status === "Completed"
            ? ""
            : new Date().toISOString().split("T")[0],
        completed_by: existing.status === "Completed" ? "" : "Current User",
      };
      await updateInductionRecord(updated);
    }
    await loadData();
  };

  // Get task name by ID
  const getTaskName = (taskId: string): string => {
    return tasks.find((t) => t.id === taskId)?.name || "Unknown Task";
  };

  // Badge helpers
  const getVOCBadgeClasses = (status: string): string => {
    switch (status) {
      case "Competent":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "In Training":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Not Competent":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getExpiryBadgeClasses = (status: string): string => {
    switch (status) {
      case "valid":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "expiring":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getExpiryLabel = (status: string): string => {
    switch (status) {
      case "valid":
        return "Valid";
      case "expiring":
        return "Expiring Soon";
      case "expired":
        return "Expired";
      default:
        return status;
    }
  };

  if (!employee) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
        <p className="text-muted-foreground">Employee not found.</p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-12 lg:pt-0">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Onboarding
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {employee.first_name} {employee.last_name}
              </h1>
              {onboarding && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStatusBadgeClasses(
                    onboarding.status
                  )}`}
                >
                  {onboarding.status}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {employee.role} &middot; {employee.employment_type}
              {onboarding &&
                ` &middot; Started ${formatDate(onboarding.start_date)}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Induction Progress
                </span>
                <span className="text-sm font-bold data-value text-amber-500">
                  {inductionProgress}%
                </span>
              </div>
              <Progress value={inductionProgress} className="h-3" />
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold data-value text-emerald-500">
                  {completedItems}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold data-value text-amber-500">
                  {totalItems - completedItems}
                </p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
              <div>
                <p className="text-lg font-bold data-value">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="induction" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="induction" className="gap-1.5">
            <ClipboardCheck className="w-4 h-4" />
            Induction Checklist
          </TabsTrigger>
          <TabsTrigger value="requirements" className="gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Role Requirements
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Induction Checklist */}
        <TabsContent value="induction">
          <div className="space-y-4">
            {Object.keys(groupedTemplates).length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="p-6 text-center text-muted-foreground text-sm">
                  No induction items configured.
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedTemplates)
                .sort(([, a], [, b]) => a[0].order - b[0].order)
                .map(([category, items]) => (
                  <Card key={category} className="border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">
                        <span className="section-header block">
                          {category}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/40">
                        {items
                          .sort((a, b) => a.order - b.order)
                          .map((template) => {
                            const record = getInductionRecord(template.id);
                            const isCompleted =
                              record?.status === "Completed";
                            const status: InductionItemStatus =
                              record?.status || "Pending";

                            return (
                              <div
                                key={template.id}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                              >
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() =>
                                    handleToggleInduction(template)
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium ${
                                      isCompleted
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {template.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {template.description}
                                  </p>
                                  {record?.completed_date && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Completed{" "}
                                      {formatDate(record.completed_date)} by{" "}
                                      {record.completed_by}
                                    </p>
                                  )}
                                </div>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border shrink-0 ${getInductionBadgeClasses(
                                    status
                                  )}`}
                                >
                                  {status}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}

            {/* Notes */}
            {onboarding?.notes && (
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <p className="section-header">Notes</p>
                  <p className="text-sm text-foreground">{onboarding.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Role Requirements */}
        <TabsContent value="requirements">
          <div className="space-y-4">
            {/* Required VOCs */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Required VOC Assessments
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    Based on role:{" "}
                    {role?.name || employee.role}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!role || role.required_task_ids.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No VOC requirements defined for this role.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Task
                          </th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            VOC Status
                          </th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Assessed Date
                          </th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Expiry
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {role.required_task_ids.map((taskId) => {
                          const taskName = getTaskName(taskId);
                          const voc = vocRecords.find(
                            (v) => v.task_id === taskId
                          );

                          return (
                            <tr
                              key={taskId}
                              className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {taskName}
                              </td>
                              <td className="px-4 py-3">
                                {voc ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getVOCBadgeClasses(
                                      voc.status
                                    )}`}
                                  >
                                    {voc.status}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-red-500/10 text-red-500 border-red-500/20">
                                    Not Assessed
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground data-value">
                                {voc
                                  ? formatDate(voc.assessed_date)
                                  : "\u2014"}
                              </td>
                              <td className="px-4 py-3">
                                {voc ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground data-value">
                                      {formatDate(voc.expiry_date)}
                                    </span>
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getExpiryBadgeClasses(
                                        getExpiryStatus(voc.expiry_date)
                                      )}`}
                                    >
                                      {getExpiryLabel(
                                        getExpiryStatus(voc.expiry_date)
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {"\u2014"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Required Certifications */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-amber-500" />
                  Required Certifications / Licences
                  <span className="ml-auto text-xs font-normal text-muted-foreground">
                    Based on role:{" "}
                    {role?.name || employee.role}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!role || role.required_cert_types.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No certification requirements defined for this role.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Required Certification
                          </th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Status
                          </th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Cert Number
                          </th>
                          <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                            Expiry
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {role.required_cert_types.map((certType) => {
                          const matchingCert = certifications.find((c) =>
                            c.cert_name
                              .toLowerCase()
                              .includes(certType.toLowerCase())
                          );

                          return (
                            <tr
                              key={certType}
                              className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm font-medium text-foreground">
                                {certType}
                              </td>
                              <td className="px-4 py-3">
                                {matchingCert ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getExpiryBadgeClasses(
                                      getExpiryStatus(matchingCert.expiry_date)
                                    )}`}
                                  >
                                    {getExpiryLabel(
                                      getExpiryStatus(matchingCert.expiry_date)
                                    )}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-red-500/10 text-red-500 border-red-500/20">
                                    Not Held
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                                {matchingCert?.cert_number || "\u2014"}
                              </td>
                              <td className="px-4 py-3">
                                {matchingCert ? (
                                  <span className="text-sm text-muted-foreground data-value">
                                    {formatDate(matchingCert.expiry_date)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {"\u2014"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
