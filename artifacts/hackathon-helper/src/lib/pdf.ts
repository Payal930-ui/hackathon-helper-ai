import type { GeneratedResults, OutputKey } from "./types";
import { TAB_LABELS } from "./types";
import { formatContent, slugify } from "./utils";

interface PDFProject {
  title: string;
  description: string;
  selectedOutputs: OutputKey[];
  generatedResults: GeneratedResults;
}

export async function exportProjectPDF(project: PDFProject): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235);
  doc.text(project.title, margin, y);
  y += 12;

  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  const descLines = doc.splitTextToSize(project.description, maxWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 5 + 10;

  for (const key of project.selectedOutputs) {
    const content = formatContent(project.generatedResults[key]);
    if (!content) continue;

    addPageIfNeeded(20);
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(TAB_LABELS[key], margin, y);
    y += 8;

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(content, maxWidth);

    for (const line of lines) {
      addPageIfNeeded(6);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 8;
  }

  doc.save(`${slugify(project.title)}_Plan.pdf`);
}
