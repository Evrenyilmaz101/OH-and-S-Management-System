"use client";

import { Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, getExpiryStatus } from "@/lib/utils";
import type { Employee, Certification, RoleDefinition } from "@/lib/types";

interface CertificationsTabProps {
  employee: Employee;
  certifications: Certification[];
  role: RoleDefinition | null;
}

export function CertificationsTab({
  employee,
  certifications,
  role,
}: CertificationsTabProps) {
  const requiredCertTypes = role?.required_cert_types || [];
  const hasRecords = certifications.length > 0;
  const hasRequirements = requiredCertTypes.length > 0;

  if (!hasRecords && !hasRequirements) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          No certifications and no role requirements configured.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Certifications Table */}
      <div>
        <div className="section-header">CERTIFICATIONS &amp; LICENCES</div>
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Certifications &amp; Licences
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {certifications.length} record
                {certifications.length !== 1 ? "s" : ""}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Certification</TableHead>
                    <TableHead className="text-xs">Number</TableHead>
                    <TableHead className="text-xs">Issuing Body</TableHead>
                    <TableHead className="text-xs">Issue Date</TableHead>
                    <TableHead className="text-xs">Expiry Date</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certifications.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No certifications
                      </TableCell>
                    </TableRow>
                  ) : (
                    certifications.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium text-sm">
                          {cert.cert_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground font-mono">
                          {cert.cert_number}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {cert.issuing_body}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(cert.issue_date)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground data-value">
                          {formatDate(cert.expiry_date)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={getExpiryStatus(cert.expiry_date)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Requirements / Gap Analysis */}
      {hasRequirements && (
        <div>
          <div className="section-header">ROLE REQUIREMENTS</div>
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                Required Certifications for {role?.name || "Role"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">
                        Required Cert Type
                      </TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Cert Number</TableHead>
                      <TableHead className="text-xs">Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requiredCertTypes.map((certType) => {
                      const certTypeLower = certType.toLowerCase();
                      const matching = certifications.find((c) =>
                        c.cert_name.toLowerCase().includes(certTypeLower)
                      );

                      let statusLabel: string;
                      let statusColor: string;

                      if (!matching) {
                        statusLabel = "Missing";
                        statusColor =
                          "bg-red-500/10 text-red-500 border-red-500/20";
                      } else if (
                        matching.expiry_date &&
                        getExpiryStatus(matching.expiry_date) === "expired"
                      ) {
                        statusLabel = "Expired";
                        statusColor =
                          "bg-red-500/10 text-red-500 border-red-500/20";
                      } else {
                        statusLabel = "Held";
                        statusColor =
                          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                      }

                      return (
                        <TableRow key={certType}>
                          <TableCell className="font-medium text-sm">
                            {certType}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border tracking-wide ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {matching?.cert_number || "\u2014"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground data-value">
                            {matching?.expiry_date
                              ? formatDate(matching.expiry_date)
                              : "\u2014"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
