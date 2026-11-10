"use client";

import React from "react";
import { Loader2, Mic, Sparkles } from "lucide-react";

export interface DplSimulatorInputConfigProps {
  judulLaporan: string;
  onJudulLaporanChange: (value: string) => void;
  mitraPerusahaan: string;
  onMitraPerusahaanChange: (value: string) => void;
  activityContext: string;
  onActivityContextChange: (value: string) => void;
  konteksMatkulSks?: string;
  isLoading: boolean;
  errorMsg: string | null;
  onFillSample: () => void;
  onRunSimulator: () => void;
}

export const DplSimulatorInputConfig: React.FC<DplSimulatorInputConfigProps> = ({
  judulLaporan,
  onJudulLaporanChange,
  mitraPerusahaan,
  onMitraPerusahaanChange,
  activityContext,
  onActivityContextChange,
  konteksMatkulSks,
  isLoading,
  errorMsg,
  onFillSample,
  onRunSimulator,
}) => {
  return (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
          Judul Draf Laporan Akhir:
        </label>
        <input
          type="text"
          value={judulLaporan}
          onChange={(e) => onJudulLaporanChange(e.target.value)}
          className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-800/60"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
          Nama Mitra / Perusahaan / Desa:
        </label>
        <input
          type="text"
          value={mitraPerusahaan}
          onChange={(e) => onMitraPerusahaanChange(e.target.value)}
          className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-800/60"
        />
      </div>
    </div>

    {konteksMatkulSks && (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <div>
          <span className="font-bold">Konteks Konversi 20 SKS Terintegrasi:</span> Dosen penguji akan secara otomatis menguji kesesuaian logbook kerja dengan capaian mata kuliah yang Anda ajukan.
        </div>
      </div>
    )}

    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
          Riwayat Logbook yang Akan Dicecar Dosen:
        </label>
        <button
          type="button"
          onClick={onFillSample}
          className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
        >
          Isi Contoh Laporan
        </button>
      </div>
      <textarea
        rows={4}
        value={activityContext}
        onChange={(e) => onActivityContextChange(e.target.value)}
        placeholder="Masukkan rangkuman kegiatan harian/mingguan yang sudah Anda buat..."
        className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-slate-50/50 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-100"
      />
    </div>

    {errorMsg && (
      <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
        {errorMsg}
      </div>
    )}

    <button
      type="button"
      onClick={onRunSimulator}
      disabled={isLoading}
      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>DPL AI Sedang Membedah Celah Logbook & Menyiapkan Pertanyaan...</span>
        </>
      ) : (
        <>
          <Mic className="w-5 h-5" />
          <span>🎙️ Mulai Uji Sidang DPL Sekarang</span>
        </>
      )}
    </button>
  </div>
  );
};
