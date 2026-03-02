"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ComplianceStatus } from "@/lib/store/compliance-engine";

interface ComplianceSummaryProps {
  compliance: ComplianceStatus;
}

function getComplianceColor(value: number): string {
  if (value >= 80) return "text-emerald-500";
  if (value >= 50) return "text-amber-500";
  return "text-red-500";
}

function ProgressRow({
  label,
  done,
  total,
  percent,
}: {
  label: string;
  done: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium data-value">
          {done}/{total} ({percent}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-amber-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function ComplianceSummaryCard({ compliance }: ComplianceSummaryProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span
            className={`text-3xl font-bold data-value ${getComplianceColor(
              compliance.overallCompliance
            )}`}
          >
            {compliance.overallCompliance}%
          </span>
          <span className="text-xs text-muted-foreground">
            Overall Compliance
          </span>
        </div>

        <div className="space-y-3">
          <ProgressRow
            label="VOC"
            done={compliance.vocMet}
            total={compliance.vocRequired}
            percent={compliance.vocProgress}
          />
          <ProgressRow
            label="Certifications"
            done={compliance.certsMet}
            total={compliance.certsRequired}
            percent={compliance.certsProgress}
          />
        </div>
      </CardContent>
    </Card>
  );
}
