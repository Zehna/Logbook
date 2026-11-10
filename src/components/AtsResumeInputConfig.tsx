"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export interface AtsResumeInputConfigProps {
  peran: string;
  tipeKegiatan: string;
  targetRole: string;
  onTargetRoleChange: (value: string) => void;
  activityContext: string;
  onActivityContextChange: (value: string) => void;
  isLoading: boolean;
  errorMsg: string | null;
  onFillSample: () => void;
  onGenerate: () => void;
}

export const AtsResumeInputConfig: React.FC<AtsResumeInputConfigProps> = ({
  peran,
  tipeKegiatan,
  targetRole,
  onTargetRoleChange,
  activityContext,
  onActivityContextChange,
  isLoading,
  errorMsg,
  onFillSample,
  onGenerate,
}) => {
  return (
  <div className="no-print bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
          Peran Asal Magang / KKN:
        </label>
        <input
          type="text"
          readOnly
          value={`${peran} (${tipeKegiatan})`}
          className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 font-medium text-slate-700 dark:text-zinc-300"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
          Target Posisi Karier Impian:
        </label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => onTargetRoleChange(e.target.value)}
          placeholder="misal: Junior Product Manager, Frontend Developer..."
          className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800 dark:text-zinc-100 bg-white dark:bg-zinc-800/60"
        />
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
          Riwayat Logbook / Catatan Kerja yang Dianalisis:
        </label>
        <button
          type="button"
          onClick={onFillSample}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
        >
          Isi Contoh Pengalaman
        </button>
      </div>
      <textarea
        rows={4}
        value={activityContext}
        onChange={(e) => onActivityContextChange(e.target.value)}
        placeholder="Ketik atau biarkan terisi dari riwayat logbook aplikasi..."
        className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-100"
      />
      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
        💡 AI akan mengekstrak metrik keberhasilan, instrumen kerja, dan solusi yang pernah Anda terapkan menjadi data resume konkret.
      </p>
    </div>

    {errorMsg && (
      <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
        {errorMsg}
      </div>
    )}

    <button
      type="button"
      onClick={onGenerate}
      disabled={isLoading}
      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Mentransformasi Logbook ke Standar ATS & LinkedIn...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5" />
          <span>🚀 Generate ATS Resume & LinkedIn Story</span>
        </>
      )}
    </button>
  </div>
  );
};
