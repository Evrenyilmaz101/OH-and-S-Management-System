"use client";

import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import type {
  Employee,
  OnboardingRecord,
  InductionRecord,
  InductionChecklistTemplate,
  RoleDefinition,
} from "@/lib/types";

interface InductionTabProps {
  employee: Employee;
  onboardingRecord: OnboardingRecord | null;
  inductionRecords: InductionRecord[];
  templates: InductionChecklistTemplate[];
  role: RoleDefinition | null;
  onToggleInduction: (templateId: string, currentStatus: string) => void;
}

export function InductionTab({
  employee,
  onboardingRecord,
  inductionRecords,
  templates,
  role,
  onToggleInduction,
}: InductionTabProps) {
  // Filter applicable templates for this employee type
  const applicableTemplates = templates.filter(
    (t) =>
      t.active &&
      (t.required_for === "All" || t.required_for === employee.employment_type)
  );

  const completedCount = applicableTemplates.filter((t) => {
    const rec = inductionRecords.find((r) => r.checklist_item_id === t.id);
    return rec?.status === "Completed";
  }).length;

  const totalCount = applicableTemplates.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Group templates by category
  const categories = Array.from(
    new Set(applicableTemplates.map((t) => t.category))
  );

  const getRecord = (templateId: string): InductionRecord | undefined =>
    inductionRecords.find((r) => r.checklist_item_id === templateId);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Induction Progress</span>
            <span className="text-sm font-medium data-value">
              {completedCount}/{totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Induction Checklist */}
      <div>
        <div className="section-header">INDUCTION CHECKLIST</div>

        {applicableTemplates.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              No induction checklist items configured for this employment type.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryTemplates = applicableTemplates
                .filter((t) => t.category === category)
                .sort((a, b) => a.order - b.order);

              return (
                <Card key={category} className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {categoryTemplates.map((template) => {
                        const record = getRecord(template.id);
                        const isCompleted = record?.status === "Completed";
                        const currentStatus = record?.status || "Pending";

                        return (
                          <div
                            key={template.id}
                            className="flex items-start gap-3 px-4 py-3"
                          >
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() =>
                                onToggleInduction(template.id, currentStatus)
                              }
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {template.title}
                                </span>
                                <StatusBadge status={currentStatus} />
                              </div>
                              {template.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {template.description}
                                </p>
                              )}
                              {isCompleted && record?.completed_date && (
                                <p className="text-xs text-muted-foreground mt-0.5 data-value">
                                  Completed: {formatDate(record.completed_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Onboarding Notes */}
      {onboardingRecord?.notes && (
        <div>
          <div className="section-header">ONBOARDING NOTES</div>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm">{onboardingRecord.notes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
