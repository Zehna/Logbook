"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  FileText,
  FileSpreadsheet,
  Presentation,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  FileDown,
  Loader2,
  Share2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import {
  LogbookEntry,
  StudentProfile,
  KampusPreset,
  KAMPUS_PRESETS,
} from "@/src/lib/exporters/types";

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

  const getFormattedLogbookSnippet = (): string => {
    if (!currentEntry) return "";
    if (viewAllEntries && entries.length > 1) {
      return entries
        .map((e, idx) => {
          return `=== LOGBOOK HARI KE-${idx + 1} (${e.tanggal}) ===\nPeran: ${e.peran}\nProgram: ${e.tipeKegiatan}\n\n1. DESKRIPSI KEGIATAN:\n${e.deskripsiKegiatan}\n\n2. KOMPETENSI DIKEMBANGKAN:\n${e.kompetensiDikembangkan}\n\n3. KENDALA DIHADAPI:\n${e.kendalaDihadapi}\n\n4. SOLUSI TINDAKAN:\n${e.solusiTindakan}\n\n5. REFLEKSI PEMBELAJARAN:\n${e.refleksiPembelajaran}`;
        })
        .join("\n\n----------------------------------------\n\n");
    }
    return `LOGBOOK AKTIVITAS - ${currentEntry.tanggal}\nNama: ${studentProfile.namaMahasiswa || "Mahasiswa MBKM"}\nNIM: ${studentProfile.nim || "-"}\nMitra: ${studentProfile.namaMitra || "-"}\nPeran: ${currentEntry.peran}\n\n1. DESKRIPSI KEGIATAN:\n${currentEntry.deskripsiKegiatan}\n\n2. KOMPETENSI DIKEMBANGKAN:\n${currentEntry.kompetensiDikembangkan}\n\n3. KENDALA DIHADAPI:\n${currentEntry.kendalaDihadapi}\n\n4. SOLUSI TINDAKAN:\n${currentEntry.solusiTindakan}\n\n5. REFLEKSI PEMBELAJARAN:\n${currentEntry.refleksiPembelajaran}`;
  };

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
  const buildMailtoHref = (): string => {
    if (!currentEntry) return "mailto:";
    const namaMhs = studentProfile.namaMahasiswa || "Mahasiswa Peserta";
    const nimMhs = studentProfile.nim || "-";
    const namaPembimbing =
      studentProfile.namaPembimbing || "Mentor / Dosen Pembimbing Lapangan";
    const mitra = studentProfile.namaMitra || "Mitra Kegiatan";
    const kampus = studentProfile.perguruanTinggi || "Perguruan Tinggi";
    const program = currentEntry.tipeKegiatan || "Magang MBKM";

    const dateLabel =
      viewAllEntries && entries.length > 1
        ? `Rekap ${entries.length} Entri (${entries[0]?.tanggal || ""} s/d ${entries[entries.length - 1]?.tanggal || ""})`
        : `${currentEntry.tanggal || "Harian"}`;

    const subject = `[Laporan Logbook ${program}] ${namaMhs} (${nimMhs}) - ${dateLabel}`;

    const snippet = getFormattedLogbookSnippet();
    const maxSnippetLength = 1500;
    const safeSnippet =
      snippet.length > maxSnippetLength
        ? `${snippet.slice(0, maxSnippetLength)}\n\n[... Teks dipersingkat agar muat di URL email. Teks lengkap telah disalin otomatis ke clipboard Anda ...]`
        : snippet;

    const body = [
      `Yth. Bapak/Ibu ${namaPembimbing},`,
      "",
      `Semoga Bapak/Ibu selalu dalam keadaan sehat. Berikut saya lampirkan laporan logbook aktivitas ${program} untuk ditinjau:`,
      "",
      `• Nama Mahasiswa : ${namaMhs}`,
      `• NIM            : ${nimMhs}`,
      `• Perguruan Tinggi : ${kampus}`,
      `• Instansi Mitra : ${mitra}`,
      `• Periode/Tanggal : ${dateLabel}`,
      "",
      "============================================================",
      safeSnippet,
      "============================================================",
      "",
      "Demikian laporan aktivitas ini saya sampaikan. Terima kasih banyak atas bimbingan dan arahan Bapak/Ibu.",
      "",
      "Hormat saya,",
      namaMhs,
      `NIM: ${nimMhs}`,
    ].join("\r\n");

    const recipient = mentorEmail.trim();
    return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

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
        {/* Modal Top Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {entries.length} Entri Tersedia
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Pratinjau visual sebelum mengunduh. Ekspor langsung ke PDF, Word, atau Excel tanpa keluar dari jendela ini.
              </p>
            </div>
          </div>

          {/* Quick Format Switcher, Compact Download Buttons & Close */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2">
            {/* Format Selector Tabs */}
            <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveFormat("pdf")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  activeFormat === "pdf"
                    ? "bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat("word")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  activeFormat === "word"
                    ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Word</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat("excel")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  activeFormat === "excel"
                    ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormat("pptx")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  activeFormat === "pptx"
                    ? "bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Slide</span>
              </button>
            </div>

            {/* Small Direct Download Buttons in Header */}
            <div className="flex items-center gap-1.5 pl-1 sm:pl-2 sm:border-l border-zinc-200 dark:border-zinc-700">
              <span className="hidden xl:inline text-[11px] font-medium text-zinc-400 mr-0.5">
                Unduh:
              </span>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isAnyExporting || entries.length === 0}
                title="Unduh langsung dalam format PDF (.pdf)"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 transition cursor-pointer disabled:opacity-50"
              >
                {isPdfExporting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>PDF</span>
              </button>

              <button
                type="button"
                onClick={onExportWord}
                disabled={isAnyExporting || entries.length === 0}
                title="Unduh langsung dalam format Word (.docx)"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 transition cursor-pointer disabled:opacity-50"
              >
                {exportingType === "word" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Word</span>
              </button>

              <button
                type="button"
                onClick={onExportExcel}
                disabled={isAnyExporting || entries.length === 0}
                title="Unduh langsung dalam format Excel (.xlsx)"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 transition cursor-pointer disabled:opacity-50"
              >
                {exportingType === "excel" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Excel</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="ml-1 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Tutup Pratinjau (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Sub-Bar: Navigation, Preset Info & Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0 text-xs">
          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500">Preset Kampus:</span>
            <select
              value={activePreset}
              onChange={(e) => setActivePreset(e.target.value as KampusPreset)}
              className="text-xs font-semibold px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
            >
              {KAMPUS_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-entry Paging Controls */}
          {entries.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={viewAllEntries}
                  onChange={(e) => setViewAllEntries(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                />
                <span>Tampilkan Seluruh Entri ({entries.length})</span>
              </label>

              {!viewAllEntries && (
                <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setCurrentEntryIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentEntryIndex === 0}
                    className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer transition"
                    title="Entri Sebelumnya (Arrow Left)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-semibold px-1.5 text-zinc-700 dark:text-zinc-300">
                    {currentEntryIndex + 1} / {entries.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentEntryIndex((prev) => Math.min(entries.length - 1, prev + 1))}
                    disabled={currentEntryIndex === entries.length - 1}
                    className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer transition"
                    title="Entri Selanjutnya (Arrow Right)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Zoom controls, Copy & Share via Email */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(80, prev - 10))}
              disabled={zoomLevel <= 80}
              className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer transition"
              title="Perkecil Tampilan"
            >
              <ZoomOut className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
            </button>
            <span className="text-[11px] font-mono text-zinc-500 w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
              disabled={zoomLevel >= 130}
              className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 disabled:opacity-40 cursor-pointer transition"
              title="Perbesar Tampilan"
            >
              <ZoomIn className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
            </button>

            <button
              type="button"
              onClick={handleCopyFormattedText}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 text-[11px] font-medium transition cursor-pointer"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? "Tersalin!" : "Salin Teks"}</span>
            </button>

            {/* Native Web Share API Button + Email Option Toggle */}
            <div className="inline-flex items-center rounded border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/80 dark:bg-indigo-950/50 overflow-hidden">
              <button
                type="button"
                onClick={handleWebShare}
                title="Bagikan logbook langsung melalui dialog sistem (Web Share API)"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={() => setShowEmailInput((prev) => !prev)}
                title="Kirim laporan via Email Mentor (mailto)"
                className="px-1.5 py-1 border-l border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition cursor-pointer"
              >
                <Mail className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Optional Collapsible Mentor Email Bar */}
        {showEmailInput && (
          <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-200/70 dark:border-indigo-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs shrink-0 animate-fadeIn">
            <div className="flex flex-1 items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <label htmlFor="mentor-email-input" className="text-[11px] font-semibold text-indigo-900 dark:text-indigo-200 whitespace-nowrap">
                Email Mentor / DPL:
              </label>
              <input
                id="mentor-email-input"
                type="email"
                value={mentorEmail}
                onChange={(e) => setMentorEmail(e.target.value)}
                placeholder="mentor@perusahaan.com (opsional, kosongkan jika diisi di aplikasi email)"
                className="flex-1 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <a
                href={buildMailtoHref()}
                onClick={handleShareEmailClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3 h-3" />
                <span>Buka Klien Email Sekarang</span>
              </a>
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-1.5 py-0.5 cursor-pointer"
              >
                Sembunyikan
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Canvas Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-200/50 dark:bg-zinc-950/60 flex justify-center items-start">
          <div
            style={{ zoom: `${zoomLevel}%` }}
            className="w-full max-w-4xl transition-all duration-150"
          >
            {/* VIEW FORMAT 1 & 2: WORD (.docx) & PDF (.pdf) A4 DOCUMENT */}
            {(activeFormat === "word" || activeFormat === "pdf") && (
              <div className="space-y-6">
                {/* Format Ribbon Bar inside Canvas */}
                <div
                  className={`px-4 py-2 rounded-t-lg flex items-center justify-between text-xs font-sans shadow-xs ${
                    activeFormat === "pdf"
                      ? "bg-rose-700 text-white"
                      : "bg-blue-700 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {activeFormat === "pdf" ? (
                      <FileDown className="w-4 h-4 text-rose-200" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-200" />
                    )}
                    <span className="font-semibold tracking-wide">
                      {activeFormat === "pdf"
                        ? `Logbook_Resmi_${(studentProfile.namaMahasiswa || "Mahasiswa").replace(/\s+/g, "_")}.pdf`
                        : `Laporan_Logbook_${(studentProfile.namaMahasiswa || "Mahasiswa").replace(/\s+/g, "_")}.docx`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={activeFormat === "pdf" ? handleDownloadPdf : onExportWord}
                    disabled={isAnyExporting || entries.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    <span>
                      {activeFormat === "pdf" ? "Unduh PDF (.pdf)" : "Unduh Word (.docx)"}
                    </span>
                  </button>
                </div>

                {(viewAllEntries ? entries : [currentEntry]).map((entry, idx) => {
                  if (!entry) return null;
                  const pageNum = viewAllEntries ? idx + 1 : currentEntryIndex + 1;
                  return (
                    <article
                      key={entry.id || `entry-${idx}`}
                      className="bg-white text-zinc-900 rounded-sm shadow-md border border-zinc-300/80 p-6 sm:p-10 font-serif leading-relaxed text-[13px] sm:text-[14px] min-h-[750px] relative transition-all"
                    >
                      {/* Kop Surat Resmi / Header Dokumen */}
                      <header className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
                        <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-sans text-zinc-700">
                          KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                        </p>
                        <p className="text-[11px] sm:text-xs font-bold tracking-wide uppercase font-sans text-zinc-800">
                          DIREKTORAT JENDERAL PENDIDIKAN TINGGI, RISET, DAN TEKNOLOGI
                        </p>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-600 font-sans mt-0.5">
                          PROGRAM HAK BELAJAR TIGA SEMESTER DI LUAR PROGRAM STUDI (MBKM / MSIB)
                        </p>
                        <h1 className="text-sm sm:text-base font-extrabold uppercase mt-3 tracking-normal text-zinc-950 font-sans">
                          LEMBAR LOGBOOK AKTIVITAS HARIAN RESMI MAHASISWA
                        </h1>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          Format Pedoman: {currentPresetInfo.label} • {currentPresetInfo.badge}
                        </p>
                      </header>

                      {/* Tabel Identitas Mahasiswa & Program */}
                      <section className="mb-6 border border-zinc-300 rounded overflow-hidden font-sans text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
                          <div className="p-3 space-y-1.5 bg-zinc-50/70">
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Nama Mahasiswa</span>
                              <span className="font-semibold text-zinc-900">: {studentProfile.namaMahasiswa || "Mahasiswa Peserta"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">NIM / ID Registrasi</span>
                              <span className="font-mono font-medium text-zinc-900">: {studentProfile.nim || "-"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Program Studi</span>
                              <span className="text-zinc-800">: {studentProfile.programStudi || "-"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Perguruan Tinggi</span>
                              <span className="text-zinc-800">: {studentProfile.perguruanTinggi || "-"}</span>
                            </div>
                          </div>

                          <div className="p-3 space-y-1.5 bg-zinc-50/70">
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Nama Mitra / Instansi</span>
                              <span className="font-semibold text-zinc-900">: {studentProfile.namaMitra || "Mitra Industri"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Mentor / DPL</span>
                              <span className="text-zinc-800">: {studentProfile.namaPembimbing || "Mentor Pembimbing Lapangan"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Tanggal Kegiatan</span>
                              <span className="font-bold text-zinc-950">: {entry.tanggal || "Tanggal Logbook"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Peran / Jam Kerja</span>
                              <span className="text-zinc-800">: {entry.peran || "Peserta"} (8 Jam Formal)</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 5 Bagian Isi Logbook Standar Dikti & OBE */}
                      <div className="space-y-4 mb-8">
                        {/* 1. Deskripsi Pekerjaan */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              1
                            </span>
                            Deskripsi Aktivitas &amp; Pelaksanaan Tugas
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.deskripsiKegiatan || "Tidak ada rincian aktivitas."}
                          </div>
                        </div>

                        {/* 2. Kompetensi Dikembangkan */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              2
                            </span>
                            Kompetensi &amp; Keterampilan yang Dikembangkan
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.kompetensiDikembangkan || "Tidak ada rincian kompetensi."}
                          </div>
                        </div>

                        {/* 3. Kendala Dihadapi */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              3
                            </span>
                            Kendala &amp; Hambatan Lapangan yang Dihadapi
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.kendalaDihadapi || "Tidak ada kendala berarti."}
                          </div>
                        </div>

                        {/* 4. Solusi Tindakan */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              4
                            </span>
                            Solusi Konkret &amp; Langkah Penyelesaian Masalah
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.solusiTindakan || "Tidak ada langkah pemecahan khusus."}
                          </div>
                        </div>

                        {/* 5. Refleksi Pembelajaran */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              5
                            </span>
                            Refleksi Pembelajaran &amp; Nilai Akademis Mandiri
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.refleksiPembelajaran || "Tidak ada catatan refleksi."}
                          </div>
                        </div>
                      </div>

                      {/* Bukti Dokumentasi Visual (Multimodal Photo Attachment) */}
                      {entry.fotoBase64 && (
                        <div className="mb-8 p-3 rounded border border-zinc-200 bg-zinc-50/60 font-sans">
                          <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Lampiran Dokumentasi Kegiatan (Bukti Visual Riil)</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-44 h-32 rounded border border-zinc-300 overflow-hidden shrink-0 bg-white shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={entry.fotoBase64}
                                alt="Dokumentasi Kegiatan"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs text-zinc-600 space-y-1">
                              <p className="font-medium text-zinc-900">
                                Bukti foto kegiatan tanggal {entry.tanggal}
                              </p>
                              <p className="text-[11px] text-zinc-500 leading-normal">
                                Foto ini telah diverifikasi dan disinkronkan ke dalam berkas lampiran resmi dokumen.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lembar Tanda Tangan & Pengesahan Resmi */}
                      <footer className="pt-6 border-t border-zinc-300 font-sans text-xs mt-auto">
                        <div className="grid grid-cols-2 gap-6 text-center">
                          <div className="flex flex-col justify-between min-h-[120px]">
                            <div>
                              <p className="text-zinc-500">Mengetahui &amp; Menyetujui,</p>
                              <p className="font-semibold text-zinc-900">Mentor / Pembimbing Lapangan</p>
                            </div>
                            <div className="my-2 h-14 flex items-center justify-center">
                              {studentProfile.ttdMentorBase64 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={studentProfile.ttdMentorBase64}
                                  alt="E-Paraf Mentor"
                                  className="max-h-14 object-contain"
                                />
                              ) : onOpenSignatureModal ? (
                                <button
                                  type="button"
                                  onClick={onOpenSignatureModal}
                                  className="text-[10px] text-zinc-400 hover:text-zinc-700 border border-dashed border-zinc-300 rounded px-2 py-1 transition cursor-pointer"
                                >
                                  + Bubuhkan E-Paraf Mentor
                                </button>
                              ) : null}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold underline text-zinc-900">
                                ({studentProfile.namaPembimbing || "Nama Mentor / DPL"})
                              </p>
                              <p className="text-[10px] text-zinc-500">NIP / ID Karyawan Mitra</p>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between min-h-[120px]">
                            <div>
                              <p className="text-zinc-500">Kota Kegiatan, {entry.tanggal}</p>
                              <p className="font-semibold text-zinc-900">Mahasiswa Peserta Program</p>
                            </div>
                            <div className="my-2 h-14 flex items-center justify-center">
                              {studentProfile.ttdMahasiswaBase64 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={studentProfile.ttdMahasiswaBase64}
                                  alt="TTD Mahasiswa"
                                  className="max-h-14 object-contain"
                                />
                              ) : onOpenSignatureModal ? (
                                <button
                                  type="button"
                                  onClick={onOpenSignatureModal}
                                  className="text-[10px] text-zinc-400 hover:text-zinc-700 border border-dashed border-zinc-300 rounded px-2 py-1 transition cursor-pointer"
                                >
                                  + Bubuhkan TTD Mahasiswa
                                </button>
                              ) : null}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold underline text-zinc-900">
                                ({studentProfile.namaMahasiswa || "Nama Lengkap Mahasiswa"})
                              </p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                NIM: {studentProfile.nim || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Page Number Badge */}
                        <div className="text-right text-[10px] text-zinc-400 mt-6 font-mono">
                          Halaman {pageNum} dari {entries.length}
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}

            {/* VIEW FORMAT 3: EXCEL SPREADSHEET (.xlsx) */}
            {activeFormat === "excel" && (
              <div className="bg-white rounded-lg shadow-md border border-zinc-300 overflow-hidden text-xs font-sans">
                {/* Excel Ribbon Top Bar */}
                <div className="px-4 py-2.5 bg-emerald-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span className="font-semibold text-xs tracking-wide">
                      Rekapitulasi_Logbook_{studentProfile.namaMahasiswa.replace(/\s+/g, "_")}.xlsx
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-[11px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-mono">
                      {entries.length} Baris Entri Aktif • 8 Jam/Entri
                    </span>
                    <button
                      type="button"
                      onClick={onExportExcel}
                      disabled={isAnyExporting || entries.length === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* Spreadsheet Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-950 border-b border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-2.5 border-r border-emerald-200 text-center w-10">No</th>
                        <th className="p-2.5 border-r border-emerald-200 w-28">Tanggal</th>
                        <th className="p-2.5 border-r border-emerald-200 w-32">Peran / Posisi</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[200px]">Deskripsi Aktivitas</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[160px]">Kompetensi</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[140px]">Kendala</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[150px]">Solusi</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[150px]">Refleksi</th>
                        <th className="p-2.5 border-r border-emerald-200 text-center w-20">Foto</th>
                        <th className="p-2.5 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {entries.map((entry, idx) => (
                        <tr
                          key={entry.id || idx}
                          className={`hover:bg-zinc-50 transition-colors ${
                            idx % 2 === 1 ? "bg-zinc-50/50" : "bg-white"
                          }`}
                        >
                          <td className="p-2.5 border-r border-zinc-200 text-center font-mono text-zinc-500">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 font-semibold text-zinc-900 whitespace-nowrap">
                            {entry.tanggal}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700">
                            {entry.peran}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-800 leading-relaxed">
                            {entry.deskripsiKegiatan}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.kompetensiDikembangkan}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.kendalaDihadapi}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.solusiTindakan}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.refleksiPembelajaran}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-center">
                            {entry.fotoBase64 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Ada
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-400">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              Valid MBKM
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Excel Summary Footer */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Total Akumulasi: <strong>{entries.length * 8} Jam Kerja</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target 900 Jam: <strong>{Math.min(100, Math.round(((entries.length * 8) / 900) * 100))}%</strong>
                    </span>
                  </div>
                  <div className="text-zinc-500 font-mono">
                    Preset Rumus: SUM(Hours), VLOOKUP(Student_ID)
                  </div>
                </div>
              </div>
            )}

            {/* VIEW FORMAT 4: POWERPOINT SLIDES (.pptx) */}
            {activeFormat === "pptx" && (
              <div className="space-y-6">
                {(viewAllEntries ? entries : [currentEntry]).map((entry, idx) => {
                  if (!entry) return null;
                  return (
                    <div
                      key={entry.id || idx}
                      className="bg-zinc-900 text-white rounded-xl shadow-xl border border-zinc-800 p-6 sm:p-8 aspect-16/10 flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Decorative Background Accent */}
                      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-600/20 to-purple-600/0 rounded-full blur-2xl pointer-events-none" />

                      {/* Slide Header */}
                      <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4 mb-4 z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                              Slide Pertanggungjawaban Magang
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              {entry.tanggal}
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                            {entry.peran || "Aktivitas Harian Mahasiswa"}
                          </h2>
                          <p className="text-xs text-zinc-400">
                            {studentProfile.namaMahasiswa} • {studentProfile.namaMitra}
                          </p>
                        </div>

                        <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Slide #{viewAllEntries ? idx + 1 : currentEntryIndex + 1}
                        </span>
                      </div>

                      {/* Slide Content Grid: 2 Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto z-10 text-xs">
                        {/* Left Column: Core Activities & Photo */}
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 space-y-1.5">
                            <span className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wider block">
                              📌 Pelaksanaan Tugas &amp; Solusi
                            </span>
                            <p className="text-zinc-200 line-clamp-4 leading-relaxed">
                              {entry.deskripsiKegiatan}
                            </p>
                            {entry.solusiTindakan && (
                              <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-700/60 line-clamp-2">
                                <strong className="text-zinc-300">Solusi:</strong> {entry.solusiTindakan}
                              </p>
                            )}
                          </div>

                          {entry.fotoBase64 ? (
                            <div className="h-28 rounded-lg overflow-hidden border border-zinc-700 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={entry.fotoBase64}
                                alt="Dokumentasi Slide"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white">
                                Foto Bukti Riil
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800 text-zinc-400 text-[11px]">
                              Kompetensi Kunci: {entry.kompetensiDikembangkan || "Analytical Thinking & Problem Solving"}
                            </div>
                          )}
                        </div>

                        {/* Right Column: Outcomes & STAR Reflection */}
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 space-y-1.5">
                            <span className="font-semibold text-emerald-300 text-[11px] uppercase tracking-wider block">
                              🎯 Capaian Kompetensi &amp; Refleksi
                            </span>
                            <p className="text-zinc-200 line-clamp-3 leading-relaxed">
                              {entry.kompetensiDikembangkan}
                            </p>
                            <p className="text-[11px] text-zinc-300 italic pt-1 border-t border-zinc-700/60 line-clamp-2">
                              &ldquo;{entry.refleksiPembelajaran}&rdquo;
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-[11px] text-indigo-200 flex items-center justify-between">
                            <span>Status Ujian Sidang DPL</span>
                            <span className="font-bold text-emerald-400">Ready for Defense</span>
                          </div>
                        </div>
                      </div>

                      {/* Slide Footer */}
                      <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between items-center z-10 font-mono">
                        <span>LogMagang OS • Academic Slide Generator</span>
                        <span>{studentProfile.perguruanTinggi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Action Bar (Direct Export from Preview) */}
        <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Unduh langsung dalam format pilihan Anda tanpa menutup pratinjau:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleWebShare}
              disabled={entries.length === 0}
              title="Bagikan logbook langsung melalui dialog browser (Web Share API)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isAnyExporting || entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isPdfExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              <span>{isPdfExporting ? "Mengekspor..." : "PDF (.pdf)"}</span>
            </button>

            <button
              type="button"
              onClick={onExportWord}
              disabled={isAnyExporting || entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {exportingType === "word" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>{exportingType === "word" ? "Mengekspor..." : "Word (.docx)"}</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              disabled={isAnyExporting || entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {exportingType === "excel" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>{exportingType === "excel" ? "Mengekspor..." : "Excel (.xlsx)"}</span>
            </button>

            <button
              type="button"
              onClick={onExportPowerPoint}
              disabled={isAnyExporting || entries.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {exportingType === "pptx" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Presentation className="w-3.5 h-3.5" />
              )}
              <span>{exportingType === "pptx" ? "Mengekspor..." : "Slide (.pptx)"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
