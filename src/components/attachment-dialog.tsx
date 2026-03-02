"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  X,
  ScanLine,
  Camera,
  RotateCcw,
  Check,
  Loader2,
  Sun,
  Contrast,
} from "lucide-react";
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
import type { Document, DocumentCategory } from "@/lib/types";

interface AttachmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTitle: string;
  category: DocumentCategory;
  relatedEntityId: string;
  relatedEntityType: string;
  tags: string[];
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
const MAX_SCAN_DIM = 1600; // Resize images to this max dimension before processing

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Image Utilities ─────────────────────────────────────

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/** Resize image to fit within maxDim, preserving aspect ratio */
function resizeToCanvas(img: HTMLImageElement, maxDim: number): HTMLCanvasElement {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxDim || h > maxDim) {
    const scale = maxDim / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

/** Apply scan-like enhancement: grayscale + brightness + contrast */
function applyScanEnhancement(
  sourceCanvas: HTMLCanvasElement,
  brightness: number,
  contrast: number,
  bw: boolean
): string {
  const { width, height } = sourceCanvas;
  const ctx = sourceCanvas.getContext("2d");
  if (!ctx) return sourceCanvas.toDataURL("image/jpeg", 0.92);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Contrast formula: factor = (259*(C+255)) / (255*(259-C))
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Convert to grayscale first if B&W mode
    if (bw) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = g = b = gray;
    }

    // Apply brightness
    r += brightness;
    g += brightness;
    b += brightness;

    // Apply contrast
    r = cFactor * (r - 128) + 128;
    g = cFactor * (g - 128) + 128;
    b = cFactor * (b - 128) + 128;

    // Clamp
    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }

  // Write to a fresh canvas and return dataURL
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  out.getContext("2d")!.putImageData(imageData, 0, 0);
  return out.toDataURL("image/jpeg", 0.92);
}

function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

// ─── Component ───────────────────────────────────────────

type ScanStep = "pick" | "scanning" | "preview";

export function AttachmentDialog({
  open,
  onOpenChange,
  defaultTitle,
  category,
  relatedEntityId,
  relatedEntityType,
  tags,
  onSave,
}: AttachmentDialogProps) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Scanner state
  const [scanStep, setScanStep] = useState<ScanStep>("pick");
  const [scanMessage, setScanMessage] = useState("");
  // Store the resized canvas (source for re-processing when sliders change)
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalDataUrlRef = useRef<string>("");
  const [previewDataUrl, setPreviewDataUrl] = useState("");
  const [brightness, setBrightness] = useState(30);
  const [contrast, setContrast] = useState(50);
  const [grayscale, setGrayscale] = useState(true);

  // Reset everything when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(defaultTitle);
      setNotes("");
      setSelectedFile(null);
      setFileError(null);
      setIsDragOver(false);
      setScanStep("pick");
      setScanMessage("");
      sourceCanvasRef.current = null;
      originalDataUrlRef.current = "";
      setPreviewDataUrl("");
      setBrightness(30);
      setContrast(50);
      setGrayscale(true);
    }
  }, [open, defaultTitle]);

  // Re-process when enhancement sliders change
  useEffect(() => {
    if (scanStep !== "preview" || !sourceCanvasRef.current) return;
    const dataUrl = applyScanEnhancement(
      sourceCanvasRef.current,
      brightness,
      contrast,
      grayscale
    );
    setPreviewDataUrl(dataUrl);
  }, [scanStep, brightness, contrast, grayscale]);

  // ── File handling (non-scan) ──

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type) && file.type !== "") {
      setFileError("Unsupported file type. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File too large (${formatFileSize(file.size)}). Maximum size is 10 MB.`);
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
  const removeFile = () => { setSelectedFile(null); setFileError(null); };

  // ── Scanner flow ──

  const handleScanCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (scanInputRef.current) scanInputRef.current.value = "";
    if (!file) return;

    setScanStep("scanning");
    setScanMessage("Loading image...");

    try {
      // 1. Load image
      const img = await loadImageFromFile(file);

      // 2. Resize for mobile performance (max 1600px)
      const resized = resizeToCanvas(img, MAX_SCAN_DIM);

      // 3. Store original (un-enhanced) preview
      originalDataUrlRef.current = resized.toDataURL("image/jpeg", 0.92);

      // 4. Try Scanic edge detection + perspective correction
      setScanMessage("Detecting document edges...");
      let scanCanvas: HTMLCanvasElement | null = null;

      try {
        const { scanDocument } = await import("scanic");
        const result = await scanDocument(resized, {
          mode: "extract",
          output: "canvas",
        });
        if (result.success && result.output instanceof HTMLCanvasElement) {
          scanCanvas = result.output;
          setScanMessage("Document detected & corrected!");
        } else {
          setScanMessage("Enhancing image...");
        }
      } catch {
        setScanMessage("Enhancing image...");
      }

      // 5. Use scanic result or fall back to resized original
      const sourceCanvas = scanCanvas || resized;
      sourceCanvasRef.current = sourceCanvas;

      // 6. Apply initial enhancement and show preview
      const dataUrl = applyScanEnhancement(sourceCanvas, 30, 50, true);
      setPreviewDataUrl(dataUrl);
      setScanStep("preview");
    } catch (err) {
      console.error("Scan processing failed:", err);
      setFileError("Failed to process the image. Please try again.");
      setScanStep("pick");
    }
  };

  const handleAcceptScan = () => {
    if (!previewDataUrl) return;
    const file = dataURLtoFile(previewDataUrl, `scan_${Date.now()}.jpg`);
    setSelectedFile(file);
    sourceCanvasRef.current = null;
    originalDataUrlRef.current = "";
    setPreviewDataUrl("");
    setScanStep("pick");
  };

  const handleRetake = () => {
    sourceCanvasRef.current = null;
    originalDataUrlRef.current = "";
    setPreviewDataUrl("");
    setScanStep("pick");
    setTimeout(() => scanInputRef.current?.click(), 150);
  };

  // ── Submit ──

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc: Document = {
      id: generateId(),
      title,
      document_number: "",
      version: "1.0",
      category,
      description: "",
      content: "",
      file_name: selectedFile?.name || "",
      file_url: "",
      upload_date: new Date().toISOString().split("T")[0],
      review_date: "",
      status: "Current",
      tags,
      related_entity_id: relatedEntityId,
      related_entity_type: relatedEntityType,
      created_by: "",
      notes,
    };
    onSave(doc, selectedFile || undefined);
    onOpenChange(false);
  };

  // ═══════════════════════════════════════════════════════
  // RENDER: Scanning (loading)
  // ═══════════════════════════════════════════════════════

  if (scanStep === "scanning") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-sm font-medium">{scanMessage || "Processing..."}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: Preview scanned image
  // ═══════════════════════════════════════════════════════

  if (scanStep === "preview") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-amber-500" />
              Scanned Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Preview image */}
            <div className="relative rounded-lg overflow-hidden border border-border bg-black/20">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Scanned preview"
                  className="w-full h-auto max-h-[50vh] object-contain bg-white"
                />
              ) : (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Enhancement Controls */}
            <div className="space-y-3 px-1">
              <div className="flex items-center gap-3">
                <Sun className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-16 shrink-0">Bright</span>
                <input
                  type="range"
                  min={-50}
                  max={100}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-amber-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <Contrast className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-16 shrink-0">Contrast</span>
                <input
                  type="range"
                  min={-30}
                  max={120}
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-amber-500"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                  className="rounded border-border accent-amber-500"
                />
                <span className="text-xs">Black & White</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1 gap-2" onClick={handleRetake}>
                <RotateCcw className="w-3.5 h-3.5" />
                Retake
              </Button>
              <Button type="button" className="flex-1 gap-2" onClick={handleAcceptScan}>
                <Check className="w-3.5 h-3.5" />
                Accept Scan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ═══════════════════════════════════════════════════════
  // RENDER: File picker (default)
  // ═══════════════════════════════════════════════════════

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Attachment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="attachment-title">Title</Label>
            <Input
              id="attachment-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Attachment title"
            />
          </div>

          <div className="space-y-2">
            <Label>File</Label>

            {/* Action buttons */}
            {!selectedFile && !fileError && (
              <div className="space-y-2 mb-2">
                {/* Primary: Scan Document */}
                <Button
                  type="button"
                  variant="default"
                  size="lg"
                  className="w-full gap-2 h-12 text-sm font-semibold"
                  onClick={() => scanInputRef.current?.click()}
                >
                  <ScanLine className="w-5 h-5" />
                  Scan Document
                </Button>

                {/* Secondary row: Photo + Browse */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.capture = "environment";
                      input.onchange = (evt) => {
                        const f = (evt.target as HTMLInputElement).files?.[0];
                        if (f) validateAndSetFile(f);
                      };
                      input.click();
                    }}
                  >
                    <Camera className="w-4 h-4" />
                    Photo Only
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </Button>
                </div>
              </div>
            )}

            {/* Hidden inputs */}
            <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPTED_EXTENSIONS} onChange={handleFileSelect} />
            <input ref={scanInputRef} type="file" className="hidden" accept="image/*" capture="environment" onChange={handleScanCapture} />

            {/* Drag & drop / file preview */}
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedFile && !fileError && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg text-center transition-colors",
                selectedFile || fileError ? "p-4" : "p-3 cursor-pointer",
                isDragOver && "border-amber-500 bg-amber-500/10",
                !isDragOver && !selectedFile && !fileError && "border-border hover:border-muted-foreground",
                selectedFile && "border-emerald-500/50 bg-emerald-500/5",
                fileError && "border-destructive bg-destructive/5 cursor-pointer"
              )}
            >
              {fileError ? (
                <div className="flex flex-col items-center gap-2" onClick={() => fileInputRef.current?.click()}>
                  <X className="w-8 h-8 text-destructive" />
                  <p className="text-sm text-destructive">{fileError}</p>
                  <p className="text-xs text-muted-foreground">Click to try again</p>
                </div>
              ) : selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  {selectedFile.type.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <FileText className="w-8 h-8 text-emerald-500 shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs text-muted-foreground">or drag & drop a file here</p>
                  <p className="text-[10px] text-muted-foreground/60">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT — max 10 MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment-notes">Notes (optional)</Label>
            <textarea
              id="attachment-notes"
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Upload</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
