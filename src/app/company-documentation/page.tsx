"use client";

import { useState, useEffect } from "react";
import { FileText, Paperclip, Shield, Pencil, Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { TemplateDialog } from "@/components/template-dialog";
import { PolicyDialog } from "@/components/policy-dialog";
import { getDocumentTemplates, addDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate } from "@/lib/store/document-templates";
import { getCompanyPolicies, addCompanyPolicy, updateCompanyPolicy, deleteCompanyPolicy } from "@/lib/store/company-policies";
import { uploadDocumentFile, getDocumentFileUrl, deleteDocumentFile } from "@/lib/store/document-storage";
import { toast } from "sonner";
import type { DocumentTemplate, CompanyPolicy } from "@/lib/types";

export default function CompanyDocumentationPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompanyPolicy | null>(null);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  const loadData = async () => {
    const [loadedTemplates, loadedPolicies] = await Promise.all([
      getDocumentTemplates(),
      getCompanyPolicies(),
    ]);
    setTemplates(loadedTemplates);
    setPolicies(loadedPolicies);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Template handlers ──
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  const handleEditTemplate = (tpl: DocumentTemplate) => {
    setEditingTemplate(tpl);
    setTemplateDialogOpen(true);
  };

  const handleSaveTemplate = async (tpl: DocumentTemplate, file?: File) => {
    let fileUrl = tpl.file_url || "";
    if (file) {
      const result = await uploadDocumentFile(file, tpl.id);
      if (result.path) {
        fileUrl = result.path;
      } else {
        toast.error(result.error || "Failed to upload file");
        return;
      }
    }
    const tplWithFile = { ...tpl, file_url: fileUrl, file_name: file?.name || tpl.file_name };

    if (editingTemplate) {
      const result = await updateDocumentTemplate(tplWithFile);
      if (!result) { toast.error("Failed to update template"); return; }
      toast.success("Template updated");
    } else {
      const result = await addDocumentTemplate(tplWithFile);
      if (!result) { toast.error("Failed to add template"); return; }
      toast.success("Template added");
    }
    await loadData();
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (tpl: DocumentTemplate) => {
    if (!confirm(`Delete "${tpl.name}"? This cannot be undone.`)) return;
    if (tpl.file_url) {
      await deleteDocumentFile(tpl.file_url);
    }
    await deleteDocumentTemplate(tpl.id);
    toast.success("Template deleted");
    await loadData();
  };

  const handleOpenTemplateFile = async (tpl: DocumentTemplate) => {
    if (!tpl.file_url) {
      toast.error("No file attached");
      return;
    }
    const url = await getDocumentFileUrl(tpl.file_url);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Could not load file");
    }
  };

  // ── Policy handlers ──
  const handleAddPolicy = () => {
    setEditingPolicy(null);
    setPolicyDialogOpen(true);
  };

  const handleEditPolicy = (pol: CompanyPolicy) => {
    setEditingPolicy(pol);
    setPolicyDialogOpen(true);
  };

  const handleSavePolicy = async (pol: CompanyPolicy, file?: File) => {
    let fileUrl = pol.file_url || "";
    if (file) {
      const result = await uploadDocumentFile(file, pol.id);
      if (result.path) {
        fileUrl = result.path;
      } else {
        toast.error(result.error || "Failed to upload file");
        return;
      }
    }
    const polWithFile = { ...pol, file_url: fileUrl, file_name: file?.name || pol.file_name };

    if (editingPolicy) {
      const result = await updateCompanyPolicy(polWithFile);
      if (!result) { toast.error("Failed to update policy"); return; }
      toast.success("Policy updated");
    } else {
      const result = await addCompanyPolicy(polWithFile);
      if (!result) { toast.error("Failed to add policy"); return; }
      toast.success("Policy added");
    }
    await loadData();
    setEditingPolicy(null);
  };

  const handleDeletePolicy = async (pol: CompanyPolicy) => {
    if (!confirm(`Delete "${pol.name}"? This cannot be undone.`)) return;
    if (pol.file_url) {
      await deleteDocumentFile(pol.file_url);
    }
    await deleteCompanyPolicy(pol.id);
    toast.success("Policy deleted");
    await loadData();
  };

  const handleOpenPolicyFile = async (pol: CompanyPolicy) => {
    if (!pol.file_url) {
      toast.error("No file attached");
      return;
    }
    const url = await getDocumentFileUrl(pol.file_url);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Could not load file");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-AU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Company Documentation"
        description="Master templates, company policies, and reference documents"
      />

      {/* Document Templates */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              DOCUMENT TEMPLATES
              <span className="text-[10px] font-normal text-muted-foreground tracking-normal normal-case ml-2">
                Master fillable forms (VOC, leave, warning, etc.)
              </span>
            </CardTitle>
            <Button size="sm" onClick={handleAddTemplate} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">File</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-24">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No document templates yet.</p>
                      <p className="text-xs mt-1">Click &ldquo;Add Template&rdquo; to upload a master form.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((tpl) => (
                    <TableRow key={tpl.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{tpl.name}</p>
                        {tpl.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[300px] truncate">{tpl.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-0.5 bg-blue-500/8 text-blue-400 text-[11px] rounded border border-blue-500/15">
                          {tpl.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        {tpl.file_name ? (
                          <button
                            type="button"
                            onClick={() => handleOpenTemplateFile(tpl)}
                            className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 hover:underline transition-colors"
                            title={tpl.file_name}
                          >
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[150px]">{tpl.file_name}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={tpl.active ? "Active" : "Inactive"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditTemplate(tpl)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeleteTemplate(tpl)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Company Policies */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="section-header !border-b-0 !pb-0 !mb-0 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              COMPANY POLICIES
              <span className="text-[10px] font-normal text-muted-foreground tracking-normal normal-case ml-2">
                Safety, HR, and workplace policies
              </span>
            </CardTitle>
            <Button size="sm" onClick={handleAddPolicy} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Add Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Version</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Effective</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Review</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">File</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider w-24">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No company policies yet.</p>
                      <p className="text-xs mt-1">Click &ldquo;Add Policy&rdquo; to create one.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  policies.map((pol) => (
                    <TableRow key={pol.id}>
                      <TableCell>
                        <p className="text-sm font-medium">{pol.name}</p>
                        {pol.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[250px] truncate">{pol.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-0.5 bg-emerald-500/8 text-emerald-400 text-[11px] rounded border border-emerald-500/15">
                          {pol.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">v{pol.version}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(pol.effective_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(pol.review_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {pol.file_name ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPolicyFile(pol)}
                            className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 hover:underline transition-colors"
                            title={pol.file_name}
                          >
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[120px]">{pol.file_name}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={pol.status === "Current" ? "Active" : pol.status === "Under Review" ? "Pending" : "Inactive"} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditPolicy(pol)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleDeletePolicy(pol)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      <PolicyDialog
        open={policyDialogOpen}
        onOpenChange={setPolicyDialogOpen}
        policy={editingPolicy}
        onSave={handleSavePolicy}
      />
    </div>
  );
}
