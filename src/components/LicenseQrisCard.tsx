"use client";

import React from "react";
import { Check, Copy, Loader2, ShieldCheck } from "lucide-react";

/**
 * Kartu QRIS dinamis di dalam modal lisensi: nominal, pola QR SVG,
 * instruksi pembayaran, dan tombol verifikasi instan. Sebelumnya
 * blok inline di LicenseModal — dipindah verbatim.
 */

export interface LicenseQrisCardProps {
  priceFormatted: string;
  copiedAmount: boolean;
  isSimulatingVerify: boolean;
  isLoading: boolean;
  onCopyAmount: () => void;
  onSimulatePaymentVerify: () => void;
}

export const LicenseQrisCard: React.FC<LicenseQrisCardProps> = ({
  priceFormatted,
  copiedAmount,
  isSimulatingVerify,
  isLoading,
  onCopyAmount,
  onSimulatePaymentVerify,
}) => {
  return (
  <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-4">
    {/* Header QRIS Resmi */}
    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-xs tracking-wider">
          QRIS
        </span>
        <span className="text-xs font-semibold text-slate-300">
          Standar Pembayaran Digital Nasional
        </span>
      </div>
      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
        Instant Auto-Verify
      </span>
    </div>

    <div className="flex flex-col sm:flex-row items-center gap-5">
      {/* Visual QR Code SVG Interaktif */}
      <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200 shrink-0 flex flex-col items-center">
        {/* SVG QR Code Pattern */}
        <div className="relative w-44 h-44 bg-white flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full text-slate-950"
            shapeRendering="crispEdges"
          >
            {/* Background */}
            <rect width="160" height="160" fill="white" />

            {/* Top-Left Finder */}
            <rect x="10" y="10" width="35" height="35" fill="black" />
            <rect x="15" y="15" width="25" height="25" fill="white" />
            <rect x="20" y="20" width="15" height="15" fill="black" />

            {/* Top-Right Finder */}
            <rect x="115" y="10" width="35" height="35" fill="black" />
            <rect x="120" y="15" width="25" height="25" fill="white" />
            <rect x="125" y="20" width="15" height="15" fill="black" />

            {/* Bottom-Left Finder */}
            <rect x="10" y="115" width="35" height="35" fill="black" />
            <rect x="15" y="120" width="25" height="25" fill="white" />
            <rect x="20" y="125" width="15" height="15" fill="black" />

            {/* Alignment pattern */}
            <rect x="115" y="115" width="25" height="25" fill="black" />
            <rect x="120" y="120" width="15" height="15" fill="white" />
            <rect x="125" y="125" width="5" height="5" fill="black" />

            {/* Timing Patterns */}
            <line x1="48" y1="22" x2="110" y2="22" stroke="black" strokeWidth="3" strokeDasharray="5,5" />
            <line x1="22" y1="48" x2="22" y2="110" stroke="black" strokeWidth="3" strokeDasharray="5,5" />

            {/* Realistic QR Data Modules */}
            <rect x="52" y="30" width="8" height="8" fill="black" />
            <rect x="68" y="30" width="8" height="8" fill="black" />
            <rect x="84" y="30" width="8" height="8" fill="black" />
            <rect x="100" y="30" width="8" height="8" fill="black" />
            <rect x="52" y="46" width="16" height="8" fill="black" />
            <rect x="76" y="46" width="8" height="8" fill="black" />
            <rect x="92" y="46" width="16" height="8" fill="black" />
            <rect x="30" y="52" width="8" height="16" fill="black" />
            <rect x="30" y="76" width="8" height="8" fill="black" />
            <rect x="30" y="92" width="8" height="16" fill="black" />
            <rect x="122" y="52" width="8" height="16" fill="black" />
            <rect x="138" y="52" width="8" height="8" fill="black" />
            <rect x="122" y="76" width="8" height="8" fill="black" />
            <rect x="138" y="84" width="8" height="16" fill="black" />
            <rect x="52" y="106" width="8" height="8" fill="black" />
            <rect x="68" y="106" width="16" height="8" fill="black" />
            <rect x="92" y="106" width="8" height="8" fill="black" />
            <rect x="108" y="106" width="8" height="8" fill="black" />
            <rect x="52" y="122" width="16" height="8" fill="black" />
            <rect x="76" y="122" width="8" height="8" fill="black" />
            <rect x="92" y="122" width="16" height="8" fill="black" />
            <rect x="52" y="138" width="8" height="8" fill="black" />
            <rect x="68" y="138" width="8" height="8" fill="black" />
            <rect x="84" y="138" width="8" height="8" fill="black" />
            <rect x="100" y="138" width="8" height="8" fill="black" />

            {/* Central Logo Overlay */}
            <rect x="64" y="64" width="32" height="32" rx="4" fill="#dc2626" />
            <text
              x="80"
              y="84"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="system-ui, sans-serif"
            >
              QRIS
            </text>
          </svg>
        </div>

        <span className="text-[10px] font-mono font-bold text-slate-800 mt-1">
          NMID: ID10202688990142
        </span>
      </div>

      {/* Instruksi & Verifikasi QRIS */}
      <div className="flex-1 space-y-3 text-center sm:text-left">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block">
            Merchant Resmi:
          </span>
          <h4 className="text-sm font-bold text-white">
            LOGMAGANG OS ACADEMIC MERCHANTS
          </h4>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
          <span className="text-[11px] text-slate-400 block">
            Total Nominal Transfer Pas:
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-2xl font-black text-amber-400 tracking-tight">
              {priceFormatted}
            </span>
            <button
              type="button"
              onClick={onCopyAmount}
              className="p-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition cursor-pointer"
              title="Salin nominal"
            >
              {copiedAmount ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Scan QR di atas dari aplikasi Mobile Banking atau e-Wallet mana pun.
          </p>
        </div>

        {/* Supported Banks & e-Wallets badges */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 text-[10px] font-bold text-slate-300">
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">BCA</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Mandiri</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">BRI</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">BNI</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-400">GoPay</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-400">OVO</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-400">DANA</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-orange-400">ShopeePay</span>
        </div>

        {/* Tombol Verifikasi Pembayaran Instan */}
        <button
          type="button"
          onClick={onSimulatePaymentVerify}
          disabled={isSimulatingVerify || isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSimulatingVerify ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menghubungi Gateway QRIS & Memverifikasi...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>⚡ Sudah Scan? Verifikasi Pembayaran Sekarang</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
  );
};
