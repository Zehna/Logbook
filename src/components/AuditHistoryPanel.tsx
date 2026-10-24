"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Trash2,
  Search,
  Sparkles,
  Loader2,
  History,
  Check,
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

export const getWordList = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
};

export const getWordSet = (text: string): Set<string> => {
  return new Set(getWordList(text));
};

export const computeJaccardSimilarity = (textA: string, textB: string): number => {
  const setA = getWordSet(textA);
  const setB = getWordSet(textB);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach((w) => {
    if (setB.has(w)) intersection++;
  });
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
};

export const computeOverallUniqueness = (entriesList: LogbookEntry[]): number => {
  if (entriesList.length === 0) return 100;
  const allWords = entriesList.flatMap((e) =>
    getWordList(e.deskripsiKegiatan || "")
  );
  if (allWords.length === 0) return 100;
  const uniqueCount = new Set(allWords).size;
  return Math.round((uniqueCount / allWords.length) * 100);
};

const INDONESIAN_MONTHS = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

function checkDateMatch(entryTanggal: string, targetDateYmd: string): boolean {
  if (!targetDateYmd) return true;
  if (!entryTanggal) return false;

  // Cek substring langsung jika berformat YYYY-MM-DD
  if (entryTanggal.includes(targetDateYmd)) return true;

  const [y, m, d] = targetDateYmd.split("-");
  if (!y || !m || !d) return false;

  const monthIdx = parseInt(m, 10) - 1;
  const monthName = INDONESIAN_MONTHS[monthIdx];
  const dayNum = parseInt(d, 10).toString();

  const lowerEntry = entryTanggal.toLowerCase();

  // Cek apakah tanggal teks bahasa Indonesia memuat nama bulan, hari, dan tahun
  if (
    monthName &&
    lowerEntry.includes(monthName) &&
    lowerEntry.includes(dayNum) &&
    lowerEntry.includes(y)
  ) {
    return true;
  }

  // Cek format angka DD/MM/YYYY atau DD-MM-YYYY
  const slashFormat = `${d}/${m}/${y}`;
  const dashFormat = `${d}-${m}-${y}`;
  if (entryTanggal.includes(slashFormat) || entryTanggal.includes(dashFormat)) {
    return true;
  }

  return false;
}

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
  const metrics = useMemo(() => {
    const uniquenessScore = computeOverallUniqueness(history);
    const shortEntriesCount = history.filter(
      (e) => getWordList(e.deskripsiKegiatan || "").length < 20
    ).length;

    let repetitiveEntriesCount = 0;
    for (let i = 0; i < history.length; i++) {
      const cur = history[i];
      const others = history.filter((_, idx) => idx !== i);
      const maxSim = Math.max(
        0,
        ...others.map((o) =>
          computeJaccardSimilarity(
            cur.deskripsiKegiatan || "",
            o.deskripsiKegiatan || ""
          )
        )
      );
      if (maxSim >= 70) {
        repetitiveEntriesCount++;
      }
    }

    return {
      uniquenessScore,
      shortEntriesCount,
      repetitiveEntriesCount,
    };
  }, [history]);

  // Ekstraksi seluruh tipe kegiatan unik yang ada di riwayat
  const availableActivityTypes = useMemo(() => {
    const typesSet = new Set<string>();
    typesSet.add("Magang MBKM");
    typesSet.add("MSIB");
    typesSet.add("KKN");
    history.forEach((e) => {
      if (e.tipeKegiatan && e.tipeKegiatan.trim()) {
        typesSet.add(e.tipeKegiatan.trim());
      }
    });
    return Array.from(typesSet);
  }, [history]);

  // Eksekusi multi-filter komprehensif: keyword, tipe kegiatan, tanggal, dan status kualitas
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      // 1. Filter Kata Kunci (Keyword Search)
      if (activeSearchQuery.trim()) {
        const q = activeSearchQuery.toLowerCase().trim();
        const matchKeyword =
          (entry.tanggal || "").toLowerCase().includes(q) ||
          (entry.peran || "").toLowerCase().includes(q) ||
          (entry.tipeKegiatan || "").toLowerCase().includes(q) ||
          (entry.deskripsiKegiatan || "").toLowerCase().includes(q) ||
          (entry.kompetensiDikembangkan || "").toLowerCase().includes(q) ||
          (entry.kendalaDihadapi || "").toLowerCase().includes(q) ||
          (entry.solusiTindakan || "").toLowerCase().includes(q) ||
          (entry.refleksiPembelajaran || "").toLowerCase().includes(q);

        if (!matchKeyword) return false;
      }

      // 2. Filter Tipe Kegiatan (Activity Type)
      if (selectedActivityType !== "all") {
        if (entry.tipeKegiatan !== selectedActivityType) {
          return false;
        }
      }

      // 3. Filter Tanggal (Date Filter)
      if (datePreset === "today") {
        const todayIso = new Date().toISOString().slice(0, 10);
        if (!checkDateMatch(entry.tanggal, todayIso)) return false;
      } else if (datePreset === "7days" || datePreset === "30days") {
        const daysCount = datePreset === "7days" ? 7 : 30;
        let inRange = false;
        for (let i = 0; i <= daysCount; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const iso = d.toISOString().slice(0, 10);
          if (checkDateMatch(entry.tanggal, iso)) {
            inRange = true;
            break;
          }
        }
        if (!inRange) return false;
      } else if (selectedDate) {
        if (!checkDateMatch(entry.tanggal, selectedDate)) {
          return false;
        }
      }

      // 4. Filter Kualitas Audit
      if (selectedQualityFilter !== "all") {
        const words = getWordList(entry.deskripsiKegiatan || "");
        const isShort = words.length < 20;

        const others = history.filter((other) => other.id !== entry.id);
        let maxSim = 0;
        for (const other of others) {
          const sim = computeJaccardSimilarity(
            entry.deskripsiKegiatan || "",
            other.deskripsiKegiatan || ""
          );
          if (sim > maxSim) maxSim = sim;
        }
        const isRepetitive = maxSim >= 70;
        const needsFix = isShort || isRepetitive;

        if (selectedQualityFilter === "needs_fix" && !needsFix) return false;
        if (selectedQualityFilter === "optimal" && needsFix) return false;
      }

      return true;
    });
  }, [
    history,
    activeSearchQuery,
    selectedActivityType,
    selectedDate,
    datePreset,
    selectedQualityFilter,
  ]);

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
              filteredHistory.map((entry, idx) => {
                const words = getWordList(entry.deskripsiKegiatan || "");
                const wordCount = words.length;
                const isShort = wordCount < 20;

                const others = history.filter((other) => other.id !== entry.id);
                let maxSimilarity = 0;
                let matchedDate = "";
                for (const other of others) {
                  const sim = computeJaccardSimilarity(
                    entry.deskripsiKegiatan || "",
                    other.deskripsiKegiatan || ""
                  );
                  if (sim > maxSimilarity) {
                    maxSimilarity = sim;
                    matchedDate = other.tanggal;
                  }
                }
                const isRepetitive = maxSimilarity >= 70;
                const needsFix = isRepetitive || isShort;
                const isFixingThis = fixingEntryId === entry.id;

                return (
                  <div
                    key={entry.id || idx}
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
                          onClick={() => handleCopySingle(entry)}
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
              })
            )}
          </div>
        </>
      )}
    </section>
  );
};
