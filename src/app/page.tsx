"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, ShieldCheck, AlertTriangle, Clock, Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { getEmployees, getEmployeesByWorkshop } from "@/lib/store/employees";
import { getCertifications } from "@/lib/store/certifications";
import { getRoles } from "@/lib/store/roles";
import { getAllEmployeeCompliance } from "@/lib/store/compliance-engine";
import type { ComplianceStatus } from "@/lib/store/compliance-engine";
import { getExpiryStatus, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/store-provider";
import type { Employee, Certification } from "@/lib/types";

interface DashboardStats {
  activePersonnel: number;
  workforceCompliance: number;
  certExpiryCount: number;
  complianceAlerts: { employee: Employee; compliance: ComplianceStatus }[];
  certExpiryAlerts: { cert: Certification; employee: Employee }[];
}

export default function DashboardPage() {
  const { selectedWorkshopId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const [allEmployees, certifications, allCompliance] = await Promise.all([
        selectedWorkshopId ? getEmployeesByWorkshop(selectedWorkshopId) : getEmployees(),
        getCertifications(),
        getAllEmployeeCompliance(),
      ]);

      // If workshop is selected, scope employee IDs for filtering
      const employeeIds = new Set(allEmployees.map((e) => e.id));
      const employees = allEmployees;

      const activeEmployees = employees.filter((e) => e.status === "Active");

      // Scope compliance to current employees
      const scopedCompliance = selectedWorkshopId
        ? allCompliance.filter((c) => employeeIds.has(c.employeeId))
        : allCompliance;

      // Workforce compliance
      const workforceCompliance = scopedCompliance.length > 0
        ? Math.round(scopedCompliance.reduce((sum, c) => sum + c.overallCompliance, 0) / scopedCompliance.length)
        : 0;

      // Cert expiry alerts (scoped to current employees)
      const certExpiryAlerts = certifications
        .filter((c) => {
          if (selectedWorkshopId && !employeeIds.has(c.employee_id)) return false;
          const s = getExpiryStatus(c.expiry_date);
          return s === "expiring" || s === "expired";
        })
        .map((cert) => ({ cert, employee: employees.find((e) => e.id === cert.employee_id)! }))
        .filter((a) => a.employee);

      // Compliance alerts — employees needing attention
      const complianceAlerts = scopedCompliance
        .filter((c) => c.needsAttention)
        .map((c) => ({
          employee: employees.find((e) => e.id === c.employeeId)!,
          compliance: c,
        }))
        .filter((a) => a.employee)
        .sort((a, b) => a.compliance.overallCompliance - b.compliance.overallCompliance)
        .slice(0, 10);

      setStats({
        activePersonnel: activeEmployees.length,
        workforceCompliance,
        certExpiryCount: certExpiryAlerts.length,
        complianceAlerts,
        certExpiryAlerts,
      });
    }
    loadDashboard();
  }, [selectedWorkshopId]);

  if (!stats) return null;

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        description="OH&S overview — Thornton Engineering"
      />

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Active Personnel", value: stats.activePersonnel, icon: Users, href: "/personnel", color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Compliance", value: `${stats.workforceCompliance}%`, icon: ShieldCheck, href: "/personnel", color: stats.workforceCompliance >= 70 ? "text-emerald-400" : "text-amber-400", bg: stats.workforceCompliance >= 70 ? "bg-emerald-500/10" : "bg-amber-500/10" },
          { label: "Needs Attention", value: stats.complianceAlerts.length, icon: AlertTriangle, href: "#attention", color: stats.complianceAlerts.length > 0 ? "text-amber-400" : "text-emerald-400", bg: stats.complianceAlerts.length > 0 ? "bg-amber-500/10" : "bg-emerald-500/10" },
          { label: "Expiry Alerts", value: stats.certExpiryCount, icon: Clock, href: "#expiry", color: stats.certExpiryCount > 0 ? "text-red-400" : "text-emerald-400", bg: stats.certExpiryCount > 0 ? "bg-red-500/10" : "bg-emerald-500/10" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:border-amber-500/30 transition-colors cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.1em]">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 data-value ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ── EMPLOYEES NEEDING ATTENTION ── */}
      <div id="attention" className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              EMPLOYEES NEEDING ATTENTION
              {stats.complianceAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                  {stats.complianceAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.complianceAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">All employees are compliant</p>
            ) : (
              <div className="space-y-2">
                {stats.complianceAlerts.map(({ employee, compliance }) => (
                  <Link key={employee.id} href={`/personnel/${employee.id}`}
                    className="flex items-center gap-3 p-2.5 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Users className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{employee.first_name} {employee.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {compliance.flags.join(" · ")}
                      </p>
                    </div>
                    <span className={`text-sm font-bold data-value ${compliance.overallCompliance >= 50 ? "text-amber-400" : "text-red-400"}`}>
                      {compliance.overallCompliance}%
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── CERTIFICATION EXPIRY ALERTS ── */}
      <div id="expiry">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              CERTIFICATION EXPIRY
              {stats.certExpiryAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                  {stats.certExpiryAlerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.certExpiryAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No expiring certifications</p>
            ) : (
              <div className="space-y-2">
                {stats.certExpiryAlerts.map(({ cert, employee }) => (
                  <Link key={cert.id} href={`/personnel/${employee.id}`}
                    className="flex items-center justify-between p-2.5 rounded bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{employee.first_name} {employee.last_name}</p>
                      <p className="text-xs text-muted-foreground">{cert.cert_name}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={getExpiryStatus(cert.expiry_date)} />
                      <p className="text-[11px] text-muted-foreground mt-1 data-value">{formatDate(cert.expiry_date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
