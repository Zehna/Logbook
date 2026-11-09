import React from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  CheckCircle2,
  FileDown,
  Loader2,
  Share2,
} from "lucide-react";
import {
  LogbookEntry,
} from "@/src/lib/exporters/types";

interface LivePreviewBottomBarProps {
  entries: LogbookEntry[];
  exportingType: "pdf" | "excel" | "word" | "pptx" | null;
  handleDownloadPdf: () => Promise<void>;
  handleWebShare: () => Promise<void>;
  isAnyExporting: boolean;
  isPdfExporting: boolean;
  onClose: () => void;
  onExportExcel: () => void;
  onExportPowerPoint: () => void;
  onExportWord: () => void;
}

export function LivePreviewBottomBar({ entries, exportingType, handleDownloadPdf, handleWebShare, isAnyExporting, isPdfExporting, onClose, onExportExcel, onExportPowerPoint, onExportWord }: LivePreviewBottomBarProps) {
  return (
    <>
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
    </>
  );
}
