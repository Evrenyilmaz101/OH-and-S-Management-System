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
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/utils";
import type { Document, DocumentCategory, DocumentStatus } from "@/lib/types";

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document | null;
  defaultCategory?: DocumentCategory;
  onSave: (document: Document, file?: File) => void;
}

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
const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const CATEGORIES: DocumentCategory[] = [
  "SOP",
  "SWMS",
  "Risk Assessment",
  "Policy",
  "Form",
  "Certificate",
  "Licence",
  "SDS",
  "Warning",
  "Leave Application",
];

const STATUSES: DocumentStatus[] = [
  "Current",
  "Under Review",
  "Superseded",
  "Archived",
];

const selectClasses =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const emptyDocument: Omit<Document, "id"> = {
  title: "",
  document_number: "",
  version: "1.0",
  category: "Policy",
  description: "",
  content: "",
  file_name: "",
  file_url: "",
  upload_date: new Date().toISOString().split("T")[0],
  review_date: "",
  status: "Current",
  tags: [],
  related_entity_id: "",
  related_entity_type: "",
  created_by: "",
  notes: "",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentDialog({
  open,
  onOpenChange,
  document: doc,
  defaultCategory,
  onSave,
}: DocumentDialogProps) {
  const [form, setForm] = useState(emptyDocument);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (doc) {
      const { id, ...rest } = doc;
      void id;
      setForm(rest);
    } else {
      setForm({
        ...emptyDocument,
        category: defaultCategory || emptyDocument.category,
      });
    }
    setSelectedFile(null);
    setFileError(null);
    setIsDragOver(false);
  }, [doc, open, defaultCategory]);

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type) && file.type !== "") {
      setFileError(
        "Unsupported file type. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT"
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`
      );
      return;
    }
    setSelectedFile(file);
    setForm((prev) => ({ ...prev, file_name: file.name }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    // Reset so re-selecting same file triggers change
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileError(null);
    // Only clear file_name if this is a new document (not editing with existing file)
    if (!doc?.file_url) {
      setForm((prev) => ({ ...prev, file_name: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      { id: doc?.id || generateId(), ...form } as Document,
      selectedFile || undefined
    );
    onOpenChange(false);
  };

  const hasExistingFile = doc?.file_url && !selectedFile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {doc ? "Edit Document" : "Add Document"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. OHS Policy"
            />
          </div>

          {/* Document Number + Version */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document_number">Document Number</Label>
              <Input
                id="document_number"
                value={form.document_number}
                onChange={(e) =>
                  setForm({ ...form, document_number: e.target.value })
                }
                placeholder="e.g. POL-OHS-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="e.g. 1.0"
              />
            </div>
          </div>

          {/* Category + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className={selectClasses}
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as DocumentCategory,
                  })
                }
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className={selectClasses}
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as DocumentStatus,
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Brief description of this document"
            />
          </div>

          {/* File Drop Zone */}
          <div className="space-y-2">
            <Label>File Attachment</Label>
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                isDragOver && "border-amber-500 bg-amber-500/10",
                !isDragOver &&
                  !selectedFile &&
                  !hasExistingFile &&
                  "border-border hover:border-muted-foreground",
                (selectedFile || hasExistingFile) &&
                  "border-emerald-500/50 bg-emerald-500/5",
                fileError && "border-destructive bg-destructive/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileSelect}
              />

              {fileError ? (
                <div className="flex flex-col items-center gap-2">
                  <X className="w-8 h-8 text-destructive" />
                  <p className="text-sm text-destructive">{fileError}</p>
                  <p className="text-xs text-muted-foreground">
                    Click to try again
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[300px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : hasExistingFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-500 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[300px]">
                      {doc.file_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current file — click or drop to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop a file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT — max 10 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Review Date + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="review_date">Review Date</Label>
              <Input
                id="review_date"
                type="date"
                value={form.review_date}
                onChange={(e) =>
                  setForm({ ...form, review_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="safety, welding, PPE"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {doc ? "Save Changes" : "Add Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
