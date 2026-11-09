"use client";

import React from "react";

import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Crown,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react";


import { PROGRAM_OPTIONS } from "@/src/lib/config/programOptions";

import type { TipeKegiatan } from "@/src/lib/exporters/types";
import type { ToneType, LogbookTemplateSnippet } from "@/src/lib/types/modules";


import { DailyModeFields } from "@/src/components/DailyModeFields";
import { WeeklyModeFields } from "@/src/components/WeeklyModeFields";
import { MonthlyModeFields } from "@/src/components/MonthlyModeFields";

/**
 * Kartu formulir input logbook (harian / borongan 1 pekan / bulanan).
 * Dipindah verbatim dari app/page.tsx (fase 2) — semua state & handler
 * tetap dimiliki HomePage dan masuk lewat props, jadi perilaku tidak berubah.
 * Satu-satunya penyesuaian: `history` tidak lagi dilewatkan utuh, hanya
 * `historyCount` (jumlah entri) yang dipakai untuk teks basis data historis.
 */
export interface DailyFormCardProps {
  mode: "daily" | "weekly" | "monthly";
  tone: ToneType;
  tipeKegiatan: TipeKegiatan;
  peran: string;
  tanggalHarian: string;
  catatan: string;
  lastAutoSavedAt: string | null;
  fotoBase64: string | null;
  fotoFileName: string | null;
  enableWatermark: boolean;
  detectedPhotoDate: { iso: string; formatted: string } | null;
  isCompressingPhoto: boolean;
  tanggalMulai: string;
  tanggalSelesai: string;
  ringkasanMingguan: string;
  selectedBulan: string;
  monthlyNotes: string;
  isLoading: boolean;
  errorMsg: string | null;
  historyCount: number;
  isHydrated: boolean;
  templateSnippets: LogbookTemplateSnippet[];
  currentProgramConfig: (typeof PROGRAM_OPTIONS)[number];
  isQuotaExhausted: boolean;
  setMode: (mode: "daily" | "weekly" | "monthly") => void;
  setTone: (tone: ToneType) => void;
  setTipeKegiatan: (value: TipeKegiatan) => void;
  setPeran: (value: string) => void;
  setTanggalHarian: (value: string) => void;
  setCatatan: (value: string | ((prev: string) => string)) => void;
  setLastAutoSavedAt: (value: string | null) => void;
  setErrorMsg: (value: string | null) => void;
  setTanggalMulai: (value: string) => void;
  setTanggalSelesai: (value: string) => void;
  setRingkasanMingguan: (value: string | ((prev: string) => string)) => void;
  setSelectedBulan: (value: string) => void;
  setMonthlyNotes: (value: string | ((prev: string) => string)) => void;
  setIsQrScannerOpen: (value: boolean) => void;
  setIsSmartIngestionOpen: (value: boolean) => void;
  setIsTemplateLibraryOpen: (value: boolean) => void;
  catatanRef: { current: string };
  lastSavedCatatanRef: { current: string };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSelectTemplateSnippet: (
    snippet: string,
    insertMode?: "replace" | "append"
  ) => void;
  onFillSample: () => void;
  onFillWeeklySample: (sampleSummary: string) => void;
  onToggleWatermark: (newVal: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDropImage: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemovePhoto: () => void;
  onGenerateDaily: (e?: React.FormEvent) => void | Promise<void>;
  onGenerateWeekly: (e?: React.FormEvent) => void | Promise<void>;
  onGenerateMonthly: (e?: React.FormEvent) => void | Promise<void>;
}

export function DailyFormCard(props: DailyFormCardProps) {
  const {
    mode,
    tone,
    tipeKegiatan,
    peran,
    tanggalHarian,
    catatan,
    lastAutoSavedAt,
    fotoBase64,
    fotoFileName,
    enableWatermark,
    detectedPhotoDate,
    isCompressingPhoto,
    tanggalMulai,
    tanggalSelesai,
    ringkasanMingguan,
    selectedBulan,
    monthlyNotes,
    isLoading,
    errorMsg,
    historyCount,
    isHydrated,
    templateSnippets,
    currentProgramConfig,
    isQuotaExhausted,
    setMode,
    setTone,
    setTipeKegiatan,
    setPeran,
    setTanggalHarian,
    setCatatan,
    setLastAutoSavedAt,
    setErrorMsg,
    setTanggalMulai,
    setTanggalSelesai,
    setRingkasanMingguan,
    setSelectedBulan,
    setMonthlyNotes,
    setIsQrScannerOpen,
    setIsSmartIngestionOpen,
    setIsTemplateLibraryOpen,
    catatanRef,
    lastSavedCatatanRef,
    fileInputRef,
    onSelectTemplateSnippet: handleSelectTemplateSnippet,
    onFillSample: handleFillSample,
    onFillWeeklySample: handleFillWeeklySample,
    onToggleWatermark: handleToggleWatermark,
    onFileChange: handleFileChange,
    onDropImage: handleDropImage,
    onRemovePhoto: handleRemovePhoto,
    onGenerateDaily: handleGenerateDaily,
    onGenerateWeekly: handleGenerateWeekly,
    onGenerateMonthly: handleGenerateMonthly,
  } = props;

  return (
            <section id="daily-form-card" className="bg-white dark:bg-zinc-900/60 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
              {/* Segmented Mode Switcher (Harian | Borongan 1 Pekan | Laporan Bulanan Monev) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("daily");
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      mode === "daily"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Mode Harian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("weekly");
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      mode === "weekly"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Mode Borongan 1 Pekan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("monthly");
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      mode === "monthly"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Laporan Bulanan (Monev)</span>
                  </button>
                </div>

                <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                  Standar MBKM & Taksonomi Bloom
                </span>
              </div>

              <form
                onSubmit={
                  mode === "daily"
                    ? handleGenerateDaily
                    : mode === "weekly"
                    ? handleGenerateWeekly
                    : handleGenerateMonthly
                }
                className="space-y-4"
              >
                {/* 1. Pilihan Program Kegiatan */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    1. Program Kegiatan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROGRAM_OPTIONS.map((prog) => {
                      const Icon = prog.icon;
                      const isSelected = tipeKegiatan === prog.value;
                      return (
                        <button
                          key={prog.value}
                          type="button"
                          onClick={() => {
                            setTipeKegiatan(prog.value);
                            setErrorMsg(null);
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs font-medium"
                              : "bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{prog.label}</div>
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400 dark:text-zinc-500"
                              }`}
                            >
                              {prog.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Input Peran / Posisi */}
                <div>
                  <label
                    htmlFor="input-peran"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    2. Peran / Posisi
                  </label>
                  <input
                    id="input-peran"
                    type="text"
                    value={peran}
                    onChange={(e) => setPeran(e.target.value)}
                    placeholder='Contoh: "Social Media Specialist", "Staff Operasional"'
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-60 transition"
                  />

                  {/* Saran Peran Cepat */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400 mr-0.5">
                      Contoh:
                    </span>
                    {currentProgramConfig.roleExamples.map((roleSample) => (
                      <button
                        key={roleSample}
                        type="button"
                        onClick={() => setPeran(roleSample)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          peran === roleSample
                            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                      >
                        {roleSample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KONDISIONAL: MODE HARIAN */}
                {mode === "daily" ? (
<DailyModeFields
                      tone={tone}
                      tipeKegiatan={tipeKegiatan}
                      tanggalHarian={tanggalHarian}
                      catatan={catatan}
                      lastAutoSavedAt={lastAutoSavedAt}
                      fotoBase64={fotoBase64}
                      fotoFileName={fotoFileName}
                      enableWatermark={enableWatermark}
                      detectedPhotoDate={detectedPhotoDate}
                      isCompressingPhoto={isCompressingPhoto}
                      isLoading={isLoading}
                      isHydrated={isHydrated}
                      templateSnippets={templateSnippets}
                      setTone={setTone}
                      setTanggalHarian={setTanggalHarian}
                      setCatatan={setCatatan}
                      setLastAutoSavedAt={setLastAutoSavedAt}
                      setIsQrScannerOpen={setIsQrScannerOpen}
                      setIsSmartIngestionOpen={setIsSmartIngestionOpen}
                      setIsTemplateLibraryOpen={setIsTemplateLibraryOpen}
                      catatanRef={catatanRef}
                      lastSavedCatatanRef={lastSavedCatatanRef}
                      fileInputRef={fileInputRef}
                      handleSelectTemplateSnippet={handleSelectTemplateSnippet}
                      handleFillSample={handleFillSample}
                      handleToggleWatermark={handleToggleWatermark}
                      handleFileChange={handleFileChange}
                      handleDropImage={handleDropImage}
                      handleRemovePhoto={handleRemovePhoto}
                      handleGenerateDaily={handleGenerateDaily}
                    />
                ) : mode === "weekly" ? (
                  /* KONDISIONAL: MODE BORONGAN 1 PEKAN */
                  <WeeklyModeFields
                      tanggalMulai={tanggalMulai}
                      tanggalSelesai={tanggalSelesai}
                      ringkasanMingguan={ringkasanMingguan}
                      isLoading={isLoading}
                      isHydrated={isHydrated}
                      currentProgramConfig={currentProgramConfig}
                      setTanggalMulai={setTanggalMulai}
                      setTanggalSelesai={setTanggalSelesai}
                      setRingkasanMingguan={setRingkasanMingguan}
                      setIsSmartIngestionOpen={setIsSmartIngestionOpen}
                      handleFillWeeklySample={handleFillWeeklySample}
                      handleGenerateWeekly={handleGenerateWeekly}
                    />
                ) : (
                  /* KONDISIONAL: MODE LAPORAN BULANAN (MONEV) */
                  <MonthlyModeFields
                      catatan={catatan}
                      selectedBulan={selectedBulan}
                      monthlyNotes={monthlyNotes}
                      isLoading={isLoading}
                      historyCount={historyCount}
                      setSelectedBulan={setSelectedBulan}
                      setMonthlyNotes={setMonthlyNotes}
                      handleGenerateMonthly={handleGenerateMonthly}
                    />
                )}

                {/* Pesan Error */}
                {errorMsg && (
                  <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <div className="flex-1">
                      <p className="font-medium">Perhatian</p>
                      <p className="mt-0.5 text-rose-600 dark:text-rose-400/90">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* Tombol Generate Logbook: Solid Monokromatik Bergaya Vercel / Linear */}
                <button
                  type="submit"
                  disabled={isLoading || isQuotaExhausted}
                  className={`w-full font-medium px-5 py-2.5 rounded-lg shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm ${
                    isQuotaExhausted
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {mode === "monthly"
                          ? "Menyintesis Laporan Bulanan..."
                          : mode === "weekly"
                            ? "Menyusun Narasi 1 Pekan..."
                            : fotoBase64
                              ? "Menganalisis Foto & Menyusun Logbook..."
                              : "Menyusun Logbook..."}
                      </span>
                    </>
                  ) : isQuotaExhausted ? (
                    <>
                      <Crown className="w-4 h-4 text-zinc-400" />
                      <span>Kuota Gratis Habis — Upgrade ke Pro</span>
                    </>
                  ) : mode === "monthly" ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Sintesis Laporan Bulanan (Monev)</span>
                    </>
                  ) : mode === "weekly" ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Logbook 1 Pekan</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Logbook Resmi</span>
                    </>
                  )}
                </button>
              </form>
            </section>
  );
}
