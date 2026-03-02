"use client";

import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Circle,
  ClipboardList,
  ShieldCheck,
  FileWarning,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type {
  Employee,
  Document,
  RoleDefinition,
  Task,
  InductionChecklistTemplate,
  InductionRecord,
  VOCRecord,
} from "@/lib/types";
import type { ComplianceStatus } from "@/lib/store/compliance-engine";

interface OverviewTabProps {
  employee: Employee;
  compliance: ComplianceStatus;
  role: RoleDefinition | null;
  tasks: Task[];
  inductionTemplates: InductionChecklistTemplate[];
  inductionRecords: InductionRecord[];
  documents: Document[];
  vocRecords: VOCRecord[];
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-right">
        {value || "\u2014"}
      </span>
    </div>
  );
}

export function OverviewTab({
  employee,
  compliance,
  role,
  tasks,
  inductionTemplates,
  inductionRecords,
  documents,
  vocRecords,
}: OverviewTabProps) {
  // Separate config hints from real compliance alerts
  const configHints = compliance.flags.filter(
    (f) =>
      f.includes("configured") ||
      f.includes("assign") ||
      f.includes("edit role") ||
      f.includes("add induction")
  );
  const alerts = compliance.flags.filter((f) => !configHints.includes(f));

  // Build induction status list
  const applicableTemplates = inductionTemplates
    .filter(
      (t) =>
        t.active &&
        (t.required_for === "All" ||
          t.required_for === employee.employment_type)
    )
    .sort((a, b) => a.order - b.order);

  const inductionItems = applicableTemplates.map((t) => {
    const record = inductionRecords.find(
      (r) => r.checklist_item_id === t.id
    );
    const done = record?.status === "Completed";
    const hasDoc = done && documents.some(
      (d) => d.category === "Induction Verification" && d.related_entity_id === t.id && d.related_entity_type === "induction_item"
    );
    return {
      name: t.title,
      done,
      missingDoc: done && !hasDoc,
    };
  });

  // Build VOC status list
  const requiredTaskIds = role?.required_task_ids || [];
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  const vocItems = requiredTaskIds.map((taskId) => {
    const task = taskMap.get(taskId);
    const isCompetent = compliance.vocMissing.indexOf(taskId) === -1 &&
      compliance.vocExpired.indexOf(taskId) === -1;
    const isExpiring = compliance.vocExpiring.indexOf(taskId) !== -1;
    const isExpired = compliance.vocExpired.indexOf(taskId) !== -1;
    const isDone = isCompetent && !isExpired;
    const hasDoc = isDone && documents.some(
      (d) => d.category === "VOC Verification" && d.related_entity_id === taskId && d.related_entity_type === "voc_item"
    );
    return {
      name: task?.name || taskId,
      done: isDone,
      expiring: isExpiring,
      expired: isExpired,
      missingDoc: isDone && !hasDoc,
    };
  });

  // Missing-doc counts
  const missingInductionDocs = inductionItems.filter((i) => i.missingDoc).length;
  const missingVocDocs = vocItems.filter((i) => i.missingDoc).length;
  const totalMissingDocs = missingInductionDocs + missingVocDocs;

  return (
    <div className="space-y-6">
      {/* Missing Documents Banner */}
      {totalMissingDocs > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/40 bg-amber-500/10">
          <FileWarning className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">
              {totalMissingDocs} completed item{totalMissingDocs !== 1 ? "s" : ""} missing documentation
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              {missingInductionDocs > 0 && `${missingInductionDocs} induction`}
              {missingInductionDocs > 0 && missingVocDocs > 0 && ", "}
              {missingVocDocs > 0 && `${missingVocDocs} competenc${missingVocDocs !== 1 ? "ies" : "y"}`}
              {" "}— go to the Documents tab to upload supporting documents.
            </p>
          </div>
        </div>
      )}

      {/* Employee Details */}
      <div>
        <div className="section-header">DETAILS</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <DetailRow
              label="Employee No."
              value={employee.employee_number || ""}
            />
            <DetailRow label="Email" value={employee.email} />
            <DetailRow label="Phone" value={employee.phone} />
            <DetailRow
              label="Role"
              value={role?.name || employee.role}
            />
            <DetailRow label="Type" value={employee.employment_type} />
          </div>
          <div>
            <DetailRow
              label="Start Date"
              value={formatDate(employee.start_date)}
            />
            <DetailRow label="Status" value={employee.status} />
            <DetailRow
              label="Emergency Contact"
              value={employee.emergency_contact_name}
            />
            <DetailRow
              label="Emergency Phone"
              value={employee.emergency_contact_phone}
            />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Induction Card */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Induction
              </span>
              {inductionItems.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {inductionItems.filter((i) => i.done).length}/
                  {inductionItems.length}
                </span>
              )}
            </div>
            {inductionItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No induction items configured
              </p>
            ) : (
              <div className="space-y-1.5">
                {inductionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {item.missingDoc ? (
                      <FileWarning className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        item.missingDoc
                          ? "text-amber-500"
                          : item.done
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.missingDoc && (
                      <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded px-1 py-0.5">
                        No document uploaded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* VOC Card */}
        <Card className="border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Competencies
              </span>
              {vocItems.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {vocItems.filter((i) => i.done).length}/
                  {vocItems.length}
                </span>
              )}
            </div>
            {vocItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No competencies required for this role
              </p>
            ) : (
              <div className="space-y-1.5">
                {vocItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    {item.missingDoc ? (
                      <FileWarning className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : item.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : item.expired ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span
                      className={`text-xs ${
                        item.missingDoc
                          ? "text-amber-500"
                          : item.done
                          ? "text-muted-foreground"
                          : item.expired
                          ? "text-red-400"
                          : item.expiring
                          ? "text-amber-400"
                          : "text-foreground"
                      }`}
                    >
                      {item.name}
                      {item.expired && " (expired)"}
                      {item.expiring && " (expiring)"}
                    </span>
                    {item.missingDoc && (
                      <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded px-1 py-0.5">
                        No document uploaded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      {alerts.length > 0 && (
        <div>
          <div className="section-header">ALERTS</div>
          <div className="space-y-2">
            {alerts.map((flag, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm text-amber-200">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Configuration Hints */}
      {configHints.length > 0 && (
        <div>
          <div className="section-header">SETUP REQUIRED</div>
          <div className="space-y-2">
            {configHints.map((hint, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5"
              >
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-sm text-blue-300">{hint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
