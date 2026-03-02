"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Camera, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import type { Employee, RoleDefinition } from "@/lib/types";
import type { ComplianceStatus } from "@/lib/store/compliance-engine";

interface EmployeeFileHeaderProps {
  employee: Employee;
  compliance: ComplianceStatus;
  role: RoleDefinition | null;
  photoUrl: string | null;
  onEdit: () => void;
  onPhotoUpload: (file: File) => void;
}

function getComplianceColor(value: number): string {
  if (value >= 80) return "text-emerald-500";
  if (value >= 50) return "text-amber-500";
  return "text-red-500";
}

function getComplianceRingColor(value: number): string {
  if (value >= 80) return "border-emerald-500/40";
  if (value >= 50) return "border-amber-500/40";
  return "border-red-500/40";
}

export function EmployeeFileHeader({
  employee,
  compliance,
  role,
  photoUrl,
  onEdit,
  onPhotoUpload,
}: EmployeeFileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoUpload(file);
      e.target.value = "";
    }
  };

  const initials = `${employee.first_name[0] || ""}${employee.last_name[0] || ""}`.toUpperCase();

  return (
    <div className="mb-8 pt-12 lg:pt-0">
      <Link
        href="/personnel"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Personnel
      </Link>

      <div className="flex items-start gap-5">
        {/* Profile Photo */}
        <div className="relative group shrink-0">
          <button
            onClick={handlePhotoClick}
            className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-border hover:border-amber-500/50 transition-colors bg-muted flex items-center justify-center cursor-pointer"
          >
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={`${employee.first_name} ${employee.last_name}`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground/60">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {employee.first_name} {employee.last_name}
            </h1>
            <StatusBadge status={employee.status} />
            <StatusBadge status={employee.employment_type} />
          </div>
          {role && (
            <p className="text-sm text-muted-foreground">{role.name}</p>
          )}
          {!role && employee.role && (
            <p className="text-sm text-muted-foreground">{employee.role}</p>
          )}
        </div>

        {/* Right side — compliance + edit */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getComplianceRingColor(
              compliance.overallCompliance
            )}`}
          >
            <span className={`text-sm font-bold data-value ${getComplianceColor(compliance.overallCompliance)}`}>
              {compliance.overallCompliance}%
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
