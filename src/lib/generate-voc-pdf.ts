import jsPDF from "jspdf";

interface AssessmentData {
  employeeName: string;
  employeePosition: string;
  assessorName: string;
  assessmentDate: string;
  taskName: string;
  documentNumber: string;
  sopAcknowledged: boolean;
  knowledgeResponses: { question: string; response: string; competent: boolean }[];
  practicalResponses: { task: string; criteria: string; competent: boolean }[];
  overallOutcome: string;
  assessorComments: string;
  assessorSignature: string;
  employeeSignature: string;
}

export function generateVOCPdf(data: AssessmentData): Blob {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = 210;
  const margin = 15;
  const cw = pw - margin * 2;
  let y = 0;

  const black = "#000000";
  const borderColor = "#000000";
  const lightFill = "#f2f2f2";
  const lineW = 0.3;

  doc.setDrawColor(borderColor);
  doc.setLineWidth(lineW);

  // ── Helpers ──

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = 15;
    }
  }

  function drawCell(x: number, yPos: number, w: number, h: number, text: string, opts?: {
    bold?: boolean; fontSize?: number; fill?: string; align?: "left" | "center"; valign?: "top" | "middle";
  }) {
    const fs = opts?.fontSize || 8;
    const bold = opts?.bold || false;
    const fill = opts?.fill;
    const align = opts?.align || "left";
    const valign = opts?.valign || "middle";

    if (fill) {
      doc.setFillColor(fill);
      doc.rect(x, yPos, w, h, "FD");
    } else {
      doc.rect(x, yPos, w, h, "S");
    }

    doc.setFontSize(fs);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(black);

    const textX = align === "center" ? x + w / 2 : x + 2;
    const textY = valign === "top" ? yPos + fs * 0.4 + 1 : yPos + h / 2 + fs * 0.15;
    const maxW = w - 4;

    if (maxW > 0) {
      const lines = doc.splitTextToSize(text, maxW);
      if (valign === "top") {
        doc.text(lines, textX, textY, { align, maxWidth: maxW });
      } else {
        doc.text(lines, textX, textY, { align, maxWidth: maxW });
      }
    }
  }

  function tick(x: number, yPos: number, h: number) {
    const cx = x + 2;
    const cy = yPos + h / 2;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#000000");
    doc.text("\u2713", cx, cy + 1.5);
  }

  function cross(x: number, yPos: number, h: number) {
    const cx = x + 2;
    const cy = yPos + h / 2;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#000000");
    doc.text("\u2717", cx, cy + 1.5);
  }

  // ── COMPANY HEADER ──
  // Top border bar
  doc.setFillColor("#000000");
  doc.rect(margin, margin, cw, 1.5, "F");
  y = margin + 1.5;

  // Company name row
  const headerH = 12;
  doc.rect(margin, y, cw, headerH, "S");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(black);
  doc.text("THORNTON ENGINEERING", pw / 2, y + headerH / 2 + 2, { align: "center" });
  y += headerH;

  // Document title row
  const titleH = 10;
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, titleH, "FD");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("VERIFICATION OF COMPETENCY (VOC)", pw / 2, y + titleH / 2 + 1.5, { align: "center" });
  y += titleH;

  // Document info row
  const infoH = 7;
  const col1W = cw * 0.5;
  const col2W = cw * 0.25;
  const col3W = cw * 0.25;
  drawCell(margin, y, col1W, infoH, `Equipment/Task: ${data.taskName}`, { bold: true, fontSize: 8 });
  drawCell(margin + col1W, y, col2W, infoH, `Doc: ${data.documentNumber}`, { fontSize: 7 });
  drawCell(margin + col1W + col2W, y, col3W, infoH, `Date: ${data.assessmentDate}`, { fontSize: 7 });
  y += infoH;

  // Bottom border bar
  doc.setFillColor("#000000");
  doc.rect(margin, y, cw, 0.8, "F");
  y += 3;

  // ── 1.0 PARTICIPANT DETAILS ──
  const s1H = 7;
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, s1H, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("1.0  PARTICIPANT DETAILS", margin + 3, y + s1H / 2 + 1.5);
  y += s1H;

  const rowH = 8;
  const halfW = cw / 2;
  const labelW = 32;
  const valW = halfW - labelW;

  // Row: Employee Name | Position
  drawCell(margin, y, labelW, rowH, "Employee Name:", { bold: true, fontSize: 7.5, fill: lightFill });
  drawCell(margin + labelW, y, valW, rowH, data.employeeName, { fontSize: 8 });
  drawCell(margin + halfW, y, labelW, rowH, "Position:", { bold: true, fontSize: 7.5, fill: lightFill });
  drawCell(margin + halfW + labelW, y, valW, rowH, data.employeePosition, { fontSize: 8 });
  y += rowH;

  // Row: Trainer/Assessor Name | Date
  drawCell(margin, y, labelW, rowH, "Assessor Name:", { bold: true, fontSize: 7.5, fill: lightFill });
  drawCell(margin + labelW, y, valW, rowH, data.assessorName, { fontSize: 8 });
  drawCell(margin + halfW, y, labelW, rowH, "Date:", { bold: true, fontSize: 7.5, fill: lightFill });
  drawCell(margin + halfW + labelW, y, valW, rowH, data.assessmentDate, { fontSize: 8 });
  y += rowH + 3;

  // ── 2.0 SOP ACKNOWLEDGEMENT ──
  checkPage(22);
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, s1H, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("2.0  SOP ACKNOWLEDGEMENT", margin + 3, y + s1H / 2 + 1.5);
  y += s1H;

  const sopRowH = 9;
  const sopTextW = cw - 30;
  drawCell(margin, y, sopTextW, sopRowH, "Has the employee read and understood the relevant Standard Operating Procedure (SOP)?", { fontSize: 7.5, valign: "middle" });

  // YES box
  const yesBoxX = margin + sopTextW;
  doc.rect(yesBoxX, y, 15, sopRowH, "S");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("YES", yesBoxX + 3, y + 4);
  if (data.sopAcknowledged) {
    doc.rect(yesBoxX + 3, y + 5, 3.5, 3.5, "S");
    doc.setFillColor("#000000");
    doc.rect(yesBoxX + 3.5, y + 5.5, 2.5, 2.5, "F");
  } else {
    doc.rect(yesBoxX + 3, y + 5, 3.5, 3.5, "S");
  }

  // NO box
  const noBoxX = margin + sopTextW + 15;
  doc.rect(noBoxX, y, 15, sopRowH, "S");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("NO", noBoxX + 3, y + 4);
  if (!data.sopAcknowledged) {
    doc.rect(noBoxX + 3, y + 5, 3.5, 3.5, "S");
    doc.setFillColor("#000000");
    doc.rect(noBoxX + 3.5, y + 5.5, 2.5, 2.5, "F");
  } else {
    doc.rect(noBoxX + 3, y + 5, 3.5, 3.5, "S");
  }
  y += sopRowH + 3;

  // ── 3.0 KNOWLEDGE ASSESSMENT ──
  checkPage(20);
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, s1H, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("3.0  KNOWLEDGE ASSESSMENT", margin + 3, y + s1H / 2 + 1.5);
  y += s1H;

  // Table header
  const kqCol = 60;
  const krCol = 75;
  const kcCol = cw - kqCol - krCol;
  const thH = 6;

  doc.setFillColor(lightFill);
  doc.rect(margin, y, kqCol, thH, "FD");
  doc.rect(margin + kqCol, y, krCol, thH, "FD");
  doc.rect(margin + kqCol + krCol, y, kcCol, thH, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Question", margin + 3, y + 4);
  doc.text("Response", margin + kqCol + 3, y + 4);
  doc.text("Competent", margin + kqCol + krCol + 2, y + 4);
  y += thH;

  data.knowledgeResponses.forEach((kr) => {
    doc.setFontSize(7);
    const qLines = doc.splitTextToSize(kr.question, kqCol - 4);
    const rLines = doc.splitTextToSize(kr.response || "", krCol - 4);
    const rH = Math.max(qLines.length, rLines.length, 1) * 3.2 + 3;
    checkPage(rH);

    doc.rect(margin, y, kqCol, rH, "S");
    doc.rect(margin + kqCol, y, krCol, rH, "S");
    doc.rect(margin + kqCol + krCol, y, kcCol, rH, "S");

    doc.setFont("helvetica", "normal");
    doc.text(qLines, margin + 2, y + 3.5);
    doc.text(rLines, margin + kqCol + 2, y + 3.5);

    // Tick or cross
    if (kr.competent) {
      tick(margin + kqCol + krCol + 4, y, rH);
    } else {
      cross(margin + kqCol + krCol + 4, y, rH);
    }

    y += rH;
  });
  y += 3;

  // ── 4.0 PRACTICAL ASSESSMENT ──
  checkPage(20);
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, s1H, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("4.0  PRACTICAL ASSESSMENT", margin + 3, y + s1H / 2 + 1.5);
  y += s1H;

  // Table header
  const ptCol = 35;
  const pcCol = cw - ptCol - kcCol;

  doc.setFillColor(lightFill);
  doc.rect(margin, y, ptCol, thH, "FD");
  doc.rect(margin + ptCol, y, pcCol, thH, "FD");
  doc.rect(margin + ptCol + pcCol, y, kcCol, thH, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Task", margin + 3, y + 4);
  doc.text("Criteria", margin + ptCol + 3, y + 4);
  doc.text("Competent", margin + ptCol + pcCol + 2, y + 4);
  y += thH;

  data.practicalResponses.forEach((pr) => {
    doc.setFontSize(7);
    const tLines = doc.splitTextToSize(pr.task, ptCol - 4);
    const cLines = doc.splitTextToSize(pr.criteria, pcCol - 4);
    const rH = Math.max(tLines.length, cLines.length, 1) * 3.2 + 3;
    checkPage(rH);

    doc.rect(margin, y, ptCol, rH, "S");
    doc.rect(margin + ptCol, y, pcCol, rH, "S");
    doc.rect(margin + ptCol + pcCol, y, kcCol, rH, "S");

    doc.setFont("helvetica", "bold");
    doc.text(tLines, margin + 2, y + 3.5);
    doc.setFont("helvetica", "normal");
    doc.text(cLines, margin + ptCol + 2, y + 3.5);

    if (pr.competent) {
      tick(margin + ptCol + pcCol + 4, y, rH);
    } else {
      cross(margin + ptCol + pcCol + 4, y, rH);
    }

    y += rH;
  });
  y += 3;

  // ── 5.0 ASSESSMENT OUTCOME ──
  checkPage(30);
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, s1H, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("5.0  ASSESSMENT OUTCOME", margin + 3, y + s1H / 2 + 1.5);
  y += s1H;

  const isCompetent = data.overallOutcome === "Competent";
  const outcomeH = 11;

  // Competent row
  doc.rect(margin, y, cw, outcomeH, "S");
  // Checkbox
  doc.rect(margin + 5, y + 2, 4, 4, "S");
  if (isCompetent) {
    doc.setFillColor("#000000");
    doc.rect(margin + 5.5, y + 2.5, 3, 3, "F");
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Competent", margin + 12, y + 5.5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("- Employee is deemed competent in the safe operation of this task/equipment.", margin + 12, y + 9.5);
  y += outcomeH;

  // Not Yet Competent row
  doc.rect(margin, y, cw, outcomeH, "S");
  doc.rect(margin + 5, y + 2, 4, 4, "S");
  if (!isCompetent) {
    doc.setFillColor("#000000");
    doc.rect(margin + 5.5, y + 2.5, 3, 3, "F");
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Not Yet Competent", margin + 12, y + 5.5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("- Further training required before competency can be confirmed.", margin + 12, y + 9.5);
  y += outcomeH;

  // Assessor Comments
  const commH = 14;
  doc.rect(margin, y, cw, commH, "S");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Assessor Comments:", margin + 3, y + 4);
  doc.setFont("helvetica", "normal");
  if (data.assessorComments) {
    const commentLines = doc.splitTextToSize(data.assessorComments, cw - 8);
    doc.text(commentLines, margin + 3, y + 8);
  }
  y += commH + 3;

  // ── 6.0 SIGN-OFF ──
  checkPage(45);
  doc.setFillColor(lightFill);
  doc.rect(margin, y, cw, s1H, "FD");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("6.0  SIGN-OFF", margin + 3, y + s1H / 2 + 1.5);
  y += s1H;

  // Sign-off table header
  const nameColW = 55;
  const sigColW = 70;
  const dateColW = cw - nameColW - sigColW;

  doc.setFillColor(lightFill);
  doc.rect(margin, y, nameColW, thH, "FD");
  doc.rect(margin + nameColW, y, sigColW, thH, "FD");
  doc.rect(margin + nameColW + sigColW, y, dateColW, thH, "FD");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Name", margin + 3, y + 4);
  doc.text("Signature", margin + nameColW + 3, y + 4);
  doc.text("Date", margin + nameColW + sigColW + 3, y + 4);
  y += thH;

  // Assessor row
  const sigRowH = 18;
  doc.rect(margin, y, nameColW, sigRowH, "S");
  doc.rect(margin + nameColW, y, sigColW, sigRowH, "S");
  doc.rect(margin + nameColW + sigColW, y, dateColW, sigRowH, "S");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Assessor:", margin + 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(data.assessorName, margin + 2, y + 10);

  if (data.assessorSignature) {
    try {
      doc.addImage(data.assessorSignature, "PNG", margin + nameColW + 3, y + 2, 40, 14);
    } catch { /* sig failed */ }
  }

  doc.text(data.assessmentDate, margin + nameColW + sigColW + 3, y + 10);
  y += sigRowH;

  // Employee row
  doc.rect(margin, y, nameColW, sigRowH, "S");
  doc.rect(margin + nameColW, y, sigColW, sigRowH, "S");
  doc.rect(margin + nameColW + sigColW, y, dateColW, sigRowH, "S");

  doc.setFont("helvetica", "bold");
  doc.text("Employee:", margin + 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(data.employeeName, margin + 2, y + 10);

  if (data.employeeSignature) {
    try {
      doc.addImage(data.employeeSignature, "PNG", margin + nameColW + 3, y + 2, 40, 14);
    } catch { /* sig failed */ }
  }

  doc.text(data.assessmentDate, margin + nameColW + sigColW + 3, y + 10);
  y += sigRowH;

  // Bottom border
  doc.setFillColor("#000000");
  doc.rect(margin, y, cw, 0.8, "F");

  // Footer
  doc.setFontSize(6);
  doc.setTextColor("#888888");
  doc.text(
    `Thornton Engineering  |  ${data.documentNumber}  |  Verification of Competency  |  ${data.assessmentDate}`,
    pw / 2,
    292,
    { align: "center" }
  );

  return doc.output("blob");
}
