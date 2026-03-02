"use client";

import { HardHat } from "lucide-react";
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
import type { Employee, PPERecord } from "@/lib/types";

interface PPETabProps {
  employee: Employee;
  ppeRecords: PPERecord[];
}

export function PPETab({ employee, ppeRecords }: PPETabProps) {
  return (
    <div className="space-y-6">
      <div className="section-header">PPE RECORDS</div>
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-500" />
            Personal Protective Equipment
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {ppeRecords.length} item{ppeRecords.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">PPE Type</TableHead>
                  <TableHead className="text-xs">Brand</TableHead>
                  <TableHead className="text-xs">Serial Number</TableHead>
                  <TableHead className="text-xs">Date Issued</TableHead>
                  <TableHead className="text-xs">Expiry Date</TableHead>
                  <TableHead className="text-xs">Condition</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ppeRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <HardHat className="w-8 h-8 text-muted-foreground/50" />
                        <p className="text-sm">No PPE records.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  ppeRecords.map((ppe) => (
                    <TableRow key={ppe.id}>
                      <TableCell className="font-medium text-sm">
                        {ppe.ppe_type}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ppe.brand || "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground font-mono">
                        {ppe.serial_number || "\u2014"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground data-value">
                        {formatDate(ppe.date_issued)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground data-value">
                            {ppe.expiry_date
                              ? formatDate(ppe.expiry_date)
                              : "\u2014"}
                          </span>
                          {ppe.expiry_date && (
                            <StatusBadge
                              status={getExpiryStatus(ppe.expiry_date)}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ppe.condition} />
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
  );
}
