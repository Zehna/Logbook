"use client";

import React from "react";
import { Check, CheckCircle2, Copy, Download } from "lucide-react";
import type { SksMappingResponse } from "@/src/lib/types/modules";

/**
 * Tampilan hasil konversi SKS: ringkasan, tabel matriks, dan rekomendasi
 * dosen. Sebelumnya blok `{result && (...)}` inline di SksConversionTab.
 */

export interface SksConversionResultsProps {
  result: SksMappingResponse;
  copiedState: boolean;
  onCopyMarkdown: () => void;
  onDownloadCsv: () => void;
}

export const SksConversionResults: React.FC<SksConversionResultsProps> = ({
  result,
  copiedState,
  onCopyMarkdown,
  onDownloadCsv,
}) => {
  return (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-6">
    {/* Summary Box */}
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
            STATUS VERIFIKASI OBE
          </span>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            Total Disetujui: {result.totalSksDisetujui} / {result.totalSksDiajukan} SKS
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
          Matriks Justifikasi Konversi SKS Resmi
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
          {result.ringkasanJustifikasi}
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          type="button"
          onClick={onCopyMarkdown}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {copiedState ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
              <span>Salin Matriks</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onDownloadCsv}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Unduh CSV</span>
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-200 font-bold border-b border-slate-200 dark:border-zinc-800">
            <th className="p-3 w-10 text-center">No</th>
            <th className="p-3 w-44">Mata Kuliah & Bobot</th>
            <th className="p-3 w-56">Capaian Pembelajaran (CPL/CPMK)</th>
            <th className="p-3 w-60">Aktivitas Bukti Logbook</th>
            <th className="p-3">Justifikasi Akademis Taksonomi Bloom</th>
            <th className="p-3 w-32 text-center">Rekomendasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-slate-700 dark:text-zinc-300">
          {result.matriks.map((row, idx) => (
            <tr key={idx} className="hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
              <td className="p-3 text-center font-bold text-slate-400 dark:text-zinc-500">{idx + 1}</td>
              <td className="p-3 font-semibold text-slate-900 dark:text-zinc-100">
                {row.mataKuliah}
                <span className="block text-[11px] font-normal text-amber-600 dark:text-amber-400">
                  {row.sks} SKS
                </span>
              </td>
              <td className="p-3 leading-relaxed text-slate-600 dark:text-zinc-400">{row.cplTerpenuhi}</td>
              <td className="p-3 leading-relaxed text-slate-700 dark:text-zinc-200 font-medium">
                {row.aktivitasLogbook}
              </td>
              <td className="p-3 leading-relaxed text-slate-600 dark:text-zinc-400 italic">
                {row.justifikasiAkademis}
              </td>
              <td className="p-3 text-center">
                <span className="inline-block px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                  {row.rekomendasiNilai}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Dosen Recommendation Card */}
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 space-y-1">
      <div className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Rekomendasi Resmi untuk Dosen Pembimbing Akademik / Kaprodi:</span>
      </div>
      <p className="leading-relaxed pl-5.5">{result.rekomendasiUntukDosen}</p>
    </div>
  </div>
  );
};
