"use client";

import React from "react";
import {
  Calendar,
  GitBranch,
} from "lucide-react";
import { checkRangeForHolidays } from "@/src/lib/utils/indonesianHolidays";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";
import { PROGRAM_OPTIONS } from "@/src/lib/config/programOptions";

/** Bidang mode borongan 1 pekan: rentang tanggal, ringkasan mingguan + toolbar.
 * Dipindah verbatim dari DailyFormCard (fase 2) — props diteruskan dari induk. */
export interface WeeklyModeFieldsProps {
  tanggalMulai: string;
  tanggalSelesai: string;
  ringkasanMingguan: string;
  isLoading: boolean;
  isHydrated: boolean;
  currentProgramConfig: (typeof PROGRAM_OPTIONS)[number];
  setTanggalMulai: (value: string) => void;
  setTanggalSelesai: (value: string) => void;
  setRingkasanMingguan: (value: string | ((prev: string) => string)) => void;
  setIsSmartIngestionOpen: (value: boolean) => void;
  handleFillWeeklySample: (sampleSummary: string) => void;
  handleGenerateWeekly: (e?: React.FormEvent) => void | Promise<void>;
}

export function WeeklyModeFields(props: WeeklyModeFieldsProps) {
  const {
    tanggalMulai,
    tanggalSelesai,
    ringkasanMingguan,
    isLoading,
    isHydrated,
    currentProgramConfig,
    setTanggalMulai,
    setTanggalSelesai,
    setRingkasanMingguan,
    setIsSmartIngestionOpen,
    handleFillWeeklySample,
    handleGenerateWeekly,
  } = props;

  return (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Rentang Tanggal Pekan Ini (Senin – Jumat)</span>
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Narasi Progresif 5 Tahap
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor="tanggal-mulai"
                            className="block text-[11px] text-zinc-500 mb-1"
                          >
                            Tanggal Mulai (Senin)
                          </label>
                          <input
                            id="tanggal-mulai"
                            type="date"
                            value={tanggalMulai}
                            suppressHydrationWarning
                            onChange={(e) => setTanggalMulai(e.target.value)}
                            disabled={isLoading}
                            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="tanggal-selesai"
                            className="block text-[11px] text-zinc-500 mb-1"
                          >
                            Tanggal Selesai (Jumat)
                          </label>
                          <input
                            id="tanggal-selesai"
                            type="date"
                            value={tanggalSelesai}
                            suppressHydrationWarning
                            onChange={(e) => setTanggalSelesai(e.target.value)}
                            disabled={isLoading}
                            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                      </div>

                      {/* Deteksi Hari Libur Nasional Mode Borongan */}
                      {isHydrated && (() => {
                        const weeklyHolidays = checkRangeForHolidays(tanggalMulai, tanggalSelesai);
                        if (weeklyHolidays.length === 0) return null;
                        return (
                          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-[11px]">
                            <strong>Catatan Kalender:</strong> Terdapat {weeklyHolidays.length} hari libur dalam rentang ini ({weeklyHolidays.map((h) => h.formattedDate).join(", ")}).
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="input-ringkasan-mingguan"
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Ringkasan Aktivitas Pekan Ini
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-400 mr-1">Contoh:</span>
                          {currentProgramConfig.weeklyExamples.slice(0, 2).map((ex) => (
                            <button
                              key={ex.label}
                              type="button"
                              onClick={() => handleFillWeeklySample(ex.summary)}
                              className="text-[11px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
                            >
                              {ex.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all">
                        <textarea
                          id="input-ringkasan-mingguan"
                          rows={4}
                          value={ringkasanMingguan}
                          onChange={(e) => setRingkasanMingguan(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              e.preventDefault();
                              if (!isLoading && ringkasanMingguan.trim()) {
                                handleGenerateWeekly();
                              }
                            }
                          }}
                          placeholder="Ceritakan secara santai apa saja yang kamu kerjakan selama 1 pekan ini..."
                          disabled={isLoading}
                          className="w-full bg-transparent p-3.5 pb-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed border-0"
                        />

                        {/* Floating Toolbar inside weekly textarea */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
                          <div className="flex items-center gap-1.5">
                            <VoiceDictationButton
                              onTranscript={(text) =>
                                setRingkasanMingguan((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setIsSmartIngestionOpen(true)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Tarik commit GitHub atau jadwal kalender otomatis"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">GitHub / Agenda</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline-flex items-center gap-1">
                              Tekan <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px]">Enter</kbd>
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Alur 5 hari otomatis disusun AI
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
  );
}
