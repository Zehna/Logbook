"use client";

import React from "react";
import {
  Sparkles,
  FileText,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  Presentation,
  Download,
} from "lucide-react";
import type { LogbookEntry } from "@/src/lib/exporters/types";

/** Aksi unduh: toast sukses, sintesis AI Bab I-V, grid tombol .xlsx/.docx/.pptx.
 * Dipindah verbatim dari ExportHub (fase 2) — props diteruskan dari induk. */
export interface ExportDownloadActionsProps {
  isSynthesizingReport: boolean;
  exportingType: "pdf" | "excel" | "word" | "pptx" | null;
  exportSuccessToast: string | null;
  isBulkSelectionActive: boolean;
  getSelectedEntriesForExport: () => LogbookEntry[];
  handleExportExcel: () => void | Promise<void>;
  handleExportWord: () => void | Promise<void>;
  handleSynthesizeAndExportWord: () => void | Promise<void>;
  handleExportPowerPoint: () => void | Promise<void>;
}

export function ExportDownloadActions(props: ExportDownloadActionsProps) {
  const {
    isSynthesizingReport,
    exportingType,
    exportSuccessToast,
    isBulkSelectionActive,
    getSelectedEntriesForExport,
    handleExportExcel,
    handleExportWord,
    handleSynthesizeAndExportWord,
    handleExportPowerPoint,
  } = props;

  return (
    <>
            {/* Notifikasi Toast Sukses Ekspor */}
            {exportSuccessToast && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exportSuccessToast}</span>
              </div>
            )}

            {/* Tombol Utama: Sintesis AI Bab I-V Laporan Lengkap */}
            <button
              type="button"
              onClick={handleSynthesizeAndExportWord}
              disabled={isSynthesizingReport || exportingType !== null}
              className="w-full flex items-center justify-between p-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium text-left transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center shrink-0">
                  {isSynthesizingReport ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white dark:text-zinc-900" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white dark:text-zinc-900" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold">
                      Sintesis Bab I–V + Unduh Laporan Lengkap (.docx)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900">
                      Academic
                    </span>
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-500/30 text-indigo-200 dark:text-indigo-800 border border-indigo-400/40">
                        {getSelectedEntriesForExport().length} Entri Tergabung
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                    Menyusun Bab I (Latar Belakang), Bab II (Teori), Bab IV (Pembahasan), dan Bab V (Saran) langsung ke Word dari {getSelectedEntriesForExport().length} entri.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-2.5 py-1 rounded-md">
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </div>
            </button>

            {/* Grid Tombol Unduh Dokumen (.xlsx, .docx, .pptx) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                className="flex flex-col items-start justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex items-center gap-1.5">
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {getSelectedEntriesForExport().length} Entri
                      </span>
                    )}
                    {exportingType === "excel" && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  Rekap Excel (.xlsx)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isBulkSelectionActive
                    ? `${getSelectedEntriesForExport().length} Entri Tergabung`
                    : "Tabel Formal 8 Kolom"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportWord}
                disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                className="flex flex-col items-start justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex items-center gap-1.5">
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {getSelectedEntriesForExport().length} Entri
                      </span>
                    )}
                    {exportingType === "word" && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  Laporan Word (.docx)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isBulkSelectionActive
                    ? `${getSelectedEntriesForExport().length} Entri Tergabung`
                    : "TNR 12pt • Cover & Foto"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportPowerPoint}
                disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                className="flex flex-col items-start justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <Presentation className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div className="flex items-center gap-1.5">
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {getSelectedEntriesForExport().length} Entri
                      </span>
                    )}
                    {exportingType === "pptx" && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  Slide Sidang (.pptx)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isBulkSelectionActive
                    ? `${getSelectedEntriesForExport().length} Entri Tergabung`
                    : "Slide Sidang + Foto"}
                </span>
              </button>
            </div>

    </>
  );
}
