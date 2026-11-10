"use client";

import React, { useState } from "react";
import { LicenseQrisCard } from "./LicenseQrisCard";
import {
  Crown,
  CheckCircle2,
  Zap,
  ShieldCheck,
  QrCode,
  X,
  Loader2,
  Sparkles,
  Award,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { LicenseInfo } from "@/src/lib/types/modules";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivated: (info: LicenseInfo) => void;
  currentLicense?: LicenseInfo | null;
}

const DEMO_PRESET_KEYS = [
  { code: "LMPRO-2026-BERES", tier: "Sultan All-in-One" },
  { code: "LMPRO-SULTAN-99", tier: "Sultan All-in-One" },
  { code: "KKN-DESA-2026", tier: "Sultan All-in-One" },
  { code: "LMPRO-REGULER-2026", tier: "Reguler 3 Bulan" },
];

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  onActivated,
  currentLicense,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<"reguler" | "sultan">("sultan");
  const [inputCode, setInputCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulatingVerify, setIsSimulatingVerify] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<LicenseInfo | null>(currentLicense || null);
  const [copiedAmount, setCopiedAmount] = useState(false);

  if (!isOpen) return null;

  const currentPriceFormatted = selectedPlan === "sultan" ? "Rp49.000" : "Rp25.000";
  const defaultAutoCode =
    selectedPlan === "sultan" ? "LMPRO-SULTAN-99" : "LMPRO-REGULER-2026";

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || inputCode || defaultAutoCode).trim();
    if (!code) {
      setErrorMsg("Mohon masukkan kode lisensi Pro Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/verify-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Kode lisensi tidak valid.");
      }

      setSuccessInfo(json.data);
      onActivated(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan verifikasi.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePaymentVerify = async () => {
    setIsSimulatingVerify(true);
    setErrorMsg(null);
    try {
      // Simulasi delay gateway pembayaran 1.2 detik
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await handleVerify(defaultAutoCode);
    } finally {
      setIsSimulatingVerify(false);
    }
  };

  const copyAmountToClipboard = () => {
    const numericStr = selectedPlan === "sultan" ? "49000" : "25000";
    navigator.clipboard.writeText(numericStr);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
        {/* Header Modal */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
            <Crown className="w-48 h-48" />
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
                <Crown className="w-3.5 h-3.5" />
                <span>LogMagang OS • QRIS Checkout & Pro Licensing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Buka Seluruh Kunci Fitur Tanpa Batas 🚀
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-lg leading-relaxed">
                Tuntaskan logbook harian, konversi 20 SKS, CV ATS, simulasi sidang DPL bersuara, hingga laporan KKN tanpa batasan kuota.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Tampilan Jika Sudah Berhasil Aktivasi */}
          {successInfo ? (
            <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    Lisensi Pro Aktif
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    Paket {successInfo.plan}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Kode: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{successInfo.code}</strong> • Berlaku hingga{" "}
                    <strong>{new Date(successInfo.expiresAt).toLocaleDateString("id-ID", { dateStyle: "long" })}</strong>
                  </p>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3.5 border border-emerald-200/80 dark:border-emerald-800 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">Fitur Tanpa Batas Terbuka:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700 dark:text-slate-300">
                  {successInfo.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Tutup & Mulai Gunakan LogMagang OS
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Pilihan 2 Kartu Paket */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Paket Reguler */}
                <div
                  onClick={() => setSelectedPlan("reguler")}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                    selectedPlan === "reguler"
                      ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 ring-2 ring-indigo-500/30 shadow-md"
                      : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                        Paket Reguler
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                        3 Bulan
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">Rp25.000</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">/ 3 bulan</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        Cocok untuk magang harian santai & anti-nunggak logbook.
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200/80 dark:border-slate-800">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Unlimited</strong> Logbook Harian</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Mode Borongan</strong> (1 Pekan)</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Tone Humanizer Anti-Klise</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* 2. Paket Sultan (Rekomendasi) */}
                <div
                  onClick={() => setSelectedPlan("sultan")}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                    selectedPlan === "sultan"
                      ? "bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 border-amber-500 ring-2 ring-amber-500/30 shadow-lg"
                      : "bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Paket Sultan MBKM</span>
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                        BESTSELLER 🏆
                      </span>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">Rp49.000</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">/ periode</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        Solusi paripurna mahasiswa dari logbook harian sampai sidang A.
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 pt-2 border-t border-amber-200/80 dark:border-amber-800/60">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Semua Fitur Reguler</strong> + Vision Foto</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Ekspor Dokumen <strong>Word, Excel & PPT</strong></span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Matriks Konversi 20 SKS</strong> OBE</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>CV ATS Harvard</strong> & Draf LinkedIn</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Simulasi Sidang DPL</strong> & KKN Tim</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <LicenseQrisCard
                priceFormatted={currentPriceFormatted}
                copiedAmount={copiedAmount}
                isSimulatingVerify={isSimulatingVerify}
                isLoading={isLoading}
                onCopyAmount={copyAmountToClipboard}
                onSimulatePaymentVerify={handleSimulatePaymentVerify}
              />

              {/* Input Kode Lisensi Aktivasi Manual */}
              <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    🔑 Punya Kode Voucher atau Lisensi Khusus dari Kampus/Admin?
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Aktivasi Otomatis
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: LMPRO-2026-BERES"
                    className="flex-1 text-xs sm:text-sm font-mono font-bold uppercase p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerify()}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Aktivasi Kode</span>
                      </>
                    )}
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-2 rounded-lg leading-relaxed">
                    {errorMsg}
                  </p>
                )}

                {/* Preset Coba Demo Cepat untuk Pengujian */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Kode Demo Pengujian Cepat:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_PRESET_KEYS.map((k) => (
                      <button
                        key={k.code}
                        type="button"
                        onClick={() => {
                          setInputCode(k.code);
                          handleVerify(k.code);
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300 font-mono transition cursor-pointer"
                      >
                        {k.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
