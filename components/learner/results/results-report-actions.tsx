"use client";

import { useCallback, useRef, useState } from "react";
import { Printer, Share2, X } from "lucide-react";

import { LearnerAssessmentReport } from "@/components/learner/results/learner-assessment-report";
import type { LearnerResultsDashboardView } from "@/types/assessment";

interface ResultsReportActionsProps {
  view: LearnerResultsDashboardView;
}

async function exportReportToPdf(element: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fbf6ef",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const usableWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * usableWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    position = margin - (imgHeight - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  return pdf.output("blob");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ResultsReportActions({ view }: ResultsReportActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const hiddenReportRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    setError(null);
    setPreviewOpen(true);
    window.setTimeout(() => {
      window.print();
    }, 300);
  }, []);

  const handleShare = useCallback(async () => {
    setError(null);
    setBusy(true);

    try {
      const element = hiddenReportRef.current;
      if (!element) {
        throw new Error("Report preview is not ready.");
      }

      const blob = await exportReportToPdf(element);
      const filename = "SugiLearn-Assessment-Report.pdf";
      const file = new File([blob], filename, { type: "application/pdf" });

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "SugiLearn Assessment Report",
          text: "My SugiLearn learner assessment report",
        });
      } else {
        downloadBlob(blob, filename);
      }
    } catch {
      setError("Unable to share the PDF right now. Try Print PDF instead.");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.15)] bg-white px-5 py-3 text-sm font-medium text-sl-ink transition hover:bg-[var(--sl-cream-deep)]"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Print PDF
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[color:rgba(44,36,22,0.15)] bg-white px-5 py-3 text-sm font-medium text-sl-ink transition hover:bg-[var(--sl-cream-deep)] disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {busy ? "Preparing…" : "Share PDF"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div
        className="pointer-events-none fixed -left-[9999px] top-0 w-[720px] print:hidden"
        aria-hidden="true"
      >
        <LearnerAssessmentReport ref={hiddenReportRef} view={view} />
      </div>

      {previewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(7,20,40,0.55)] p-4 print:static print:bg-transparent print:p-0"
          role="dialog"
          aria-modal="true"
          aria-label="PDF report preview"
        >
          <div className="relative my-6 w-full max-w-[760px] print:my-0 print:max-w-none">
            <div className="mb-3 flex items-center justify-between gap-3 print:hidden">
              <p className="text-sm font-medium text-white">PDF Report Preview</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="sl-btn-gold !px-4 !py-2 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  aria-label="Close preview"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <LearnerAssessmentReport ref={reportRef} view={view} />
          </div>
        </div>
      ) : null}
    </>
  );
}
