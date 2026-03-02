"use client";

import { Fragment, useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  Download,
  Eye,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { DocumentDialog } from "@/components/document-dialog";
import { getDocuments, addDocument, updateDocument } from "@/lib/store/documents";
import { getEmployees } from "@/lib/store/employees";
import {
  uploadDocumentFile,
  getDocumentFileUrl,
} from "@/lib/store/document-storage";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type {
  Document,
  DocumentCategory,
  DocumentStatus,
  Employee,
} from "@/lib/types";

const CATEGORIES: (DocumentCategory | "All")[] = [
  "All",
  "SOP",
  "SWMS",
  "Risk Assessment",
  "Policy",
  "Form",
  "Certificate",
  "Licence",
  "SDS",
];

function getStatusStyle(status: DocumentStatus): string {
  switch (status) {
    case "Current":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "Under Review":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "Superseded":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "Archived":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const loadData = async () => {
    const [docs, emps] = await Promise.all([getDocuments(), getEmployees()]);
    setDocuments(docs);
    setEmployees(emps);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.first_name} ${emp.last_name}` : id || "—";
  };

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory =
        activeTab === "All" || doc.category === activeTab;
      const q = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        doc.title.toLowerCase().includes(q) ||
        (doc.document_number || "").toLowerCase().includes(q) ||
        (doc.content || "").toLowerCase().includes(q) ||
        (doc.description || "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [documents, search, activeTab]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAdd = () => {
    setEditingDocument(null);
    setDialogOpen(true);
  };

  const handleEdit = (doc: Document) => {
    setEditingDocument(doc);
    setDialogOpen(true);
  };

  const handleSave = async (doc: Document, file?: File) => {
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

    const docWithFile = { ...doc, file_url: fileUrl };

    if (editingDocument) {
      await updateDocument(docWithFile);
      toast.success("Document updated");
    } else {
      await addDocument(docWithFile);
      toast.success("Document added");
    }

    await loadData();
    setEditingDocument(null);
  };

  const handleDownload = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    if (!doc.file_url) {
      toast.error("No file attached to this document");
      return;
    }
    const url = await getDocumentFileUrl(doc.file_url);
    if (url) {
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc.file_name || "document";
      a.click();
    } else {
      toast.error("Failed to generate download link");
    }
  };

  const handleView = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    if (!doc.file_url) {
      toast.error("No file attached to this document");
      return;
    }
    const url = await getDocumentFileUrl(doc.file_url);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Failed to generate view link");
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto pt-12 lg:pt-0">
      <PageHeader
        title="Company Documents"
        description="Company policies, procedures, SWMS, risk assessments, SDS, and forms"
      >
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Document
        </Button>
      </PageHeader>

      {/* Search Bar */}
      <Card className="mb-6 border-border/60">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, document number, or content..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:border-amber-500/30"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Shared content for all tabs */}
        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <Card className="border-border/60">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-8"></TableHead>
                        <TableHead className="text-xs">
                          Document Number
                        </TableHead>
                        <TableHead className="text-xs">Title</TableHead>
                        <TableHead className="text-xs">Category</TableHead>
                        <TableHead className="text-xs">Version</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Upload Date</TableHead>
                        <TableHead className="text-xs">Review Date</TableHead>
                        <TableHead className="text-xs text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="w-8 h-8 text-muted-foreground/40" />
                              <span className="text-sm">
                                No documents found
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map((doc) => (
                          <Fragment key={doc.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => toggleExpand(doc.id)}
                            >
                              <TableCell className="w-8 px-3">
                                {expandedId === doc.id ? (
                                  <ChevronDown className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell className="text-sm font-mono text-muted-foreground">
                                {doc.document_number}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {doc.title}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {doc.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                v{doc.version}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs border ${getStatusStyle(doc.status)}`}
                                >
                                  {doc.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(doc.upload_date)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(doc.review_date)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div
                                  className="flex items-center justify-end gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {doc.file_url && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={(e) => handleView(e, doc)}
                                        title="View file"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={(e) => handleDownload(e, doc)}
                                        title="Download file"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(doc);
                                    }}
                                    title="Edit document"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            {expandedId === doc.id && (
                              <TableRow key={`${doc.id}-expanded`}>
                                <TableCell colSpan={9} className="p-0">
                                  <div className="bg-[#1a1d27] border-t border-b border-amber-500/20 p-6">
                                    <div className="section-header">
                                      DOCUMENT CONTENT
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                      <div>
                                        <span className="text-xs text-muted-foreground">
                                          File Name
                                        </span>
                                        <p className="text-sm font-mono">
                                          {doc.file_name || "—"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-muted-foreground">
                                          Created By
                                        </span>
                                        <p className="text-sm">
                                          {getEmployeeName(doc.created_by)}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-xs text-muted-foreground">
                                          Tags
                                        </span>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                          {(doc.tags || []).length > 0 ? (
                                            doc.tags.map((tag) => (
                                              <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {tag}
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-sm text-muted-foreground">
                                              —
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {doc.file_url && (
                                      <div className="mb-4 flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="gap-2"
                                          onClick={(e) => handleView(e, doc)}
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                          View File
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="gap-2"
                                          onClick={(e) =>
                                            handleDownload(e, doc)
                                          }
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                          Download
                                        </Button>
                                      </div>
                                    )}
                                    {doc.description && (
                                      <div className="mb-4">
                                        <span className="text-xs text-muted-foreground">
                                          Description
                                        </span>
                                        <p className="text-sm mt-0.5">
                                          {doc.description}
                                        </p>
                                      </div>
                                    )}
                                    {doc.content && (
                                      <div>
                                        <span className="text-xs text-muted-foreground">
                                          Content
                                        </span>
                                        <div className="mt-1 p-4 rounded-lg bg-[#0f1117] border border-border/40 text-sm font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-96 overflow-y-auto">
                                          {doc.content}
                                        </div>
                                      </div>
                                    )}
                                    {doc.notes && (
                                      <div className="mt-4">
                                        <span className="text-xs text-muted-foreground">
                                          Notes
                                        </span>
                                        <p className="text-sm mt-0.5 text-muted-foreground">
                                          {doc.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <DocumentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        document={editingDocument}
        onSave={handleSave}
      />
    </div>
  );
}
