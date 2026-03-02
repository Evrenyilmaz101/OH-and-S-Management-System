"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SignaturePad } from "@/components/signature-pad";
import {
  getEmployees,
  getTasks,
  getVOCTemplateByTask,
  addVOCAssessment,
  addVOCRecord,
  updateVOCRecord,
  getVOCByEmployee,
  addDocument,
} from "@/lib/store/index";
import { uploadDocumentFile } from "@/lib/store/document-storage";
import { generateVOCPdf } from "@/lib/generate-voc-pdf";
import { generateId } from "@/lib/utils";
import { toast } from "sonner";
import type { Employee, Task, VOCAssessmentTemplate } from "@/lib/types";

export default function VOCAssessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preEmployeeId = searchParams.get("employee") || "";
  const preTaskId = searchParams.get("task") || "";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [template, setTemplate] = useState<VOCAssessmentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [noTemplate, setNoTemplate] = useState(false);

  // Form state
  const [employeeId, setEmployeeId] = useState(preEmployeeId);
  const [taskId, setTaskId] = useState(preTaskId);
  const [assessorName, setAssessorName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sopAcknowledged, setSopAcknowledged] = useState<boolean | null>(null);
  const [knowledgeResponses, setKnowledgeResponses] = useState<
    { question: string; response: string; competent: boolean }[]
  >([]);
  const [practicalResponses, setPracticalResponses] = useState<
    { task: string; criteria: string; competent: boolean }[]
  >([]);
  const [assessorComments, setAssessorComments] = useState("");
  const [assessorSignature, setAssessorSignature] = useState("");
  const [employeeSignature, setEmployeeSignature] = useState("");

  // Load employees and tasks
  useEffect(() => {
    (async () => {
      const [emps, tsks] = await Promise.all([getEmployees(), getTasks()]);
      setEmployees(emps.filter((e) => e.status === "Active"));
      setTasks(tsks.filter((t) => t.active));
      setLoading(false);
    })();
  }, []);

  // Load template when task changes
  useEffect(() => {
    if (!taskId) {
      setTemplate(null);
      setNoTemplate(false);
      return;
    }
    (async () => {
      const tmpl = await getVOCTemplateByTask(taskId);
      if (tmpl) {
        setTemplate(tmpl);
        setNoTemplate(false);
        setKnowledgeResponses(
          tmpl.knowledge_questions.map((q) => ({
            question: q.question,
            response: "",
            competent: false,
          }))
        );
        setPracticalResponses(
          tmpl.practical_tasks.map((p) => ({
            task: p.task,
            criteria: p.criteria,
            competent: false,
          }))
        );
      } else {
        setTemplate(null);
        setNoTemplate(true);
        setKnowledgeResponses([]);
        setPracticalResponses([]);
      }
    })();
  }, [taskId]);

  // Derived
  const selectedEmployee = employees.find((e) => e.id === employeeId);
  const selectedTask = tasks.find((t) => t.id === taskId);
  const allKnowledgeCompetent = knowledgeResponses.every((k) => k.competent);
  const allPracticalCompetent = practicalResponses.every((p) => p.competent);
  const autoOutcome =
    allKnowledgeCompetent && allPracticalCompetent && sopAcknowledged
      ? "Competent"
      : "Not Yet Competent";

  const canSubmit =
    employeeId &&
    taskId &&
    template &&
    assessorName &&
    sopAcknowledged !== null &&
    assessorSignature &&
    employeeSignature;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedEmployee || !selectedTask || !template) return;
    setSubmitting(true);

    try {
      const employeeName = `${selectedEmployee.first_name} ${selectedEmployee.last_name}`;
      const employeePosition = selectedEmployee.role || "";
      const outcome = autoOutcome;

      // 1. Create or update VOC record
      const existingVocs = await getVOCByEmployee(employeeId);
      const existingVoc = existingVocs.find((v) => v.task_id === taskId);

      const assessedDate = assessmentDate;
      const expiryDate = new Date(assessedDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 2);
      const expiryStr = expiryDate.toISOString().split("T")[0];

      let vocRecordId: string;
      if (existingVoc) {
        await updateVOCRecord({
          ...existingVoc,
          status: outcome === "Competent" ? "Competent" : "Not Competent",
          assessed_date: assessedDate,
          assessed_by: assessorName,
          expiry_date: expiryStr,
        });
        vocRecordId = existingVoc.id;
      } else {
        const newId = generateId();
        await addVOCRecord({
          id: newId,
          employee_id: employeeId,
          task_id: taskId,
          status: outcome === "Competent" ? "Competent" : "Not Competent",
          assessed_date: assessedDate,
          assessed_by: assessorName,
          expiry_date: expiryStr,
          notes: "",
        });
        vocRecordId = newId;
      }

      // 2. Generate PDF
      const docNumber = `TE-VOC-${selectedTask.name.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const pdfBlob = generateVOCPdf({
        employeeName,
        employeePosition,
        assessorName,
        assessmentDate,
        taskName: selectedTask.name,
        documentNumber: docNumber,
        sopAcknowledged: sopAcknowledged ?? false,
        knowledgeResponses,
        practicalResponses,
        overallOutcome: outcome,
        assessorComments,
        assessorSignature,
        employeeSignature,
      });

      // 3. Upload PDF to Supabase Storage
      // Sanitize filename: remove special chars, replace spaces with hyphens
      const safeName = (s: string) => s.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-");
      const pdfFileName = `VOC-${safeName(selectedTask.name)}-${safeName(employeeName)}-${assessedDate}.pdf`;
      const pdfFile = new File(
        [pdfBlob],
        pdfFileName,
        { type: "application/pdf" }
      );

      const documentId = generateId();
      const filePath = await uploadDocumentFile(pdfFile, documentId);

      if (!filePath) {
        console.error("[VOC] PDF upload failed — no file path returned");
      }

      // 4. Create document record
      let docId = "";
      if (filePath) {
        const docRecord = await addDocument({
          id: documentId,
          title: `VOC Assessment - ${selectedTask.name} - ${employeeName}`,
          document_number: docNumber,
          version: "1.0",
          category: "VOC Verification",
          description: `Digital VOC assessment for ${selectedTask.name}`,
          content: "",
          file_name: pdfFile.name,
          file_url: filePath,
          upload_date: assessedDate,
          review_date: "",
          status: "Current",
          tags: [`emp:${employeeId}`],
          related_entity_id: taskId,
          related_entity_type: "voc_item",
          created_by: "",
          notes: "",
        });
        if (docRecord) {
          docId = docRecord.id;
        } else {
          console.error("[VOC] Document record insert failed");
        }
      }

      // 5. Save assessment record
      await addVOCAssessment({
        id: generateId(),
        voc_record_id: vocRecordId,
        employee_id: employeeId,
        task_id: taskId,
        template_id: template.id,
        assessor_name: assessorName,
        employee_position: employeePosition,
        assessment_date: assessedDate,
        sop_acknowledged: sopAcknowledged ?? false,
        knowledge_responses: knowledgeResponses,
        practical_responses: practicalResponses,
        overall_outcome: outcome,
        assessor_comments: assessorComments,
        assessor_signature: assessorSignature,
        employee_signature: employeeSignature,
        document_id: docId,
      });

      if (docId) {
        toast.success("Assessment saved with PDF document");
      } else {
        toast.success("Assessment saved (PDF generation skipped)");
      }
      router.push("/voc");
    } catch (err) {
      console.error("Assessment submission failed:", err);
      toast.error("Failed to submit assessment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/voc">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Digital VOC Assessment</h1>
          <p className="text-sm text-muted-foreground">
            Complete the verification of competency form below
          </p>
        </div>
      </div>

      {/* === SECTION 1: PARTICIPANT DETAILS === */}
      <Card className="mb-4 border-border/60">
        <CardContent className="p-5">
          <h2 className="text-sm font-bold text-amber-400 mb-4 tracking-wide">
            1.0 &nbsp; PARTICIPANT DETAILS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              >
                <option value="">Select employee...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.first_name} {e.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <Input
                value={selectedEmployee?.role || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Task / Competency</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                required
              >
                <option value="">Select task...</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Assessor Name</Label>
              <Input
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                placeholder="Enter assessor name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={assessmentDate}
                onChange={(e) => setAssessmentDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No template warning */}
      {noTemplate && taskId && (
        <Card className="mb-4 border-amber-500/50 bg-amber-500/5">
          <CardContent className="p-5">
            <p className="text-sm text-amber-400">
              No assessment template found for this task. Please{" "}
              <Link
                href="/voc/templates"
                className="underline font-medium"
              >
                create a VOC template
              </Link>{" "}
              first before starting a digital assessment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Only show rest of form if template is loaded */}
      {template && (
        <>
          {/* === SECTION 2: SOP ACKNOWLEDGEMENT === */}
          <Card className="mb-4 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-amber-400 mb-4 tracking-wide">
                2.0 &nbsp; SOP ACKNOWLEDGEMENT
              </h2>
              <p className="text-sm text-foreground mb-3">
                Has the employee read and understood the relevant Standard
                Operating Procedure (SOP)?
                {template.sop_reference && (
                  <span className="text-muted-foreground ml-1">
                    ({template.sop_reference})
                  </span>
                )}
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSopAcknowledged(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    sopAcknowledged === true
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-border text-muted-foreground hover:border-green-500/50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setSopAcknowledged(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                    sopAcknowledged === false
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-border text-muted-foreground hover:border-red-500/50"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  NO
                </button>
              </div>
            </CardContent>
          </Card>

          {/* === SECTION 3: KNOWLEDGE ASSESSMENT === */}
          <Card className="mb-4 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-amber-400 mb-4 tracking-wide">
                3.0 &nbsp; KNOWLEDGE ASSESSMENT
              </h2>
              <div className="space-y-3">
                {knowledgeResponses.map((kr, idx) => (
                  <div
                    key={idx}
                    className="border border-border/60 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-foreground">
                        {idx + 1}. {kr.question}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...knowledgeResponses];
                          updated[idx] = { ...kr, competent: !kr.competent };
                          setKnowledgeResponses(updated);
                        }}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          kr.competent
                            ? "border-green-500/50 bg-green-500/10 text-green-400"
                            : "border-red-500/50 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {kr.competent ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {kr.competent ? "Competent" : "Not Yet"}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      placeholder="Employee response..."
                      value={kr.response}
                      onChange={(e) => {
                        const updated = [...knowledgeResponses];
                        updated[idx] = { ...kr, response: e.target.value };
                        setKnowledgeResponses(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* === SECTION 4: PRACTICAL ASSESSMENT === */}
          <Card className="mb-4 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-amber-400 mb-4 tracking-wide">
                4.0 &nbsp; PRACTICAL ASSESSMENT
              </h2>
              <div className="space-y-3">
                {practicalResponses.map((pr, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 border border-border/60 rounded-lg p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground mb-1">
                        {pr.task}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {pr.criteria}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...practicalResponses];
                        updated[idx] = { ...pr, competent: !pr.competent };
                        setPracticalResponses(updated);
                      }}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        pr.competent
                          ? "border-green-500/50 bg-green-500/10 text-green-400"
                          : "border-red-500/50 bg-red-500/10 text-red-400"
                      }`}
                    >
                      {pr.competent ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {pr.competent ? "Competent" : "Not Yet"}
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* === SECTION 5: ASSESSMENT OUTCOME === */}
          <Card className="mb-4 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-amber-400 mb-4 tracking-wide">
                5.0 &nbsp; ASSESSMENT OUTCOME
              </h2>
              <div
                className={`rounded-lg border p-4 mb-4 ${
                  autoOutcome === "Competent"
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-red-500/50 bg-red-500/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {autoOutcome === "Competent" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm font-bold">
                    {autoOutcome === "Competent"
                      ? "COMPETENT"
                      : "NOT YET COMPETENT"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {autoOutcome === "Competent"
                    ? "Employee is deemed competent in the safe operation of this task/equipment."
                    : "Further training required before competency can be confirmed."}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Assessor Comments</Label>
                <textarea
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  placeholder="Optional comments..."
                  value={assessorComments}
                  onChange={(e) => setAssessorComments(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* === SECTION 6: SIGN-OFF === */}
          <Card className="mb-6 border-border/60">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-amber-400 mb-4 tracking-wide">
                6.0 &nbsp; SIGN-OFF
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Assessor: {assessorName || "—"}
                  </p>
                  <SignaturePad
                    label="Assessor Signature"
                    value={assessorSignature}
                    onChange={setAssessorSignature}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Employee:{" "}
                    {selectedEmployee
                      ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                      : "—"}
                  </p>
                  <SignaturePad
                    label="Employee Signature"
                    value={employeeSignature}
                    onChange={setEmployeeSignature}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* === SUBMIT === */}
          <div className="flex items-center justify-between">
            <Link href="/voc">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="gap-2 min-w-[180px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
