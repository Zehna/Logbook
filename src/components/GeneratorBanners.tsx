"use client";


import React from "react";
import {
  Crown,
  ExternalLink,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { AttendanceTracker } from "@/src/components/AttendanceTracker";
import type { AppUserProfile } from "@/src/lib/firebase/config";
import { LicenseInfo } from "@/src/lib/types/modules";
import { LogbookEntry } from "@/src/lib/exporters/types";
import { OfflineDraftItem } from "@/src/lib/storage/indexedDbStore";
import { MAX_FREE_QUOTA } from "@/src/lib/config/storageKeys";

/**
 * Banner login, AttendanceTracker, kartu paywall Pro, dan banner
 * draf offline. Sebelumnya JSX inline di app/page.tsx (tab generator).
 */
interface GeneratorBannersProps {
  currentUserProfile: AppUserProfile | null;
  isHydrated: boolean;
  onOpenAuthModal: () => void;
  history: LogbookEntry[];
  isPro: boolean;
  remainingQuota: number;
  licenseDetails: LicenseInfo | null;
  onOpenLicenseModal: () => void;
  onOpenQrScanner: () => void;
  onOpenCalendarHub: (tab?: "calendar" | "competency" | "signature") => void;
  onBackfillDate: (isoDate: string, displayDate: string) => void;
  isQuotaExhausted: boolean;
  paywallRef: React.RefObject<HTMLDivElement | null>;
  onResetQuota: () => void;
  inlineLicenseCode: string;
  onInlineLicenseCodeChange: (code: string) => void;
  onVerifyInlineLicense: (code?: string) => void;
  isInlineVerifying: boolean;
  inlineLicenseError: string | null;
  offlineDrafts: OfflineDraftItem[];
  isOnline: boolean;
  onProcessOfflineDrafts: () => void;
  onClearOfflineDrafts: () => void;
}

export function GeneratorBanners(props: GeneratorBannersProps) {
  const {
    currentUserProfile,
    isHydrated,
    onOpenAuthModal,
    history,
    isPro,
    remainingQuota,
    licenseDetails,
    onOpenLicenseModal,
    onOpenQrScanner,
    onOpenCalendarHub,
    onBackfillDate,
    isQuotaExhausted,
    paywallRef,
    onResetQuota,
    inlineLicenseCode,
    onInlineLicenseCodeChange,
    onVerifyInlineLicense,
    isInlineVerifying,
    inlineLicenseError,
    offlineDrafts,
    isOnline,
    onProcessOfflineDrafts,
    onClearOfflineDrafts,
  } = props;

  return (
<>
        {/* Banner Ajakan Masuk / Sinkronisasi Cloud Firestore jika Belum Login */}
        {!currentUserProfile && isHydrated && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-xs shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Sinkronkan Identitas Mahasiswa & Logbook ke Cloud Database
                </p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Masuk dengan akun Google untuk menyimpan profil dan riwayat logbook secara aman di Firestore.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenAuthModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-2xs shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          </div>
        )}

        {/* Attendance Tracker & Heatmap Kehadiran 900 Jam MBKM (GitHub/Linear Strip Style) */}
        <AttendanceTracker
          history={history}
          isPro={isPro}
          remainingQuota={remainingQuota}
          maxFreeQuota={MAX_FREE_QUOTA}
          planName={
            licenseDetails?.tier === "sultan"
              ? "Sultan Pro MBKM"
              : licenseDetails?.plan || "Member Pro 3 Bulan"
          }
          onOpenUpgradeModal={() => onOpenLicenseModal()}
          onOpenQrScanner={() => onOpenQrScanner()}
          onOpenCalendarHub={onOpenCalendarHub}
          onSelectDateToBackfill={onBackfillDate}
        />

        {/* Kartu Ajakan Aktivasi Langganan (Ditampilkan saat kuota 3x habis) */}
        {isHydrated && isQuotaExhausted && (
          <section
            ref={paywallRef}
            className="rounded-xl bg-zinc-900 text-white p-5 sm:p-6 border border-zinc-800 shadow-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium">
                <Crown className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kuota Gratis 3/3 Telah Terpakai</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLicenseModal()}
                  className="text-xs text-zinc-300 hover:text-white underline cursor-pointer"
                >
                  Lihat Detail Paket
                </button>
                <span className="text-zinc-600">•</span>
                <button
                  type="button"
                  onClick={onResetQuota}
                  title="Reset kuota gratis untuk keperluan pengujian"
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Demo
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Upgrade ke LogMagang Pro
              </h2>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xl">
                Buka akses tanpa batas untuk logbook harian, mode borongan, konversi SKS, dan ekspor dokumen resmi:
              </p>
            </div>

            {/* 2 Pilihan Kartu Paket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Paket Reguler */}
              <div className="rounded-lg p-3.5 bg-zinc-800/60 border border-zinc-700/80 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      Paket Reguler Magang
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
                      3 Bulan
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">Rp25.000</span>
                    <span className="text-xs text-zinc-400"> / periode</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Ideal untuk logbook harian rutin dan bebas tugas nunggak.
                  </p>
                </div>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    "Halo Admin LogMagang! Saya ingin beli Paket Reguler Magang (Rp25.000) via QRIS."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-md bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-xs text-center border border-zinc-600 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Beli via QRIS (Rp25.000)</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </div>

              {/* Paket Sultan */}
              <div className="rounded-lg p-3.5 bg-zinc-800/90 border border-zinc-600 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Paket Sultan Lulus MBKM</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 font-semibold">
                      Full Fitur
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">Rp49.000</span>
                    <span className="text-xs text-zinc-400"> / periode</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Seluruh fitur OS lengkap: logbook, konversi SKS, CV ATS, hingga sidang.
                  </p>
                </div>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    "Halo Admin LogMagang! Saya ingin beli Paket Sultan Lulus MBKM (Rp49.000) via QRIS."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs text-center transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <span>Beli via QRIS (Rp49.000)</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </div>
            </div>

            {/* Form Input Kode Lisensi Langsung */}
            <div className="rounded-lg p-3 bg-zinc-800/40 border border-zinc-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sudah punya lisensi? Masukkan kode:</span>
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inlineLicenseCode}
                  onChange={(e) => onInlineLicenseCodeChange(e.target.value.toUpperCase())}
                  placeholder="Contoh: LMPRO-2026-BERES"
                  className="flex-1 text-xs font-mono font-medium uppercase p-2 rounded-md border border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => onVerifyInlineLicense()}
                  disabled={isInlineVerifying}
                  className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                >
                  {isInlineVerifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                      <span>Verifikasi...</span>
                    </>
                  ) : (
                    <span>Aktivasi</span>
                  )}
                </button>
              </div>

              {inlineLicenseError && (
                <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 p-2 rounded-md">
                  {inlineLicenseError}
                </p>
              )}

              {/* Preset Kode Demo Cepat untuk Pengujian */}
              <div className="pt-1.5 border-t border-zinc-800 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-zinc-500 mr-1">
                  Kode Demo:
                </span>
                {["LMPRO-2026-BERES", "LMPRO-SULTAN-99", "KKN-DESA-2026"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onInlineLicenseCodeChange(code);
                      onVerifyInlineLicense(code);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono border border-zinc-700 transition cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Banner Antrean Draf Offline untuk Mahasiswa KKN di Daerah Pelosok */}
        {offlineDrafts.length > 0 && isOnline && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🌐</span>
              <div>
                <span className="font-semibold">Anda kembali online.</span>
                <span className="ml-1 text-amber-800 dark:text-amber-300">
                  Terdapat {offlineDrafts.length} draf logbook offline.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onProcessOfflineDrafts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs cursor-pointer transition shadow-2xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Generate Sekarang</span>
              </button>
              <button
                type="button"
                onClick={onClearOfflineDrafts}
                className="px-2.5 py-1.5 rounded-lg hover:bg-amber-200/70 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-medium text-xs cursor-pointer transition"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="flex items-center gap-2 p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 text-xs">
            <span className="text-sm">⚠️</span>
            <span>
              <strong>Mode Offline Aktif:</strong> Tidak ada koneksi internet. Catatan Anda akan otomatis disimpan sebagai draf offline aman di IndexedDB perangkat.
            </span>
          </div>
        )}
</>
  );
}
