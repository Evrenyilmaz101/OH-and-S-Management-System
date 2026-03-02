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
  const pw = 210; // page width
  const margin = 15;
  const cw = pw - margin * 2; // content width
  let y = 15;

  const darkGray = "#333333";
  const medGray = "#666666";
  const lightGray = "#e5e5e5";
  const headerBg = "#1a1a2e";

  // Helper: draw a filled rect with text
  function sectionHeader(text: string) {
    doc.setFillColor(headerBg);
    doc.rect(margin, y, cw, 8, "F");
    doc.setTextColor("#ffffff");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin + 3, y + 5.5);
    y += 8;
    doc.setTextColor(darkGray);
  }

  function tableHeader(cols: { text: string; x: number; w: number }[]) {
    doc.setFillColor("#f0f0f0");
    doc.rect(margin, y, cw, 7, "F");
    doc.setDrawColor(lightGray);
    doc.rect(margin, y, cw, 7, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkGray);
    cols.forEach((col) => {
      doc.text(col.text, col.x, y + 5);
    });
    y += 7;
  }

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = 15;
    }
  }

  // === DOCUMENT HEADER ===
  doc.setFillColor(headerBg);
  doc.rect(0, 0, pw, 28, "F");
  doc.setTextColor("#ffffff");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("VERIFICATION OF COMPETENCY", pw / 2, 12, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.taskName}`, pw / 2, 18, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor("#aaaaaa");
  doc.text(`Document: ${data.documentNumber}`, pw / 2, 24, { align: "center" });
  y = 33;

  // === 1.0 PARTICIPANT DETAILS ===
  sectionHeader("1.0  PARTICIPANT DETAILS");
  const fieldRows = [
    ["Employee Name:", data.employeeName, "Position:", data.employeePosition],
    ["Assessor Name:", data.assessorName, "Date:", data.assessmentDate],
  ];
  fieldRows.forEach((row) => {
    doc.setDrawColor(lightGray);
    doc.rect(margin, y, cw, 8, "S");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(medGray);
    doc.text(row[0], margin + 3, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray);
    doc.text(row[1], margin + 38, y + 5.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(medGray);
    doc.text(row[2], margin + cw / 2 + 3, y + 5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray);
    doc.text(row[3], margin + cw / 2 + 38, y + 5.5);
    y += 8;
  });
  y += 4;

  // === 2.0 SOP ACKNOWLEDGEMENT ===
  checkPage(25);
  sectionHeader("2.0  SOP ACKNOWLEDGEMENT");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  doc.text(
    "Has the employee read and understood the relevant Standard Operating Procedure (SOP)?",
    margin + 3,
    y + 5
  );
  // Checkboxes
  const yesX = margin + cw - 40;
  const noX = margin + cw - 20;
  doc.setDrawColor(medGray);
  doc.rect(yesX, y + 1.5, 4, 4, "S");
  doc.rect(noX, y + 1.5, 4, 4, "S");
  if (data.sopAcknowledged) {
    doc.setFillColor("#22c55e");
    doc.rect(yesX + 0.5, y + 2, 3, 3, "F");
  } else {
    doc.setFillColor("#ef4444");
    doc.rect(noX + 0.5, y + 2, 3, 3, "F");
  }
  doc.setFontSize(7);
  doc.text("YES", yesX + 6, y + 5);
  doc.text("NO", noX + 6, y + 5);
  y += 12;

  // === 3.0 KNOWLEDGE ASSESSMENT ===
  checkPage(20 + data.knowledgeResponses.length * 18);
  sectionHeader("3.0  KNOWLEDGE ASSESSMENT");
  tableHeader([
    { text: "Question", x: margin + 3, w: 70 },
    { text: "Response", x: margin + 73, w: 70 },
    { text: "Result", x: margin + cw - 22, w: 20 },
  ]);

  data.knowledgeResponses.forEach((kr) => {
    // Wrap question text
    doc.setFontSize(7);
    const qLines = doc.splitTextToSize(kr.question, 65);
    const rLines = doc.splitTextToSize(kr.response || "—", 65);
    const rowH = Math.max(qLines.length, rLines.length) * 3.5 + 4;
    checkPage(rowH);

    doc.setDrawColor(lightGray);
    doc.rect(margin, y, cw, rowH, "S");
    // Vertical dividers
    doc.line(margin + 70, y, margin + 70, y + rowH);
    doc.line(margin + cw - 25, y, margin + cw - 25, y + rowH);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray);
    doc.text(qLines, margin + 3, y + 4);
    doc.text(rLines, margin + 73, y + 4);

    // Competent badge
    doc.setFontSize(6);
    if (kr.competent) {
      doc.setTextColor("#16a34a");
      doc.text("COMPETENT", margin + cw - 22, y + rowH / 2 + 1);
    } else {
      doc.setTextColor("#dc2626");
      doc.text("NOT YET", margin + cw - 22, y + rowH / 2 + 1);
    }
    doc.setTextColor(darkGray);
    y += rowH;
  });
  y += 4;

  // === 4.0 PRACTICAL ASSESSMENT ===
  checkPage(20);
  sectionHeader("4.0  PRACTICAL ASSESSMENT");
  tableHeader([
    { text: "Task", x: margin + 3, w: 35 },
    { text: "Criteria", x: margin + 38, w: 95 },
    { text: "Result", x: margin + cw - 22, w: 20 },
  ]);

  data.practicalResponses.forEach((pr) => {
    doc.setFontSize(7);
    const tLines = doc.splitTextToSize(pr.task, 32);
    const cLines = doc.splitTextToSize(pr.criteria, 90);
    const rowH = Math.max(tLines.length, cLines.length) * 3.5 + 4;
    checkPage(rowH);

    doc.setDrawColor(lightGray);
    doc.rect(margin, y, cw, rowH, "S");
    doc.line(margin + 35, y, margin + 35, y + rowH);
    doc.line(margin + cw - 25, y, margin + cw - 25, y + rowH);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkGray);
    doc.text(tLines, margin + 3, y + 4);
    doc.setFont("helvetica", "normal");
    doc.text(cLines, margin + 38, y + 4);

    doc.setFontSize(6);
    if (pr.competent) {
      doc.setTextColor("#16a34a");
      doc.text("COMPETENT", margin + cw - 22, y + rowH / 2 + 1);
    } else {
      doc.setTextColor("#dc2626");
      doc.text("NOT YET", margin + cw - 22, y + rowH / 2 + 1);
    }
    doc.setTextColor(darkGray);
    y += rowH;
  });
  y += 4;

  // === 5.0 ASSESSMENT OUTCOME ===
  checkPage(35);
  sectionHeader("5.0  ASSESSMENT OUTCOME");
  doc.setDrawColor(lightGray);
  doc.rect(margin, y, cw, 10, "S");

  const isCompetent = data.overallOutcome === "Competent";
  // Competent checkbox
  doc.setDrawColor(medGray);
  doc.rect(margin + 5, y + 3, 4, 4, "S");
  if (isCompetent) {
    doc.setFillColor("#22c55e");
    doc.rect(margin + 5.5, y + 3.5, 3, 3, "F");
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkGray);
  doc.text("Competent", margin + 12, y + 7);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(medGray);
  doc.text("Employee is deemed competent in the safe operation of this task/equipment.", margin + 12, y + 10);

  // Not Yet Competent checkbox
  doc.setDrawColor(medGray);
  doc.rect(margin + cw / 2 + 5, y + 3, 4, 4, "S");
  if (!isCompetent) {
    doc.setFillColor("#ef4444");
    doc.rect(margin + cw / 2 + 5.5, y + 3.5, 3, 3, "F");
  }
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkGray);
  doc.text("Not Yet Competent", margin + cw / 2 + 12, y + 7);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(medGray);
  doc.text("Further training required before competency can be confirmed.", margin + cw / 2 + 12, y + 10);
  y += 12;

  // Assessor Comments
  if (data.assessorComments) {
    doc.setDrawColor(lightGray);
    doc.rect(margin, y, cw, 14, "S");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(medGray);
    doc.text("Assessor Comments:", margin + 3, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(darkGray);
    const commentLines = doc.splitTextToSize(data.assessorComments, cw - 10);
    doc.text(commentLines, margin + 3, y + 8);
    y += 16;
  }
  y += 2;

  // === 6.0 SIGN-OFF ===
  checkPage(50);
  sectionHeader("6.0  SIGN-OFF");

  const sigW = cw / 2 - 5;
  const sigH = 28;

  // Assessor sign-off
  doc.setDrawColor(lightGray);
  doc.rect(margin, y, sigW, sigH, "S");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(medGray);
  doc.text("Assessor", margin + 3, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  doc.text(`Name: ${data.assessorName}`, margin + 3, y + 9);
  doc.text(`Date: ${data.assessmentDate}`, margin + 3, y + 13);
  if (data.assessorSignature) {
    try {
      doc.addImage(data.assessorSignature, "PNG", margin + 3, y + 15, 40, 11);
    } catch { /* signature image failed */ }
  }

  // Employee sign-off
  doc.rect(margin + sigW + 10, y, sigW, sigH, "S");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(medGray);
  doc.text("Employee", margin + sigW + 13, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkGray);
  doc.text(`Name: ${data.employeeName}`, margin + sigW + 13, y + 9);
  doc.text(`Date: ${data.assessmentDate}`, margin + sigW + 13, y + 13);
  if (data.employeeSignature) {
    try {
      doc.addImage(data.employeeSignature, "PNG", margin + sigW + 13, y + 15, 40, 11);
    } catch { /* signature image failed */ }
  }
  y += sigH + 6;

  // Footer
  doc.setFontSize(6);
  doc.setTextColor("#999999");
  doc.text(
    "Generated by Thornton Engineering OH&S Management System",
    pw / 2,
    290,
    { align: "center" }
  );
  doc.text(
    `${data.documentNumber}  |  ${data.assessmentDate}`,
    pw / 2,
    294,
    { align: "center" }
  );

  return doc.output("blob");
}
