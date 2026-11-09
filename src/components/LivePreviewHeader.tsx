import React from "react";
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
  ZoomIn,
  ZoomOut,
  FileDown,
  Loader2,
  Share2,
  Mail,
} from "lucide-react";
import {
  LogbookEntry,
  KampusPreset,
  KAMPUS_PRESETS,
} from "@/src/lib/exporters/types";

interface LivePreviewHeaderProps {
  activeFormat: "word" | "pdf" | "excel" | "pptx";
  activePreset: KampusPreset;
  buildMailtoHref: () => string;
  currentEntryIndex: number;
  entries: LogbookEntry[];
  exportingType: "pdf" | "excel" | "word" | "pptx" | null;
  handleCopyFormattedText: () => Promise<void>;
  handleDownloadPdf: () => Promise<void>;
  handleShareEmailClick: () => Promise<void>;
  handleWebShare: () => Promise<void>;
  isAnyExporting: boolean;
  isCopied: boolean;
  isPdfExporting: boolean;
  mentorEmail: string;
  onClose: () => void;
  onExportExcel: () => void;
  onExportWord: () => void;
  setActiveFormat: React.Dispatch<React.SetStateAction<"word" | "pdf" | "excel" | "pptx">>;
  setActivePreset: React.Dispatch<React.SetStateAction<KampusPreset>>;
  setCurrentEntryIndex: React.Dispatch<React.SetStateAction<number>>;
  setMentorEmail: React.Dispatch<React.SetStateAction<string>>;
  setShowEmailInput: React.Dispatch<React.SetStateAction<boolean>>;
  setViewAllEntries: React.Dispatch<React.SetStateAction<boolean>>;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  showEmailInput: boolean;
  viewAllEntries: boolean;
  zoomLevel: number;
  title?: string;
}

export function LivePreviewHeader({ buildMailtoHref, activeFormat, activePreset, currentEntryIndex, entries, exportingType, handleCopyFormattedText, handleDownloadPdf, handleShareEmailClick, handleWebShare, isAnyExporting, isCopied, isPdfExporting, mentorEmail, onClose, onExportExcel, onExportWord, setActiveFormat, setActivePreset, setCurrentEntryIndex, setMentorEmail, setShowEmailInput, setViewAllEntries, setZoomLevel, showEmailInput, viewAllEntries, zoomLevel, title }: LivePreviewHeaderProps) {
  return (
    <>
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
    </>
  );
}
