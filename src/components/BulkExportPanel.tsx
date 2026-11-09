"use client";

import React from "react";
import {
  Check,
  FileText,
  FileSpreadsheet,
  X,
  Camera,
  Search,
  FileCheck,
  CheckSquare,
  ListFilter,
  Eye,
} from "lucide-react";
import type { LogbookEntry } from "@/src/lib/exporters/types";

/** Panel bulk selection & filter entri logbook (cari, filter tipe, checkbox entri).
 * Dipindah verbatim dari ExportHub (fase 2) — props diteruskan dari induk. */
export interface BulkExportPanelProps {
  exportingType: "pdf" | "excel" | "word" | "pptx" | null;
  isBulkSelectionActive: boolean;
  selectedExportEntryIds: string[];
  bulkExportSearchQuery: string;
  bulkExportFilterType: string;
  setBulkExportFilterType: (value: string) => void;
  setBulkExportSearchQuery: (value: string) => void;
  getEntriesForExport: () => LogbookEntry[];
  getSelectedEntriesForExport: () => LogbookEntry[];
  handleToggleBulkSelectEntry: (id: string) => void;
  handleSelectAllExportEntries: () => void;
  handleDeselectAllExportEntries: () => void;
  handleSelectRecentExportEntries: (count: number) => void;
  handleToggleBulkSelectionMode: () => void;
  handleOpenLivePreview: () => void;
  handleExportExcel: () => void | Promise<void>;
  handleExportWord: () => void | Promise<void>;
}

export function BulkExportPanel(props: BulkExportPanelProps) {
  const {
    exportingType,
    isBulkSelectionActive,
    selectedExportEntryIds,
    bulkExportSearchQuery,
    bulkExportFilterType,
    setBulkExportFilterType,
    setBulkExportSearchQuery,
    getEntriesForExport,
    getSelectedEntriesForExport,
    handleToggleBulkSelectEntry,
    handleSelectAllExportEntries,
    handleDeselectAllExportEntries,
    handleSelectRecentExportEntries,
    handleToggleBulkSelectionMode,
    handleOpenLivePreview,
    handleExportExcel,
    handleExportWord,
  } = props;

  return (
    <>
            {/* Panel Bulk Selection & Filter Entri Logbook */}
            <div className="rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Seleksi Entri Logbook (Bulk Select)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {isBulkSelectionActive
                          ? `${getSelectedEntriesForExport().length} dari ${getEntriesForExport().length} dipilih`
                          : `Semua (${getEntriesForExport().length}) entri`}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Pilih beberapa entri spesifik dari riwayat untuk digabungkan menjadi satu file Word (.docx) atau Excel (.xlsx) resmi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleBulkSelectionMode}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${
                      isBulkSelectionActive
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>{isBulkSelectionActive ? "Sembunyikan Daftar Entri" : "Buka & Kustomisasi Entri"}</span>
                  </button>
                </div>
              </div>

              {/* Detail Kontrol & Tabel Seleksi Entri saat Mode Aktif */}
              {isBulkSelectionActive && (
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800/80 space-y-2.5">
                  {/* Bar Pencarian & Tombol Aksi Cepat */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cari entri berdasarkan tanggal, kegiatan, atau kata kunci..."
                        value={bulkExportSearchQuery}
                        onChange={(e) => setBulkExportSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                      />
                      {bulkExportSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBulkExportSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllExportEntries}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                      >
                        Pilih Semua ({getEntriesForExport().length})
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllExportEntries}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                      >
                        Batal Semua
                      </button>
                      {getEntriesForExport().length > 7 && (
                        <button
                          type="button"
                          onClick={() => handleSelectRecentExportEntries(7)}
                          className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                        >
                          7 Terakhir
                        </button>
                      )}
                      {getEntriesForExport().length > 30 && (
                        <button
                          type="button"
                          onClick={() => handleSelectRecentExportEntries(30)}
                          className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                        >
                          30 Terakhir
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Kategori Tipe Kegiatan */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                    <span className="text-zinc-400 dark:text-zinc-500 font-medium shrink-0">Filter:</span>
                    {[
                      { id: "all", label: "Semua Program" },
                      { id: "Magang MBKM", label: "Magang" },
                      { id: "KKN Tematik", label: "KKN" },
                      { id: "Studi Independen", label: "Studi Independen" },
                      { id: "Praktik Kerja Lapangan (PKL)", label: "PKL" },
                    ].map((tab) => {
                      const count =
                        tab.id === "all"
                          ? getEntriesForExport().length
                          : getEntriesForExport().filter((e) => e.tipeKegiatan === tab.id).length;
                      if (count === 0 && tab.id !== "all") return null;
                      const isActive = bulkExportFilterType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBulkExportFilterType(tab.id)}
                          className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
                            isActive
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          {tab.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Daftar Entri Scrollable dengan Checkbox */}
                  <div className="max-h-64 sm:max-h-72 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900/60 shadow-2xs">
                    {(() => {
                      const all = getEntriesForExport();
                      const query = bulkExportSearchQuery.toLowerCase().trim();
                      const filtered = all.filter((item) => {
                        const matchesQuery =
                          !query ||
                          item.tanggal?.toLowerCase().includes(query) ||
                          item.hari?.toLowerCase().includes(query) ||
                          item.deskripsiKegiatan?.toLowerCase().includes(query) ||
                          item.kompetensiDikembangkan?.toLowerCase().includes(query) ||
                          item.tipeKegiatan?.toLowerCase().includes(query) ||
                          item.tahapFase?.toLowerCase().includes(query);

                        const matchesType =
                          bulkExportFilterType === "all" ||
                          item.tipeKegiatan === bulkExportFilterType;

                        return matchesQuery && matchesType;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                            Tidak ada entri logbook yang cocok dengan filter atau kata kunci.
                          </div>
                        );
                      }

                      return filtered.map((entry, idx) => {
                        const entryId = entry.id || `entry-${idx}`;
                        const isSelected = selectedExportEntryIds.includes(entryId);
                        return (
                          <div
                            key={entryId}
                            onClick={() => handleToggleBulkSelectEntry(entryId)}
                            className={`p-3 flex items-start gap-3 transition cursor-pointer select-none ${
                              isSelected
                                ? "bg-zinc-50/90 dark:bg-zinc-800/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
                                : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition ${
                                  isSelected
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                    : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                  {entry.tanggal || `Entri #${idx + 1}`}
                                </span>
                                {entry.hari && (
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                    • {entry.hari}
                                  </span>
                                )}
                                {entry.tipeKegiatan && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                                    {entry.tipeKegiatan}
                                  </span>
                                )}
                                {entry.tahapFase && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                                    {entry.tahapFase}
                                  </span>
                                )}
                                {entry.qualityScore && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                    ★ {entry.qualityScore}/100
                                  </span>
                                )}
                                {entry.fotoBase64 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                    <Camera className="w-2.5 h-2.5" />
                                    <span>Foto Lampiran</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {entry.deskripsiKegiatan || entry.kendalaDihadapi || "Tidak ada detail kegiatan."}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    })()}
                  </div>

                  {/* Ringkasan & Tombol Aksi Cepat Unduh Langsung */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Dokumen akan menggabungkan <strong>{getSelectedEntriesForExport().length}</strong> entri logbook terpilih secara kronologis ke 1 file tunggal.
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenLivePreview}
                        disabled={getSelectedEntriesForExport().length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview ({getSelectedEntriesForExport().length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportWord}
                        disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ekspor Word ({getSelectedEntriesForExport().length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Ekspor Excel ({getSelectedEntriesForExport().length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

    </>
  );
}
