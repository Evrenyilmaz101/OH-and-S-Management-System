"use client";

import { useMemo } from "react";
import {
  FileText,
  Upload,
  Paperclip,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ClipboardList,
  ShieldCheck,
  FileWarning,
  CalendarDays,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";
import { getDocumentFileUrl } from "@/lib/store/document-storage";
import { toast } from "sonner";
import type {
  Employee,
  Document,
  DocumentCategory,
  VOCRecord,
  Task,
  RoleDefinition,
} from "@/lib/types";

interface DocumentsTabProps {
  employee: Employee;
  documents: Document[];
  vocRecords: VOCRecord[];
  tasks: Task[];
  role: RoleDefinition | null;
  onToggleVOC: (taskId: string, record?: VOCRecord) => void;
  onUploadDoc: (category?: DocumentCategory) => void;
  onOpenAttachment: (
    title: string,
    category: DocumentCategory,
    entityId: string,
    entityType: string
  ) => void;
  onDeleteDoc: (doc: Document) => void;
}

// ─── Helpers ──────────────────────────────────────────────

function getDocsForItem(
  docs: Document[],
  category: DocumentCategory,
  entityId: string,
  entityType: string
): Document[] {
  return docs.filter(
    (d) =>
      d.category === category &&
      d.related_entity_id === entityId &&
      d.related_entity_type === entityType
  );
}

function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-border/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {completed}/{total} ({pct}%)
      </span>
    </div>
  );
}

function DocLinks({ docs, onDelete }: { docs: Document[]; onDelete?: (doc: Document) => void }) {
  const handleOpen = async (doc: Document) => {
    if (!doc.file_url) {
      toast.error("No file attached to this document");
      return;
    }
    const url = await getDocumentFileUrl(doc.file_url);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Could not load file");
    }
  };

  if (docs.length === 0) {
    return <span className="text-xs text-muted-foreground/40">—</span>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {docs.map((doc) => (
        <div key={doc.id} className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleOpen(doc)}
            className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 hover:underline transition-colors text-left"
            title={doc.file_name || doc.title}
          >
            <Paperclip className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[120px]">
              {doc.file_name || doc.title}
            </span>
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(doc)}
              className="text-muted-foreground/40 hover:text-red-400 transition-colors p-0.5"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export function DocumentsTab({
  employee,
  documents,
  vocRecords,
  tasks,
  role,
  onToggleVOC,
  onUploadDoc,
  onOpenAttachment,
  onDeleteDoc,
}: DocumentsTabProps) {
  // ── VOC data ──
  const requiredTaskIds = role?.required_task_ids || [];

  // All tasks that are either required by role or already have a VOC record
  const vocTaskIds = useMemo(() => {
    const ids = new Set<string>(requiredTaskIds);
    for (const v of vocRecords) {
      ids.add(v.task_id);
    }
    return Array.from(ids);
  }, [requiredTaskIds, vocRecords]);

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    for (const t of tasks) {
      map.set(t.id, t);
    }
    return map;
  }, [tasks]);

  const vocMap = useMemo(() => {
    const map = new Map<string, VOCRecord>();
    for (const v of vocRecords) {
      map.set(v.task_id, v);
    }
    return map;
  }, [vocRecords]);

  const vocCompleted = useMemo(
    () => vocTaskIds.filter((id) => vocMap.get(id)?.status === "Competent").length,
    [vocTaskIds, vocMap]
  );

  // ── Document filters ──
  const warningDocs = useMemo(
    () => documents.filter((d) => d.category === "Warning"),
    [documents]
  );

  const leaveDocs = useMemo(
    () => documents.filter((d) => d.category === "Leave Application"),
    [documents]
  );

  return (
    <div className="space-y-8">
      {/* ═══════════════ VERIFICATION OF COMPETENCIES ═══════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="section-header mb-0 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            VERIFICATION OF COMPETENCIES
          </div>
        </div>

        {vocTaskIds.length > 0 && (
          <div className="mb-4">
            <ProgressBar
              completed={vocCompleted}
              total={vocTaskIds.length}
            />
          </div>
        )}

        <Card className="border-border/60">
          <CardContent className="p-0">
            {vocTaskIds.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <ShieldCheck className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm">
                  No competencies required for this role.
                </p>
                <p className="text-xs">
                  Assign required competencies to the role in Settings.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-10"></TableHead>
                      <TableHead className="text-xs">
                        Competency
                      </TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Assessed</TableHead>
                      <TableHead className="text-xs">Expiry</TableHead>
                      <TableHead className="text-xs">Docs</TableHead>
                      <TableHead className="text-xs text-right">
                        Attach
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vocTaskIds.map((taskId) => {
                      const task = taskMap.get(taskId);
                      const vocRecord = vocMap.get(taskId);
                      const isCompetent =
                        vocRecord?.status === "Competent";
                      const attachedDocs = getDocsForItem(
                        documents,
                        "VOC Verification",
                        taskId,
                        "voc_item"
                      );

                      return (
                        <TableRow key={taskId}>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() =>
                                onToggleVOC(taskId, vocRecord)
                              }
                              className="hover:scale-110 transition-transform"
                            >
                              {isCompetent ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/40" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">
                              {task?.name || taskId}
                            </p>
                            {task?.category && (
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {task.category}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <StatusBadge
                                status={
                                  vocRecord?.status || "Not Competent"
                                }
                              />
                              {isCompetent && attachedDocs.length === 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5" title="Competent but no document uploaded">
                                  <AlertTriangle className="w-3 h-3" />
                                  No document uploaded
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground data-value">
                            {vocRecord?.assessed_date
                              ? formatDate(vocRecord.assessed_date)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground data-value">
                            {vocRecord?.expiry_date
                              ? formatDate(vocRecord.expiry_date)
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <DocLinks docs={attachedDocs} onDelete={onDeleteDoc} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                onOpenAttachment(
                                  `VOC - ${task?.name || taskId}`,
                                  "VOC Verification",
                                  taskId,
                                  "voc_item"
                                )
                              }
                            >
                              <Upload className="w-3.5 h-3.5 mr-1" />
                              Attach
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════ SECTION 3: WARNINGS ═══════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="section-header mb-0 flex items-center gap-2">
            <FileWarning className="w-3.5 h-3.5 text-red-400" />
            WARNINGS
          </div>
          <Button
            size="sm"
            onClick={() => onUploadDoc("Warning")}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Add Warning
          </Button>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-0">
            {warningDocs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <AlertTriangle className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm">No warnings on file.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">File</TableHead>
                      <TableHead className="text-xs">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warningDocs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-sm text-muted-foreground data-value whitespace-nowrap">
                          {formatDate(doc.upload_date)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {doc.title}
                        </TableCell>
                        <TableCell>
                          <DocLinks docs={[doc]} onDelete={onDeleteDoc} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {doc.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ═══════════════ SECTION 4: LEAVE APPLICATION FORMS ═══════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="section-header mb-0 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
            LEAVE APPLICATION FORMS
          </div>
          <Button
            size="sm"
            onClick={() => onUploadDoc("Leave Application")}
            className="gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Add Leave Form
          </Button>
        </div>

        <Card className="border-border/60">
          <CardContent className="p-0">
            {leaveDocs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm">No leave applications on file.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">File</TableHead>
                      <TableHead className="text-xs">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaveDocs.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="text-sm text-muted-foreground data-value whitespace-nowrap">
                          {formatDate(doc.upload_date)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {doc.title}
                        </TableCell>
                        <TableCell>
                          <DocLinks docs={[doc]} onDelete={onDeleteDoc} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {doc.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
