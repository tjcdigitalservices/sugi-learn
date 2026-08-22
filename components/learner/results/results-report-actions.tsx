"use client";

import { useCallback, useRef, useState } from "react";
import { Printer, Share2 } from "lucide-react";

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

  // Keep the live report hidden. Only the html2canvas clone is made visible
  // for rendering — that avoids a brief on-screen "preview" flash.
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#fbf6ef",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (_document, clonedElement) => {
      clonedElement.style.opacity = "1";
      clonedElement.style.position = "static";
      clonedElement.style.left = "auto";
      clonedElement.style.top = "auto";
      clonedElement.style.pointerEvents = "none";
      clonedElement.style.zIndex = "auto";

      const wrapper = clonedElement.parentElement;
      if (wrapper) {
        wrapper.style.opacity = "1";
        wrapper.style.position = "static";
        wrapper.style.left = "auto";
        wrapper.style.top = "auto";
        wrapper.style.zIndex = "auto";
        wrapper.style.width = "720px";
      }
    },
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
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Keep the blob URL briefly so the download can start before revocation.
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function ResultsReportActions({ view }: ResultsReportActionsProps) {
  const [busy, setBusy] = useState<"print" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const buildPdf = useCallback(async () => {
    const element = reportRef.current;
    if (!element) {
      throw new Error("Report preview is not ready.");
    }
    return exportReportToPdf(element);
  }, []);

  const handlePrint = useCallback(async () => {
    setError(null);
    setBusy("print");

    try {
      const blob = await buildPdf();
      downloadBlob(blob, "Sugidanon-Assessment-Report.pdf");
    } catch (cause) {
      console.error("Print PDF failed:", cause);
      setError("Unable to create the PDF. Please try again.");
    } finally {
      setBusy(null);
    }
  }, [buildPdf]);

  const handleShare = useCallback(async () => {
    setError(null);
    setBusy("share");

    try {
      const blob = await buildPdf();
      const filename = "Sugidanon-Assessment-Report.pdf";
      const file = new File([blob], filename, { type: "application/pdf" });

      if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "Sugidanon Assessment Report",
            text: "My Sugidanon learner assessment report",
          });
          return;
        } catch (shareError) {
          // User cancelled the share sheet — not an app error.
          if (
            shareError instanceof DOMException &&
            (shareError.name === "AbortError" || shareError.name === "NotAllowedError")
          ) {
            return;
          }
        }
      }

      // Desktop browsers usually cannot share files — download instead.
      downloadBlob(blob, filename);
    } catch (cause) {
      console.error("Share PDF failed:", cause);
      setError("Unable to share the PDF right now. Try Print PDF instead.");
    } finally {
      setBusy(null);
    }
  }, [buildPdf]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handlePrint}
          disabled={busy !== null}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sl-navy/25 bg-white px-5 py-3 text-sm font-medium text-sl-navy transition hover:bg-[var(--sl-cream-deep)] disabled:opacity-60"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {busy === "print" ? "Preparing PDF…" : "Print PDF"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={busy !== null}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-sl-navy/25 bg-white px-5 py-3 text-sm font-medium text-sl-navy transition hover:bg-[var(--sl-cream-deep)] disabled:opacity-60"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {busy === "share" ? "Preparing…" : "Share PDF"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {/* Capture source — always hidden; clone is revealed only inside html2canvas */}
      <div
        className="pointer-events-none fixed left-0 top-0 -z-10 w-[720px] opacity-0"
        aria-hidden="true"
      >
        <LearnerAssessmentReport ref={reportRef} view={view} />
      </div>
    </>
  );
}
