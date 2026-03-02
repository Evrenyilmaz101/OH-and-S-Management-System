"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, FileText, Shield, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getDocumentTemplates } from "@/lib/store/document-templates";
import { getCompanyPolicies } from "@/lib/store/company-policies";
import { getDocumentFileUrl } from "@/lib/store/document-storage";
import { toast } from "sonner";
import type { DocumentTemplate, CompanyPolicy } from "@/lib/types";

type DocItem = {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: "Template" | "Policy";
  file_name?: string;
  file_url?: string;
};

export default function CompanyDocumentationPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [policies, setPolicies] = useState<CompanyPolicy[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([getDocumentTemplates(), getCompanyPolicies()]).then(
      ([t, p]) => { setTemplates(t); setPolicies(p); }
    );
  }, []);

  const items: DocItem[] = useMemo(() => {
    const all: DocItem[] = [
      ...templates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        type: "Template" as const,
        file_name: t.file_name,
        file_url: t.file_url,
      })),
      ...policies.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        type: "Policy" as const,
        file_name: p.file_name,
        file_url: p.file_url,
      })),
    ];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  }, [templates, policies, search]);

  const handleOpen = async (item: DocItem) => {
    if (!item.file_url) {
      toast.error("No file attached to this document");
      return;
    }
    const url = await getDocumentFileUrl(item.file_url);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Could not load file");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Company Documents"
        description="Search and view templates, policies, and reference documents"
      />

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <FileText className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm">
            {search ? "No documents match your search." : "No documents uploaded yet."}
          </p>
          {!search && (
            <p className="text-xs">Go to Data Hub to add templates and policies.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`border-border/60 transition-colors ${
                item.file_url ? "cursor-pointer hover:border-amber-500/40" : ""
              }`}
              onClick={() => item.file_url && handleOpen(item)}
            >
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className="shrink-0">
                  {item.type === "Template" ? (
                    <FileText className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {item.description && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex px-2 py-0.5 text-[11px] rounded border ${
                      item.type === "Template"
                        ? "bg-blue-500/8 text-blue-400 border-blue-500/15"
                        : "bg-emerald-500/8 text-emerald-400 border-emerald-500/15"
                    }`}
                  >
                    {item.category}
                  </span>
                  {item.file_name && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate max-w-[120px] hidden sm:inline">
                        {item.file_name}
                      </span>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
