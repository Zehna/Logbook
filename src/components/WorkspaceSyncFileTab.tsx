"use client";

import React from "react";
import { ArrowRightLeft, Download, Laptop, Smartphone, Upload } from "lucide-react";

export interface WorkspaceSyncFileTabProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WorkspaceSyncFileTab: React.FC<WorkspaceSyncFileTabProps> = ({
  fileInputRef,
  onExportJson,
  onImportJson,
}) => {
  return (
  <div className="space-y-4">
    {/* Diagram Visual Perpindahan Perangkat */}
    <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-700">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800">Perangkat Asal</div>
          <div className="text-[11px] text-slate-500">HP / Browser Lama</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <ArrowRightLeft className="w-5 h-5 text-indigo-600 animate-pulse" />
        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
          Instant JSON
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-700">
          <Laptop className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800">Perangkat Baru</div>
          <div className="text-[11px] text-slate-500">Laptop / Sidang</div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
      {/* Tombol Ekspor Backup */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
            <Download className="w-4 h-4" />
            <span>1. Unduh Berkas Backup</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Simpan seluruh riwayat logbook harian, mingguan, biodata, bukti foto, dan lisensi Pro ke file JSON tunggal.
          </p>
        </div>
        <button
          type="button"
          onClick={onExportJson}
          className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor Backup (.json)</span>
        </button>
      </div>

      {/* Tombol Pulihkan Backup */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
            <Upload className="w-4 h-4" />
            <span>2. Pulihkan di Perangkat Baru</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Buka di laptop atau browser baru, pilih file JSON hasil unduhan, dan seluruh data langsung aktif kembali.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImportJson}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Impor / Pulihkan Data</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
