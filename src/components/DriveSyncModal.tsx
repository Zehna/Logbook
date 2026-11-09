"use client";


import React from "react";
import {
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";

/** Modal status integrasi Google Drive / Sheets. Sebelumnya JSX inline di app/page.tsx. */
interface DriveSyncModalProps {
  driveSyncStep: "idle" | "syncing" | "synced";
  exportEntryCount: number;
  tipeKegiatan: string;
  copiedSheetsTsv: boolean;
  onCopySheetsRowTsv: () => void;
  onClose: () => void;
}

export function DriveSyncModal(props: DriveSyncModalProps) {
  const {
    driveSyncStep,
    exportEntryCount,
    tipeKegiatan,
    copiedSheetsTsv,
    onCopySheetsRowTsv,
    onClose,
  } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Integrasi Google Drive & Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Status Sinkronisasi Dokumen LogMagang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {driveSyncStep === "syncing" ? (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                Menyiapkan Pipeline Sinkronisasi Cloud...
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Memformat {exportEntryCount} entri logbook untuk
                Google Sheets & Google Drive
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold">
                  Data Logbook Siap Disinkronkan (
                  {exportEntryCount} Baris Aktif)
                </p>
                <p className="text-emerald-700 leading-relaxed">
                  Format baris tabel telah disesuaikan dengan struktur kolom
                  standar Google Sheets (`No`, `Tanggal`, `Peran`,
                  `Deskripsi`, `Kompetensi`, `Kendala`, `Solusi`,
                  `Refleksi`).
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">
                  Target Folder Drive:
                </span>
                <span className="font-mono font-bold text-slate-800">
                  /LogMagang_{tipeKegiatan.replace(/\s+/g, "_")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">
                  Mode OAuth Workspace:
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                  Sandbox / Clipboard Bridge
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onCopySheetsRowTsv}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedSheetsTsv ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Format Tabel Google Sheets Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>
                      Salin Format Tabel (Langsung Paste di Google Sheets)
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Buka Google Sheets Baru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
