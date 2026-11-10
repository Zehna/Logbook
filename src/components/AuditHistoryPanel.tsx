"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Trash2,
  Search,
  History,
  X,
  Filter,
  Briefcase,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { LogbookEntry } from "@/src/lib/exporters/types";

export interface AuditHistoryPanelProps {
  history: LogbookEntry[];
  onClearAllHistory: () => void;
  onDeleteEntry: (id: string) => void;
  onLoadEntry: (entry: LogbookEntry) => void;
  onAutoFixEntry: (entry: LogbookEntry) => Promise<void>;
  fixingEntryId?: string | null;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onToast: (message: string) => void;
}

// Util kata dipakai ulang dari textSimilarity (sebelumnya diduplikasi persis di file ini).
export {
  computeJaccardSimilarity,
  computeOverallUniqueness,
  getWordList,
  getWordSet,
} from "@/src/lib/utils/textSimilarity";
import {
  computeAuditMetrics,
  extractAvailableActivityTypes,
  filterHistory,
} from "@/src/lib/utils/auditFilters";
import { AuditHistoryEntryCard } from "./AuditHistoryEntryCard";
export const AuditHistoryPanel: React.FC<AuditHistoryPanelProps> = ({
  history,
  onClearAllHistory,
  onDeleteEntry,
  onLoadEntry,
  onAutoFixEntry,
  fixingEntryId,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onToast,
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [selectedActivityType, setSelectedActivityType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "7days" | "30days" | "custom">("all");
  const [selectedQualityFilter, setSelectedQualityFilter] = useState<"all" | "needs_fix" | "optimal">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sinkronkan search query dari props jika dikontrol secara eksternal
  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const handleSearchChange = (val: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    } else {
      setInternalSearchQuery(val);
    }
  };

  // Kalkulasi Metrik Keseluruhan
  const metrics = useMemo(() => computeAuditMetrics(history), [history]);

  // Ekstraksi seluruh tipe kegiatan unik yang ada di riwayat
  const availableActivityTypes = useMemo(
    () => extractAvailableActivityTypes(history),
    [history]
  );

  // Eksekusi multi-filter komprehensif: keyword, tipe kegiatan, tanggal, dan status kualitas
  const filteredHistory = useMemo(
    () =>
      filterHistory(history, {
        query: activeSearchQuery,
        activityType: selectedActivityType,
        selectedDate,
        datePreset,
        qualityFilter: selectedQualityFilter,
      }),
    [
      history,
      activeSearchQuery,
      selectedActivityType,
      selectedDate,
      datePreset,
      selectedQualityFilter,
    ]
  );

  const hasActiveFilters =
    Boolean(activeSearchQuery.trim()) ||
    selectedActivityType !== "all" ||
    selectedDate !== "" ||
    datePreset !== "all" ||
    selectedQualityFilter !== "all";

  const handleResetFilters = () => {
    handleSearchChange("");
    setSelectedActivityType("all");
    setSelectedDate("");
    setDatePreset("all");
    setSelectedQualityFilter("all");
  };

  const handleCopySingle = async (entry: LogbookEntry) => {
    const text = `LOGBOOK ${entry.tipeKegiatan} - ${entry.tanggal}\nPeran: ${entry.peran}\n\n1. Deskripsi Kegiatan: ${entry.deskripsiKegiatan}\n2. Kompetensi Dikembangkan: ${entry.kompetensiDikembangkan}\n3. Kendala Dihadapi: ${entry.kendalaDihadapi}\n4. Solusi Tindakan: ${entry.solusiTindakan}\n5. Refleksi Pembelajaran: ${entry.refleksiPembelajaran}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
      onToast(`Logbook tanggal ${entry.tanggal} disalin ke clipboard!`);
    } catch {
      // ignore
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-900/70 rounded-2xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6 transition-colors">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 px-2.5 py-1 rounded-md mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audit Kualitas & Anti-Duplikasi Logbook</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Riwayat Logbook Tersimpan ({history.length} Hari)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Filter cepat berdasarkan kata kunci, tanggal, tipe kegiatan, serta deteksi repetisi (&ge;70%) &amp; fitur 1-Click AI Auto-Fix.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAllHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 space-y-2">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <History className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Belum ada logbook yang tersimpan di riwayat
          </p>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Setiap logbook harian atau mingguan yang Anda generate akan otomatis tersimpan di mesin IndexedDB lokal lengkap dengan audit skor keunikan kosakata dan filter pencarian.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Skor Keunikan Kosakata */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-white dark:from-indigo-950/30 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Skor Keunikan Kosakata
                </span>
                <span className="text-sm font-extrabold text-indigo-700 dark:text-indigo-300">
                  {metrics.uniquenessScore}%
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.uniquenessScore >= 70
                      ? "bg-emerald-500"
                      : metrics.uniquenessScore >= 50
                      ? "bg-indigo-500"
                      : "bg-amber-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(10, metrics.uniquenessScore))}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {metrics.uniquenessScore >= 70
                  ? "✅ Kosakata sangat variatif & profesional"
                  : metrics.uniquenessScore >= 50
                  ? "ℹ️ Cukup variatif, hindari pengulangan frasa"
                  : "⚠️ Cenderung monoton, gunakan variasi istilah"}
              </p>
            </div>

            {/* 2. Kelayakan Panjang Narasi */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50/70 to-white dark:from-teal-950/30 dark:to-zinc-900 border border-teal-100 dark:border-teal-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">
                  Standar Panjang Narasi
                </span>
                <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">
                  {history.length - metrics.shortEntriesCount}/{history.length} Lolos
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-teal-500 transition-all duration-500"
                  style={{
                    width: `${
                      history.length > 0
                        ? Math.round(
                            ((history.length - metrics.shortEntriesCount) /
                              history.length) *
                              100
                          )
                        : 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {metrics.shortEntriesCount === 0
                  ? "✅ Semua entri memenuhi standar (&ge;20 kata)"
                  : `⚠️ ${metrics.shortEntriesCount} entri terlalu ringkas (<20 kata)`}
              </p>
            </div>

            {/* 3. Anti-Duplikasi / Kemiripan Antar Hari */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-white dark:from-amber-950/30 dark:to-zinc-900 border border-amber-100 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Anti-Duplikasi Antar Hari
                </span>
                <span className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  {history.length - metrics.repetitiveEntriesCount}/{history.length} Lolos
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${
                      history.length > 0
                        ? Math.round(
                            ((history.length - metrics.repetitiveEntriesCount) /
                              history.length) *
                              100
                          )
                        : 100
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {metrics.repetitiveEntriesCount === 0
                  ? "✅ 100% Bebas indikasi copas antar-hari"
                  : `⚠️ ${metrics.repetitiveEntriesCount} entri memiliki kemiripan &ge;70%`}
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SEARCH & COMPREHENSIVE FILTER TOOLBAR (KEYWORD, TANGGAL, TIPE KEGIATAN) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              {/* 1. Keyword Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activeSearchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari kata kunci kegiatan, peran, kendala, solusi..."
                  className="w-full text-xs pl-9 pr-8 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
                {activeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    title="Bersihkan kata kunci"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Filter Tipe Kegiatan (Activity Type) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Briefcase className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Filter Berdasarkan Tipe Kegiatan / Program"
                >
                  <option value="all">Semua Program ({history.length})</option>
                  {availableActivityTypes.map((type) => {
                    const count = history.filter((h) => h.tipeKegiatan === type).length;
                    return (
                      <option key={type} value={type}>
                        {type} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 3. Filter Tanggal Spesifik (Date Picker) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) {
                      setDatePreset("custom");
                    } else {
                      setDatePreset("all");
                    }
                  }}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Pilih tanggal kegiatan spesifik"
                />
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate("");
                      setDatePreset("all");
                    }}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700 cursor-pointer"
                    title="Bersihkan filter tanggal"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 4. Filter Kualitas Audit */}
              <div className="flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
                <select
                  value={selectedQualityFilter}
                  onChange={(e) => setSelectedQualityFilter(e.target.value as typeof selectedQualityFilter)}
                  className="text-xs px-2.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  title="Filter Berdasarkan Status Kualitas Audit"
                >
                  <option value="all">Semua Status Kualitas</option>
                  <option value="needs_fix">⚠️ Perlu Perbaikan ({metrics.repetitiveEntriesCount + metrics.shortEntriesCount})</option>
                  <option value="optimal">✅ Lolos Standar</option>
                </select>
              </div>
            </div>

            {/* Quick Date Presets & Filter Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 mr-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  Rentang Tanggal:
                </span>
                {[
                  { id: "all", label: "Semua Tanggal" },
                  { id: "today", label: "Hari Ini" },
                  { id: "7days", label: "7 Hari Terakhir" },
                  { id: "30days", label: "30 Hari Terakhir" },
                ].map((preset) => {
                  const isActive = datePreset === preset.id && !selectedDate;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setDatePreset(preset.id as typeof datePreset);
                        setSelectedDate("");
                      }}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                        isActive
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold shadow-2xs"
                          : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Info Hasil Filter & Tombol Reset */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Menampilkan <strong>{filteredHistory.length}</strong> dari {history.length} entri
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition cursor-pointer"
                    title="Kembalikan seluruh filter pencarian"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Filter</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DAFTAR ENTRI RIWAYAT HASIL FILTER */}
          {/* ======================================================== */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 space-y-2">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                  <Filter className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Tidak ada entri logbook yang cocok dengan filter
                </p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  {activeSearchQuery && `Kata kunci: "${activeSearchQuery}" • `}
                  {selectedActivityType !== "all" && `Program: "${selectedActivityType}" • `}
                  {(selectedDate || datePreset !== "all") && "Filter tanggal aktif"}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            ) : (
              filteredHistory.map((entry, idx) => (
                <AuditHistoryEntryCard
                  key={entry.id || idx}
                  entry={entry}
                  history={history}
                  copiedId={copiedId}
                  fixingEntryId={fixingEntryId}
                  onLoadEntry={onLoadEntry}
                  onDeleteEntry={onDeleteEntry}
                  onAutoFixEntry={onAutoFixEntry}
                  onCopyEntry={handleCopySingle}
                />
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
};
