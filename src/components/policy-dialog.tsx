"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, generateId } from "@/lib/utils";
import type { CompanyPolicy } from "@/lib/types";

interface PolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: CompanyPolicy | null;
  onSave: (policy: CompanyPolicy, file?: File) => void;
}

const CATEGORIES = ["Safety", "HR", "Environmental", "Quality", "General"];
const STATUSES = ["Current", "Under Review", "Archived"];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt";
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "text/plain",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const selectClasses =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const emptyForm = {
  name: "",
  description: "",
  category: "Safety",
  version: "1.0",
  effective_date: "",
  review_date: "",
  status: "Current",
  active: true,
  sort_order: 0,
};

export function PolicyDialog({
  open,
  onOpenChange,
  policy,
  onSave,
}: PolicyDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (policy) {
      setForm({
        name: policy.name,
        description: policy.description,
        category: policy.category,
        version: policy.version,
        effective_date: policy.effective_date || "",
        review_date: policy.review_date || "",
        status: policy.status,
        active: policy.active,
        sort_order: policy.sort_order,
      });
    } else {
      setForm(emptyForm);
    }
    setSelectedFile(null);
    setFileError(null);
    setIsDragOver(false);
  }, [policy, open]);

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type) && file.type !== "") {
      setFileError("Unsupported file type. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large (${formatFileSize(file.size)}). Maximum 10 MB.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: CompanyPolicy = {
      id: policy?.id || generateId(),
      name: form.name,
      description: form.description,
      category: form.category,
      version: form.version,
      effective_date: form.effective_date,
      review_date: form.review_date,
      status: form.status,
      file_name: selectedFile?.name || policy?.file_name || "",
      file_url: policy?.file_url || "",
      active: form.active,
      sort_order: form.sort_order,
    };
    onSave(result, selectedFile || undefined);
    onOpenChange(false);
  };

  const hasExistingFile = policy?.file_name && !selectedFile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{policy ? "Edit Policy" : "Add Policy"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="pol-name">Name</Label>
            <Input
              id="pol-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Workplace Health and Safety Policy"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pol-category">Category</Label>
              <select
                id="pol-category"
                className={selectClasses}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pol-version">Version</Label>
              <Input
                id="pol-version"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="1.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pol-status">Status</Label>
              <select
                id="pol-status"
                className={selectClasses}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pol-effective">Effective Date</Label>
              <Input
                id="pol-effective"
                type="date"
                value={form.effective_date}
                onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pol-review">Review Date</Label>
              <Input
                id="pol-review"
                type="date"
                value={form.review_date}
                onChange={(e) => setForm({ ...form, review_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pol-desc">Description</Label>
            <textarea
              id="pol-desc"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of this policy"
            />
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>File</Label>
            <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPTED_EXTENSIONS} onChange={handleFileSelect} />

            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg text-center transition-colors p-4",
                isDragOver && "border-amber-500 bg-amber-500/10",
                !isDragOver && !selectedFile && !hasExistingFile && !fileError && "border-border hover:border-muted-foreground cursor-pointer",
                (selectedFile || hasExistingFile) && "border-emerald-500/50 bg-emerald-500/5",
                fileError && "border-destructive bg-destructive/5 cursor-pointer"
              )}
            >
              {fileError ? (
                <div className="flex flex-col items-center gap-2">
                  <X className="w-6 h-6 text-destructive" />
                  <p className="text-xs text-destructive">{fileError}</p>
                  <p className="text-[10px] text-muted-foreground">Click to try again</p>
                </div>
              ) : selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[280px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : hasExistingFile ? (
                <div className="flex items-center justify-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <FileText className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[280px]">{policy?.file_name}</p>
                    <p className="text-[10px] text-muted-foreground">Click to replace file</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground">Click or drag & drop to upload</p>
                  <p className="text-[10px] text-muted-foreground/60">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT — max 10 MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="pol-active"
              type="checkbox"
              className="h-4 w-4 rounded border-input accent-amber-500"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <Label htmlFor="pol-active">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {policy ? "Save Changes" : "Add Policy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
