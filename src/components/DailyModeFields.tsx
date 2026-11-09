"use client";

import React from "react";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  Calendar,
  Camera,
  GitBranch,
  Bookmark,
  QrCode,
} from "lucide-react";
import { getIndonesianHolidayInfo } from "@/src/lib/utils/indonesianHolidays";
import { clearStoredDailyAutoSave } from "@/src/lib/storage/indexedDbStore";
import { toast } from "sonner";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";
import type { TipeKegiatan } from "@/src/lib/exporters/types";
import type { ToneType, LogbookTemplateSnippet } from "@/src/lib/types/modules";
import { TONE_OPTIONS } from "@/src/lib/types/modules";

/** Bidang mode harian: tanggal, foto bukti, watermark, textarea catatan + toolbar.
 * Dipindah verbatim dari DailyFormCard (fase 2) — props diteruskan dari induk. */
export interface DailyModeFieldsProps {
  tone: ToneType;
  tipeKegiatan: TipeKegiatan;
  tanggalHarian: string;
  catatan: string;
  lastAutoSavedAt: string | null;
  fotoBase64: string | null;
  fotoFileName: string | null;
  enableWatermark: boolean;
  detectedPhotoDate: { iso: string; formatted: string } | null;
  isCompressingPhoto: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  templateSnippets: LogbookTemplateSnippet[];
  setTone: (tone: ToneType) => void;
  setTanggalHarian: (value: string) => void;
  setCatatan: (value: string | ((prev: string) => string)) => void;
  setLastAutoSavedAt: (value: string | null) => void;
  setIsQrScannerOpen: (value: boolean) => void;
  setIsSmartIngestionOpen: (value: boolean) => void;
  setIsTemplateLibraryOpen: (value: boolean) => void;
  catatanRef: { current: string };
  lastSavedCatatanRef: { current: string };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleSelectTemplateSnippet: (snippet: string, insertMode?: "replace" | "append") => void;
  handleFillSample: () => void;
  handleToggleWatermark: (newVal: boolean) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDropImage: (e: React.DragEvent<HTMLDivElement>) => void;
  handleRemovePhoto: () => void;
  handleGenerateDaily: (e?: React.FormEvent) => void | Promise<void>;
}

export function DailyModeFields(props: DailyModeFieldsProps) {
  const {
    tone,
    tipeKegiatan,
    tanggalHarian,
    catatan,
    lastAutoSavedAt,
    fotoBase64,
    fotoFileName,
    enableWatermark,
    detectedPhotoDate,
    isCompressingPhoto,
    isLoading,
    isHydrated,
    templateSnippets,
    setTone,
    setTanggalHarian,
    setCatatan,
    setLastAutoSavedAt,
    setIsQrScannerOpen,
    setIsSmartIngestionOpen,
    setIsTemplateLibraryOpen,
    catatanRef,
    lastSavedCatatanRef,
    fileInputRef,
    handleSelectTemplateSnippet,
    handleFillSample,
    handleToggleWatermark,
    handleFileChange,
    handleDropImage,
    handleRemovePhoto,
    handleGenerateDaily,
  } = props;

  return (
                  <div className="space-y-4">
                    {/* Tanggal Kegiatan Harian */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <div>
                          <label htmlFor="input-tanggal-harian" className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block">
                            Tanggal Kegiatan Harian
                          </label>
                          <span className="text-[11px] text-zinc-400">
                            Klik titik di baris kalender atas untuk mengisi hari terlewat
                          </span>
                        </div>
                      </div>
                      <input
                        id="input-tanggal-harian"
                        type="date"
                        value={tanggalHarian}
                        suppressHydrationWarning
                        onChange={(e) => setTanggalHarian(e.target.value)}
                        disabled={isLoading}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                      />
                    </div>

                    {/* Deteksi Hari Libur Nasional & Akhir Pekan Indonesia */}
                    {isHydrated && (() => {
                      const holidayInfo = getIndonesianHolidayInfo(tanggalHarian);
                      if (!holidayInfo.isHoliday && !holidayInfo.isWeekend) return null;
                      return (
                        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs animate-fadeIn">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span><strong>Catatan Kalender:</strong> {holidayInfo.formattedDate} adalah <u>{holidayInfo.description}</u>.</span>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                              Pastikan terdapat lembur kerja atau penugasan resmi pada tanggal ini.
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Hidden File Input for Image Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />

                    {/* Compact Attached Photo Card (if photo selected) */}
                    {fotoBase64 && (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-2.5 flex items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                            {isCompressingPhoto ? (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={fotoBase64}
                                alt="Pratinjau Foto"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {fotoFileName || "Foto Kegiatan Terlampir"}
                              </span>
                            </div>
                            <label className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={enableWatermark}
                                onChange={(e) => handleToggleWatermark(e.target.checked)}
                                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
                              />
                              <span>Watermark Timestamp & Identitas Resmi</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {detectedPhotoDate && detectedPhotoDate.iso !== tanggalHarian && (
                            <button
                              type="button"
                              onClick={() => {
                                setTanggalHarian(detectedPhotoDate.iso);
                                toast.info(`Tanggal logbook diselaraskan ke tanggal foto: ${detectedPhotoDate.iso}`);
                              }}
                              className="text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer"
                            >
                              Samakan ({detectedPhotoDate.iso})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-1 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                            title="Hapus Foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Textarea Catatan Harian with Floating Action Toolbar */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <label
                          htmlFor="input-catatan"
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          3. Catatan Kegiatan
                        </label>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                lastAutoSavedAt
                                  ? "bg-emerald-500"
                                  : "bg-zinc-400 dark:bg-zinc-600"
                              }`}
                            />
                            {lastAutoSavedAt
                              ? `Tersimpan otomatis di IndexedDB • ${lastAutoSavedAt}`
                              : "Auto-save IndexedDB tiap 30 detik"}
                          </span>
                          {catatan.trim() && (
                            <button
                              type="button"
                              onClick={async () => {
                                setCatatan("");
                                catatanRef.current = "";
                                lastSavedCatatanRef.current = "";
                                setLastAutoSavedAt(null);
                                await clearStoredDailyAutoSave();
                                toast.info("Draf catatan harian dibersihkan.");
                              }}
                              className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer underline underline-offset-2"
                              title="Bersihkan catatan dan draf auto-save"
                            >
                              Bersihkan
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropImage}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all overflow-hidden"
                      >
                        <textarea
                          id="input-catatan"
                          rows={4}
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                              e.preventDefault();
                              if (!isLoading && (catatan.trim() || fotoBase64)) {
                                handleGenerateDaily();
                              }
                            }
                          }}
                          placeholder={
                            fotoBase64
                              ? "Catatan santai pelengkap (AI juga akan menganalisis dari fotomu)..."
                              : "Tuliskan aktivitas santaimu hari ini (misal: bantu rekap nota excel dan bereskan packing)..."
                          }
                          disabled={isLoading}
                          className="w-full bg-transparent p-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed border-0 block"
                        />

                        {/* Non-overlapping Action Toolbar below textarea */}
                        <div className="px-3 py-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/90">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <VoiceDictationButton
                              onTranscript={(text) =>
                                setCatatan((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                              }
                            />

                            {/* Upload Foto Action Button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${
                                fotoBase64
                                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                                  : "bg-white dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              }`}
                              title="Unggah Foto Bukti Kegiatan (Vision AI)"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>
                                {fotoBase64 ? "Ganti Foto" : "Unggah Foto"}
                              </span>
                            </button>

                            {/* Smart Import Button */}
                            <button
                              type="button"
                              onClick={() => setIsSmartIngestionOpen(true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Tarik commit GitHub, jadwal kalender (.ics), atau tabel CSV Timesheet"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>GitHub / CSV</span>
                            </button>

                            {/* QR Code Scanner Button */}
                            <button
                              type="button"
                              onClick={() => setIsQrScannerOpen(true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 transition cursor-pointer"
                              title="Pindai QR Dokumen Mentor untuk verifikasi atau presensi cepat"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Scan QR</span>
                            </button>

                            {/* Template Snippet Library Button */}
                            <button
                              type="button"
                              onClick={() => setIsTemplateLibraryOpen(true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 transition cursor-pointer"
                              title="Buka Library Templat Snippet (1-Click Insert)"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Templat</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono hidden sm:inline-flex items-center gap-1">
                              Tekan <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 text-[10px]">Enter</kbd>
                            </span>
                            <button
                              type="button"
                              onClick={handleFillSample}
                              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer px-1.5 py-0.5"
                            >
                              Isi Contoh
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick 1-Click Snippet Pills Strip */}
                      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0 font-medium">
                          <Bookmark className="w-3 h-3 text-indigo-500" />
                          Snippets:
                        </span>

                        {templateSnippets
                          .filter(
                            (t) =>
                              t.category === tipeKegiatan ||
                              t.category === "Umum / Rutinitas" ||
                              t.isCustom
                          )
                          .slice(0, 4)
                          .map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                handleSelectTemplateSnippet(t.content, "replace");
                                toast.success(`Templat "${t.title}" disisipkan!`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-700 transition shrink-0 cursor-pointer"
                              title={`Klik untuk menyisipkan: "${t.content.slice(0, 70)}..."`}
                            >
                              <span>{t.title}</span>
                            </button>
                          ))}

                        <button
                          type="button"
                          onClick={() => setIsTemplateLibraryOpen(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-dashed border-indigo-300 dark:border-indigo-700 transition shrink-0 cursor-pointer"
                          title="Buka semua koleksi templat snippet"
                        >
                          <span>+ Semua ({templateSnippets.length})</span>
                        </button>

                        {catatan.trim() && (
                          <button
                            type="button"
                            onClick={() => setIsTemplateLibraryOpen(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition shrink-0 cursor-pointer"
                            title="Simpan catatan yang sedang kamu ketik ke library templat"
                          >
                            <span>⭐ Simpan Catatan Ini</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Gaya Bahasa (Tone Humanizer) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          4. Gaya Bahasa (Tone Humanizer)
                        </label>
                        <span className="text-[10px] text-zinc-400">
                          Anti-Klise AI
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {TONE_OPTIONS.map((opt) => {
                          const isSelected = tone === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => setTone(opt.value)}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isSelected
                                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 shadow-2xs"
                                  : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                                  {opt.label}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                    isSelected
                                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                                {opt.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
  );
}
