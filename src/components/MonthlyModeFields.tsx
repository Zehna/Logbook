"use client";

import React from "react";
import {
  BookOpen,
  BarChart3,
} from "lucide-react";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";

/** Bidang mode laporan bulanan (Monev): periode bulan, catatan bulanan + basis data historis.
 * Dipindah verbatim dari DailyFormCard (fase 2) — props diteruskan dari induk. */
export interface MonthlyModeFieldsProps {
  catatan: string;
  selectedBulan: string;
  monthlyNotes: string;
  isLoading: boolean;
  historyCount: number;
  setSelectedBulan: (value: string) => void;
  setMonthlyNotes: (value: string | ((prev: string) => string)) => void;
  handleGenerateMonthly: (e?: React.FormEvent) => void | Promise<void>;
}

export function MonthlyModeFields(props: MonthlyModeFieldsProps) {
  const {
    catatan,
    selectedBulan,
    monthlyNotes,
    isLoading,
    historyCount,
    setSelectedBulan,
    setMonthlyNotes,
    handleGenerateMonthly,
  } = props;

  return (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Pilih Target Periode Bulan Pelaporan</span>
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Standar Monev MBKM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Bulan 1 (Pekan 1-4)",
                          "Bulan 2 (Pekan 5-8)",
                          "Mid-term (Tengah Periode)",
                          "Bulan 3 (Pekan 9-12)",
                          "Bulan 4 (Pekan 13-16)",
                        ].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBulan(b)}
                            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                              selectedBulan === b
                                ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-2xs"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60"
                            }`}
                          >
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                              {b.split(" ")[0]} {b.split(" ")[1] || ""}
                            </span>
                            <span className="text-[10px] text-zinc-500 mt-1">
                              {b.includes("(") ? b.substring(b.indexOf("(") + 1, b.indexOf(")")) : "Evaluasi"}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-[11px] text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-zinc-500" />
                          <span>
                            <strong>Basis Data Historis:</strong> Menyintesis {historyCount} entri riwayat logbook aktif.
                          </span>
                        </div>
                        {historyCount === 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            (Belum ada riwayat harian tersimpan)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="input-catatan-bulanan"
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Fokus Utama / Catatan Tambahan Laporan Kemajuan (Opsional)
                        </label>
                        <span className="text-[11px] text-zinc-400">
                          Milestone & Target IKU
                        </span>
                      </div>

                      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all">
                        <textarea
                          id="input-catatan-bulanan"
                          rows={4}
                          value={monthlyNotes}
                          onChange={(e) => setMonthlyNotes(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              e.preventDefault();
                              if (!isLoading) {
                                handleGenerateMonthly();
                              }
                            }
                          }}
                          placeholder="Tambahkan catatan khusus, misal: 'Fokus bulan ini menyelesaikan modul backend dan integrasi gateway' atau biarkan kosong agar AI merangkum seluruh logbook..."
                          disabled={isLoading}
                          className="w-full bg-transparent p-3.5 pb-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed border-0"
                        />

                        {/* Floating Toolbar inside monthly textarea */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
                          <div className="flex items-center gap-1.5">
                            <VoiceDictationButton
                              onTranscript={(text) =>
                                setMonthlyNotes((prev) =>
                                  prev ? `${prev} ${text}` : text
                                )
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline-flex items-center gap-1">
                              Tekan <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px]">Enter</kbd>
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Merangkum IKU, Milestone, Evaluasi & Target 4 Pekan
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
  );
}
