"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";
import { LogbookEntry } from "@/src/lib/exporters/types";

export interface AuditHistoryPanelProps {
  history: LogbookEntry[];
  onClearAllHistory: () => void;
  onDeleteEntry: (id: string) => void;
  onLoadEntry: (entry: LogbookEntry) => void;
  onAutoFixEntry: (entry: LogbookEntry) => Promise<void>;
  fixingEntryId?: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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

export const AuditHistoryPanel: React.FC<AuditHistoryPanelProps> = ({
  history,
  onClearAllHistory,
  onDeleteEntry,
  onLoadEntry,
  onAutoFixEntry,
  fixingEntryId,
  searchQuery,
  onSearchChange,
  onToast,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

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

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase();
    return history.filter(
      (entry) =>
        entry.tanggal?.toLowerCase().includes(q) ||
        entry.peran?.toLowerCase().includes(q) ||
        entry.tipeKegiatan?.toLowerCase().includes(q) ||
        entry.deskripsiKegiatan?.toLowerCase().includes(q) ||
        entry.kendalaDihadapi?.toLowerCase().includes(q) ||
        entry.solusiTindakan?.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  const handleCopySingle = async (entry: LogbookEntry) => {
    const text = `LOGBOOK ${entry.tipeKegiatan} - ${entry.tanggal}\nPeran: ${entry.peran}\n\n1. Deskripsi: ${entry.deskripsiKegiatan}\n2. Kompetensi: ${entry.kompetensiDikembangkan}\n3. Kendala: ${entry.kendalaDihadapi}\n4. Solusi: ${entry.solusiTindakan}\n5. Refleksi: ${entry.refleksiPembelajaran}`;
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
    <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audit Kualitas & Anti-Duplikasi Logbook</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
            Riwayat Logbook Tersimpan ({history.length} Hari)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis keunikan kosakata, deteksi repetisi/copas antar-hari (&ge;70%), validasi kelengkapan narasi (&ge;20 kata), dan fitur 1-Click AI Auto-Fix.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearAllHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Semua Riwayat</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-slate-500 space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            Belum ada logbook yang tersimpan di riwayat
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Setiap logbook harian atau mingguan yang Anda generate akan otomatis tersimpan di mesin IndexedDB lokal lengkap dengan audit skor keunikan kosakata dan deteksi kemiripan.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Skor Keunikan Kosakata */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">
                  Skor Keunikan Kosakata
                </span>
                <span className="text-sm font-extrabold text-indigo-700">
                  {metrics.uniquenessScore}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
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
              <p className="text-[11px] text-slate-500">
                {metrics.uniquenessScore >= 70
                  ? "✅ Kosakata sangat variatif & profesional"
                  : metrics.uniquenessScore >= 50
                  ? "ℹ️ Cukup variatif, hindari pengulangan frasa"
                  : "⚠️ Cenderung monoton, gunakan variasi istilah"}
              </p>
            </div>

            {/* 2. Kelayakan Panjang Narasi */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900">
                  Standar Panjang Narasi
                </span>
                <span className="text-sm font-extrabold text-teal-700">
                  {history.length - metrics.shortEntriesCount}/{history.length} Lolos
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
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
              <p className="text-[11px] text-slate-500">
                {metrics.shortEntriesCount === 0
                  ? "✅ Semua entri memenuhi standar (&ge;20 kata)"
                  : `⚠️ ${metrics.shortEntriesCount} entri terlalu ringkas (<20 kata)`}
              </p>
            </div>

            {/* 3. Anti-Duplikasi / Kemiripan Antar Hari */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Status Anti-Duplikasi
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {metrics.repetitiveEntriesCount === 0 ? "Aman" : "Peringatan"}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.repetitiveEntriesCount === 0 ? "bg-emerald-500" : "bg-rose-500"
                  }`}
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
              <p className="text-[11px] text-slate-500">
                {metrics.repetitiveEntriesCount === 0
                  ? "✅ 100% Bebas indikasi copas antar-hari"
                  : `⚠️ ${metrics.repetitiveEntriesCount} entri memiliki kemiripan &ge;70%`}
              </p>
            </div>
          </div>

          {/* Search Bar Riwayat */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari riwayat berdasarkan tanggal, kata kunci kegiatan, peran, atau kendala..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Daftar Entri Riwayat */}
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredHistory.map((entry, idx) => {
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
                      ? "bg-rose-50/40 border-rose-200"
                      : isShort
                      ? "bg-amber-50/30 border-amber-200"
                      : "bg-white border-slate-200/90 hover:border-indigo-300"
                  }`}
                >
                  {/* Entry Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{entry.tanggal}</span>
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {entry.tipeKegiatan}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                        • {entry.peran}
                      </span>
                    </div>

                    {/* Quality Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isShort && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Terlalu Singkat ({wordCount} kata &lt; 20)</span>
                        </span>
                      )}
                      {isRepetitive ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Repetisi {maxSimilarity}% (mirip {matchedDate})</span>
                        </span>
                      ) : (
                        !isShort && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Optimal ({wordCount} kata)</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Entry Content Preview with optional photo thumbnail */}
                  <div className="flex items-start gap-3">
                    {entry.fotoBase64 && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.fotoBase64}
                          alt="Foto dokumentasi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed">
                        <strong>Deskripsi:</strong> {entry.deskripsiKegiatan}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        <strong>Kompetensi:</strong> {entry.kompetensiDikembangkan}
                      </p>
                    </div>
                  </div>

                  {/* Actions bar for this entry */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Muat ke Editor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopySingle(entry)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
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
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
