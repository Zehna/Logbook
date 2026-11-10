"use client";

import React from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { LogbookEntry } from "@/src/lib/exporters/types";
import { assessEntryQuality } from "@/src/lib/utils/auditFilters";

/**
 * Satu kartu entri riwayat hasil filter, lengkap dengan badge kualitas
 * dan aksi (auto-fix AI, muat ke editor, salin, hapus). Sebelumnya
 * callback .map inline di AuditHistoryPanel — dipindah verbatim ke sini;
 * penilaian kualitas kini memakai assessEntryQuality dari auditFilters.
 */

export interface AuditHistoryEntryCardProps {
  entry: LogbookEntry;
  history: LogbookEntry[];
  copiedId: string | null;
  fixingEntryId?: string | null;
  onLoadEntry: (entry: LogbookEntry) => void;
  onDeleteEntry: (id: string) => void;
  onAutoFixEntry: (entry: LogbookEntry) => Promise<void>;
  onCopyEntry: (entry: LogbookEntry) => void;
}

export const AuditHistoryEntryCard: React.FC<AuditHistoryEntryCardProps> = ({
  entry,
  history,
  copiedId,
  fixingEntryId,
  onLoadEntry,
  onDeleteEntry,
  onAutoFixEntry,
  onCopyEntry,
}) => {
  const { wordCount, isShort, maxSimilarity, matchedDate, isRepetitive, needsFix } =
    assessEntryQuality(entry, history);
  const isFixingThis = fixingEntryId === entry.id;

  return (
    <div
      className={`p-4 rounded-xl border transition space-y-3 ${
        isRepetitive
          ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
          : isShort
          ? "bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60"
          : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      {/* Entry Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{entry.tanggal}</span>
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700">
            {entry.tipeKegiatan}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[150px]">
            • {entry.peran}
          </span>
        </div>

        {/* Quality Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {isShort && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Terlalu Singkat ({wordCount} kata &lt; 20)</span>
            </span>
          )}
          {isRepetitive ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>Repetisi {maxSimilarity}% (mirip {matchedDate})</span>
            </span>
          ) : (
            !isShort && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Optimal ({wordCount} kata)</span>
              </span>
            )
          )}
        </div>
      </div>

      {/* Entry Content Preview with optional photo thumbnail */}
      <div className="flex items-start gap-3">
        {entry.fotoBase64 && (
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.fotoBase64}
              alt="Foto dokumentasi"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-relaxed">
            <strong>Deskripsi:</strong> {entry.deskripsiKegiatan}
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
            <strong>Kompetensi:</strong> {entry.kompetensiDikembangkan}
          </p>
        </div>
      </div>

      {/* Actions bar for this entry */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
        <div>
          {/* Tombol 1-Click AI Auto-Fix jika entri terdeteksi bermasalah */}
          {needsFix && (
            <button
              type="button"
              onClick={() => onAutoFixEntry(entry)}
              disabled={isFixingThis}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Tulis ulang dan variasikan kosakata secara otomatis menggunakan Gemini AI"
            >
              {isFixingThis ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Memvariasikan Narasi AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Variasikan & Perbaiki Otomatis</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => onLoadEntry(entry)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Muat ke Editor</span>
          </button>
          <button
            type="button"
            onClick={() => onCopyEntry(entry)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold transition cursor-pointer"
          >
            {copiedId === entry.id ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-300">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onDeleteEntry(entry.id)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/60 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
