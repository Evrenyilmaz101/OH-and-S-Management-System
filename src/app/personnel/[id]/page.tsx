"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeDialog } from "@/components/employee-dialog";
import { DocumentDialog } from "@/components/document-dialog";
import { AttachmentDialog } from "@/components/attachment-dialog";
import { EmployeeFileHeader } from "./_components/employee-file-header";
import { OverviewTab } from "./_components/overview-tab";
import { DocumentsTab } from "./_components/documents-tab";
import {
  getEmployee,
  updateEmployee,
  getRoles,
  getTasks,
  getVOCByEmployee,
  getCertsByEmployee,
  getInductionsByEmployee,
  getInductionTemplates,
  getDocumentsForEmployee,
  addDocument,
  deleteDocument,
  addInductionRecord,
  updateInductionRecord,
  addVOCRecord,
  updateVOCRecord,
} from "@/lib/store/index";
import { computeCompliance } from "@/lib/store/compliance-engine";
import {
  uploadDocumentFile,
  deleteDocumentFile,
  uploadEmployeePhoto,
  getEmployeePhotoUrl,
} from "@/lib/store/document-storage";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import type {
  Employee,
  RoleDefinition,
  Task,
  VOCRecord,
  InductionRecord,
  InductionChecklistTemplate,
  Document,
  DocumentCategory,
} from "@/lib/types";
import type { ComplianceStatus } from "@/lib/store/compliance-engine";

export default function EmployeeFilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  // Core
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [role, setRole] = useState<RoleDefinition | null>(null);
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);

  // Data for documents tab sections
  const [personalDocs, setPersonalDocs] = useState<Document[]>([]);
  const [inductionRecords, setInductionRecords] = useState<InductionRecord[]>([]);
  const [inductionTemplates, setInductionTemplates] = useState<InductionChecklistTemplate[]>([]);
  const [vocRecords, setVocRecords] = useState<VOCRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docDialogCategory, setDocDialogCategory] = useState<DocumentCategory | undefined>();

  // Attachment dialog state
  const [attachDialogOpen, setAttachDialogOpen] = useState(false);
  const [attachDialogTitle, setAttachDialogTitle] = useState("");
  const [attachDialogCategory, setAttachDialogCategory] = useState<DocumentCategory>("Induction Verification");
  const [attachDialogEntityId, setAttachDialogEntityId] = useState("");
  const [attachDialogEntityType, setAttachDialogEntityType] = useState("");

  const loadData = useCallback(async () => {
    const emp = await getEmployee(employeeId);
    if (!emp) {
      router.push("/personnel");
      return;
    }
    setEmployee(emp);

    const [roles, allTasks, vocs, certs, indRecords, indTemplates, docs] =
      await Promise.all([
        getRoles(),
        getTasks(),
        getVOCByEmployee(employeeId),
        getCertsByEmployee(employeeId),
        getInductionsByEmployee(employeeId),
        getInductionTemplates(),
        getDocumentsForEmployee(employeeId),
      ]);

    const empRole = roles.find((r) => r.id === emp.role_id) || null;
    setRole(empRole);
    setPersonalDocs(docs);
    setInductionRecords(indRecords);
    setInductionTemplates(indTemplates);
    setVocRecords(vocs);
    setTasks(allTasks);

    // Compute compliance from loaded data
    const comp = computeCompliance(
      emp,
      empRole,
      vocs,
      certs,
      indRecords,
      indTemplates
    );
    setCompliance(comp);

    // Resolve photo URL
    if (emp.photo_url) {
      const url = await getEmployeePhotoUrl(emp.photo_url);
      setPhotoUrl(url);
    } else {
      setPhotoUrl(null);
    }
  }, [employeeId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handlers ──

  const handleSave = async (updated: Employee) => {
    await updateEmployee(updated);
    await loadData();
  };

  const handlePhotoUpload = async (file: File) => {
    if (!employee) return;
    const result = await uploadEmployeePhoto(file, employeeId);
    if (result.path) {
      await updateEmployee({ ...employee, photo_url: result.path });
      toast.success("Photo updated");
      await loadData();
    } else {
      toast.error(result.error || "Failed to upload photo");
    }
  };

  // Open document dialog (for Warnings / Leave Application sections)
  const handleDocUpload = (category?: DocumentCategory) => {
    setDocDialogCategory(category);
    setDocDialogOpen(true);
  };

  const handleDocSave = async (doc: Document, file?: File) => {
    let fileUrl = doc.file_url || "";
    if (file) {
      const result = await uploadDocumentFile(file, doc.id);
      if (result.path) {
        fileUrl = result.path;
      } else {
        toast.error(result.error || "Failed to upload file");
        return;
      }
    }
    const docWithFile = {
      ...doc,
      file_url: fileUrl,
      related_entity_id: employeeId,
      related_entity_type: "employee",
    };
    await addDocument(docWithFile);
    toast.success("Document saved");
    await loadData();
  };

  // Open attachment dialog for inline uploads (Induction / VOC items)
  const handleOpenAttachment = (
    title: string,
    category: DocumentCategory,
    entityId: string,
    entityType: string
  ) => {
    setAttachDialogTitle(title);
    setAttachDialogCategory(category);
    setAttachDialogEntityId(entityId);
    setAttachDialogEntityType(entityType);
    setAttachDialogOpen(true);
  };

  const handleAttachmentSave = async (doc: Document, file?: File) => {
    let fileUrl = doc.file_url || "";
    if (file) {
      const result = await uploadDocumentFile(file, doc.id);
      if (result.path) {
        fileUrl = result.path;
      } else {
        toast.error(result.error || "Failed to upload file");
        return;
      }
    }
    const docWithFile = {
      ...doc,
      file_url: fileUrl,
      // Also link to this employee for querying
      tags: [...(doc.tags || []), `emp:${employeeId}`],
    };
    await addDocument(docWithFile);
    toast.success("Attachment uploaded");
    await loadData();
  };

  // Delete a document (record + file)
  const handleDeleteDoc = async (doc: Document) => {
    if (!confirm(`Delete "${doc.title || doc.file_name}"? This cannot be undone.`)) return;
    if (doc.file_url) {
      await deleteDocumentFile(doc.file_url);
    }
    await deleteDocument(doc.id);
    toast.success("Document deleted");
    await loadData();
  };

  // Toggle induction item complete/pending
  const handleToggleInduction = async (
    templateId: string,
    currentRecord?: InductionRecord
  ) => {
    if (currentRecord && currentRecord.status === "Completed") {
      // Uncomplete: set back to Pending
      await updateInductionRecord({
        ...currentRecord,
        status: "Pending",
        completed_date: "",
        completed_by: "",
      });
    } else if (currentRecord) {
      // Complete an existing pending record
      await updateInductionRecord({
        ...currentRecord,
        status: "Completed",
        completed_date: new Date().toISOString().split("T")[0],
        completed_by: "Admin",
      });
    } else {
      // Create new record as Completed
      await addInductionRecord({
        id: generateId(),
        employee_id: employeeId,
        checklist_item_id: templateId,
        status: "Completed",
        completed_date: new Date().toISOString().split("T")[0],
        completed_by: "Admin",
        notes: "",
      });
    }
    await loadData();
  };

  // Toggle VOC competent/not competent
  const handleToggleVOC = async (
    taskId: string,
    currentRecord?: VOCRecord
  ) => {
    if (currentRecord && currentRecord.status === "Competent") {
      // Uncomplete: set back to Not Competent
      await updateVOCRecord({
        ...currentRecord,
        status: "Not Competent",
        assessed_date: "",
        assessed_by: "",
        expiry_date: "",
      });
    } else if (currentRecord) {
      // Mark as Competent
      const assessed = new Date().toISOString().split("T")[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 2);
      await updateVOCRecord({
        ...currentRecord,
        status: "Competent",
        assessed_date: assessed,
        assessed_by: "Admin",
        expiry_date: expiry.toISOString().split("T")[0],
      });
    } else {
      // Create new record as Competent
      const assessed = new Date().toISOString().split("T")[0];
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + 2);
      await addVOCRecord({
        id: generateId(),
        employee_id: employeeId,
        task_id: taskId,
        status: "Competent",
        assessed_date: assessed,
        assessed_by: "Admin",
        expiry_date: expiry.toISOString().split("T")[0],
        notes: "",
      });
    }
    await loadData();
  };

  // ── Loading State ──

  if (!employee || !compliance) {
    return (
      <div className="p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm text-muted-foreground">
            Loading employee file...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <EmployeeFileHeader
        employee={employee}
        compliance={compliance}
        role={role}
        photoUrl={photoUrl}
        onEdit={() => setEditOpen(true)}
        onPhotoUpload={handlePhotoUpload}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {[
            { value: "overview", label: "Overview" },
            { value: "documents", label: "Documents" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/30"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            employee={employee}
            compliance={compliance}
            role={role}
            tasks={tasks}
            documents={personalDocs}
            vocRecords={vocRecords}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab
            employee={employee}
            documents={personalDocs}
            vocRecords={vocRecords}
            tasks={tasks}
            role={role}
            onToggleVOC={handleToggleVOC}
            onUploadDoc={handleDocUpload}
            onOpenAttachment={handleOpenAttachment}
            onDeleteDoc={handleDeleteDoc}
          />
        </TabsContent>
      </Tabs>

      <EmployeeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
        onSave={handleSave}
      />

      <DocumentDialog
        open={docDialogOpen}
        onOpenChange={setDocDialogOpen}
        document={null}
        defaultCategory={docDialogCategory}
        onSave={handleDocSave}
      />

      <AttachmentDialog
        open={attachDialogOpen}
        onOpenChange={setAttachDialogOpen}
        defaultTitle={attachDialogTitle}
        category={attachDialogCategory}
        relatedEntityId={attachDialogEntityId}
        relatedEntityType={attachDialogEntityType}
        tags={[`emp:${employeeId}`]}
        onSave={handleAttachmentSave}
      />
    </div>
  );
}
