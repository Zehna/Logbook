"use client";

import React, { useState, useEffect, useMemo } from "react";

import { toast } from "sonner";
import {
  LogbookEntry,
  StudentProfile,
  KampusPreset,
  KAMPUS_PRESETS,
} from "@/src/lib/exporters/types";
import {
  buildMailtoHref as buildMailtoHrefLib,
  getFormattedLogbookSnippet as getFormattedLogbookSnippetLib,
} from "@/src/lib/utils/livePreviewText";
import { LivePreviewHeader } from "./LivePreviewHeader";
import { LivePreviewWordPdfSection } from "./LivePreviewWordPdfSection";
import { LivePreviewExcelSection } from "./LivePreviewExcelSection";
import { LivePreviewPptxSection } from "./LivePreviewPptxSection";
import { LivePreviewBottomBar } from "./LivePreviewBottomBar";

export interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LogbookEntry[];
  studentProfile: StudentProfile;
  selectedPreset?: KampusPreset;
  onExportPdf?: () => void;
  onExportWord: () => void;
  onExportExcel: () => void;
  onExportPowerPoint: () => void;
  exportingType?: "pdf" | "excel" | "word" | "pptx" | null;
  title?: string;
  onOpenSignatureModal?: () => void;
}

type PreviewFormat = "word" | "pdf" | "excel" | "pptx";

export function LivePreviewModal({
  isOpen,
  onClose,
  entries,
  studentProfile,
  selectedPreset = "dikti",
  onExportPdf,
  onExportWord,
  onExportExcel,
  onExportPowerPoint,
  exportingType = null,
  title = "Live Preview Dokumen Resmi",
  onOpenSignatureModal,
}: LivePreviewModalProps) {
  const [activeFormat, setActiveFormat] = useState<PreviewFormat>("word");
  const [activePreset, setActivePreset] = useState<KampusPreset>(selectedPreset);
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number>(0);
  const [viewAllEntries, setViewAllEntries] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isInternalPdfExporting, setIsInternalPdfExporting] = useState<boolean>(false);
  const [mentorEmail, setMentorEmail] = useState<string>("");
  const [showEmailInput, setShowEmailInput] = useState<boolean>(false);

  // Sync preset if prop changes
  useEffect(() => {
    setActivePreset(selectedPreset);
  }, [selectedPreset]);

  // Reset index when entries change or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentEntryIndex(0);
      setIsCopied(false);
    }
  }, [isOpen, entries.length]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && !viewAllEntries) {
        setCurrentEntryIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" && !viewAllEntries) {
        setCurrentEntryIndex((prev) => Math.min(entries.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, entries.length, viewAllEntries, onClose]);

  const currentEntry = entries[currentEntryIndex] || entries[0] || null;

  const currentPresetInfo = useMemo(() => {
    return KAMPUS_PRESETS.find((p) => p.value === activePreset) || KAMPUS_PRESETS[0];
  }, [activePreset]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (entries.length === 0) return;
    if (onExportPdf) {
      onExportPdf();
      return;
    }
    setIsInternalPdfExporting(true);
    try {
      const { exportLogbookToPdf } = await import("@/src/lib/exporters/exportPdf");
      await exportLogbookToPdf(entries, studentProfile, activePreset);
      toast.success(
        `Berhasil mengunduh Dokumen PDF (.pdf) berisi ${entries.length} entri logbook!`
      );
    } catch (err) {
      console.error("Gagal mengekspor PDF:", err);
      toast.error("Gagal mengekspor file PDF (.pdf).");
    } finally {
      setIsInternalPdfExporting(false);
    }
  };

  const isAnyExporting = exportingType !== null || isInternalPdfExporting;
  const isPdfExporting = exportingType === "pdf" || isInternalPdfExporting;

  // Teks terformat & mailto (logika di src/lib/utils/livePreviewText.ts)
  const getFormattedLogbookSnippet = (): string =>
    getFormattedLogbookSnippetLib(
      entries,
      currentEntry,
      viewAllEntries,
      studentProfile
    );

  const handleCopyFormattedText = async () => {
    const textToCopy = getFormattedLogbookSnippet();
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast.success(
        viewAllEntries
          ? `Seluruh ${entries.length} entri logbook disalin ke clipboard!`
          : `Logbook tanggal ${currentEntry?.tanggal} berhasil disalin!`
      );
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Gagal menyalin ke clipboard.");
    }
  };

  // Build mailto URL for Share button
  const buildMailtoHref = (): string =>
    buildMailtoHrefLib({
      entries,
      currentEntry,
      viewAllEntries,
      studentProfile,
      mentorEmail,
    });

  const handleShareEmailClick = async () => {
    const fullSnippet = getFormattedLogbookSnippet();
    if (fullSnippet) {
      try {
        await navigator.clipboard.writeText(fullSnippet);
      } catch {
        // Ignore clipboard fallback error
      }
    }
    toast.success(
      "Membuka aplikasi email default dengan subjek & isi logbook siap kirim ke Mentor!",
      {
        description:
          "Salinan teks lengkap juga telah disalin otomatis ke clipboard Anda.",
      }
    );
  };

  // Trigger native browser share dialog via Web Share API (navigator.share)
  const handleWebShare = async () => {
    if (!currentEntry) return;

    const namaMhs = studentProfile.namaMahasiswa || "Mahasiswa Peserta";
    const nimMhs = studentProfile.nim || "-";
    const program = currentEntry.tipeKegiatan || "Magang MBKM";
    const dateLabel =
      viewAllEntries && entries.length > 1
        ? `Rekap ${entries.length} Entri (${entries[0]?.tanggal || ""} s/d ${entries[entries.length - 1]?.tanggal || ""})`
        : `${currentEntry.tanggal || "Harian"}`;

    const shareTitle = `[Laporan Logbook ${program}] ${namaMhs} (${nimMhs}) - ${dateLabel}`;
    const shareText = getFormattedLogbookSnippet();

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
        });
        toast.success("Berhasil membagikan logbook melalui dialog sistem!");
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        // If blocked by iframe permissions or desktop browser limitations, fall back gracefully
      }
    }

    // Fallback: salin ke clipboard & tampilkan panel email
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Ignore clipboard error
    }
    setShowEmailInput(true);
    toast.info(
      "Teks logbook disalin ke clipboard! Gunakan opsi Email di bawah jika browser tidak mendukung dialog Web Share.",
      {
        description: `Judul: ${shareTitle}`,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
        <LivePreviewHeader buildMailtoHref={buildMailtoHref} activeFormat={activeFormat} activePreset={activePreset} currentEntryIndex={currentEntryIndex} entries={entries} exportingType={exportingType} handleCopyFormattedText={handleCopyFormattedText} handleDownloadPdf={handleDownloadPdf} handleShareEmailClick={handleShareEmailClick} handleWebShare={handleWebShare} isAnyExporting={isAnyExporting} isCopied={isCopied} isPdfExporting={isPdfExporting} mentorEmail={mentorEmail} onClose={onClose} onExportExcel={onExportExcel} onExportWord={onExportWord} setActiveFormat={setActiveFormat} setActivePreset={setActivePreset} setCurrentEntryIndex={setCurrentEntryIndex} setMentorEmail={setMentorEmail} setShowEmailInput={setShowEmailInput} setViewAllEntries={setViewAllEntries} setZoomLevel={setZoomLevel} showEmailInput={showEmailInput} title={title} viewAllEntries={viewAllEntries} zoomLevel={zoomLevel} />

        {/* Modal Scrollable Canvas Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-200/50 dark:bg-zinc-950/60 flex justify-center items-start">
          <div
            style={{ zoom: `${zoomLevel}%` }}
            className="w-full max-w-4xl transition-all duration-150"
          >
            {/* VIEW FORMAT 1 & 2: WORD (.docx) & PDF (.pdf) A4 DOCUMENT */}
            {(activeFormat === "word" || activeFormat === "pdf") && <LivePreviewWordPdfSection activeFormat={activeFormat} currentEntry={currentEntry} currentEntryIndex={currentEntryIndex} currentPresetInfo={currentPresetInfo} entries={entries} handleDownloadPdf={handleDownloadPdf} isAnyExporting={isAnyExporting} onExportWord={onExportWord} onOpenSignatureModal={onOpenSignatureModal} studentProfile={studentProfile} viewAllEntries={viewAllEntries} />}

            {/* VIEW FORMAT 3: EXCEL SPREADSHEET (.xlsx) */}
            {activeFormat === "excel" && <LivePreviewExcelSection entries={entries} isAnyExporting={isAnyExporting} onExportExcel={onExportExcel} studentProfile={studentProfile} />}

            {/* VIEW FORMAT 4: POWERPOINT SLIDES (.pptx) */}
            {activeFormat === "pptx" && <LivePreviewPptxSection currentEntry={currentEntry} currentEntryIndex={currentEntryIndex} entries={entries} studentProfile={studentProfile} viewAllEntries={viewAllEntries} />}
          </div>
        </div>

        <LivePreviewBottomBar entries={entries} exportingType={exportingType} handleDownloadPdf={handleDownloadPdf} handleWebShare={handleWebShare} isAnyExporting={isAnyExporting} isPdfExporting={isPdfExporting} onClose={onClose} onExportExcel={onExportExcel} onExportPowerPoint={onExportPowerPoint} onExportWord={onExportWord} />
      </div>
    </div>
  );
}
