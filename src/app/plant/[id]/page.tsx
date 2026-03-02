"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wrench,
  MapPin,
  Calendar,
  Hash,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlantItem } from "@/lib/store/registers";
import { getSOPs } from "@/lib/store/sops";
import { formatDate } from "@/lib/utils";
import type { PlantEquipment, PlantStatus, RegistrationStatus, SOP } from "@/lib/types";

const statusConfig: Record<PlantStatus, { label: string; className: string }> = {
  Operational: {
    label: "Operational",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  "Out of Service": {
    label: "Out of Service",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  "Under Maintenance": {
    label: "Under Maintenance",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Decommissioned: {
    label: "Decommissioned",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
};

const regConfig: Record<RegistrationStatus, { label: string; className: string }> = {
  Registered: {
    label: "Registered",
    className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
  "Not Required": {
    label: "Not Required",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  },
  Pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  },
  Expired: {
    label: "Expired",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

function isOverdue(dateString: string): boolean {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
}

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<PlantEquipment | null>(null);
  const [associatedSOPs, setAssociatedSOPs] = useState<SOP[]>([]);

  useEffect(() => {
    async function load() {
      const id = params.id as string;
      const equipment = await getPlantItem(id);
      if (!equipment) {
        router.push("/plant");
        return;
      }
      setItem(equipment);

      const allSOPs = await getSOPs();
      const linked = allSOPs.filter(
        (sop) =>
          equipment.associated_sop_ids?.includes(sop.id) ||
          sop.associated_equipment?.includes(equipment.id)
      );
      setAssociatedSOPs(linked);
    }
    load();
  }, [params.id, router]);

  if (!item) return null;

  const sc = statusConfig[item.status];
  const rc = regConfig[item.registration_status];
  const maintenanceOverdue = isOverdue(item.next_maintenance_date);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 pt-12 lg:pt-0">
        <Link
          href="/plant"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plant Register
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
              <Badge variant="outline" className={sc.className}>
                {sc.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Asset Number:{" "}
              <span className="data-value text-foreground font-medium">{item.asset_number}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Info Grid */}
      <div className="section-header">Equipment Details</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Wrench className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Make</p>
              <p className="text-sm font-medium">{item.make || "\u2014"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Wrench className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Model</p>
              <p className="text-sm font-medium">{item.model || "\u2014"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Hash className="w-4 h-4 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Serial Number</p>
              <p className="text-sm font-medium data-value">{item.serial_number || "\u2014"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <MapPin className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{item.location || "\u2014"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Wrench className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className={sc.className}>
                {sc.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/10">
              <Calendar className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Purchase Date</p>
              <p className="text-sm font-medium data-value">
                {item.purchase_date ? formatDate(item.purchase_date) : "\u2014"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Section */}
      <div className="section-header">Registration</div>
      <Card className="mb-8 border-border/60">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Registration Number</p>
              <p className="text-sm font-medium data-value">
                {item.registration_number || "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Registration Status</p>
              <Badge variant="outline" className={rc.className}>
                {rc.label}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Registration Expiry</p>
              <p className="text-sm font-medium data-value">
                {item.registration_expiry ? formatDate(item.registration_expiry) : "\u2014"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Section */}
      <div className="section-header">Maintenance</div>
      <Card className={`mb-8 border-border/60 ${maintenanceOverdue ? "border-red-500/40" : ""}`}>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Last Maintenance</p>
              <p className="text-sm font-medium data-value">
                {item.last_maintenance_date
                  ? formatDate(item.last_maintenance_date)
                  : "\u2014"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Next Maintenance</p>
              <p
                className={`text-sm font-medium data-value ${
                  maintenanceOverdue ? "text-red-500" : ""
                }`}
              >
                {item.next_maintenance_date
                  ? formatDate(item.next_maintenance_date)
                  : "\u2014"}
                {maintenanceOverdue && (
                  <span className="ml-2 text-[10px] uppercase tracking-wider font-bold text-red-500">
                    Overdue
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Frequency</p>
              <p className="text-sm font-medium">
                {item.maintenance_frequency_days
                  ? `Every ${item.maintenance_frequency_days} days`
                  : "\u2014"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Associated SOPs */}
      <Card className="mb-8 border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Associated SOPs
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {associatedSOPs.length} SOP{associatedSOPs.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {associatedSOPs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No associated SOPs
            </p>
          ) : (
            <div className="space-y-2">
              {associatedSOPs.map((sop) => (
                <div
                  key={sop.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-4 h-4 text-amber-500/70" />
                    <div>
                      <p className="text-sm font-medium">{sop.title}</p>
                      <p className="text-xs text-muted-foreground data-value">
                        {sop.document_number} &middot; v{sop.version}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      sop.status === "Current"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : sop.status === "Under Review"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                    }
                  >
                    {sop.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {item.notes && (
        <Card className="border-border/60">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm">{item.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
