"use client";


import React from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { StorageEstimateInfo } from "@/src/lib/storage/indexedDbStore";
import { MAX_FREE_QUOTA } from "@/src/lib/config/storageKeys";

/** Footer. Sebelumnya JSX inline di app/page.tsx. */
interface AppFooterProps {
  storageInfo: StorageEstimateInfo | null;
  isHydrated: boolean;
  usedQuota: number;
  isPro: boolean;
  onResetQuota: () => void;
}

export function AppFooter(props: AppFooterProps) {
  const {
    storageInfo,
    isHydrated,
    usedQuota,
    isPro,
    onResetQuota,
  } = props;

  return (
  <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-4 text-center text-xs text-slate-500">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <p className="font-medium text-slate-600">
          © {new Date().getFullYear()} LogMagang OS — Ekosistem Terpadu MBKM, MSIB & KKN
        </p>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{storageInfo?.statusLabel || "💾 IndexedDB Engine Aktif • Bebas Limit 5MB"}</span>
          {storageInfo?.isSupported && (
            <span className="text-[10px] text-emerald-600 font-mono">
              ({storageInfo.usedFormatted} terpakai)
            </span>
          )}
        </span>
      </div>
      {isHydrated && (usedQuota > 0 || isPro) && (
        <button
          type="button"
          onClick={onResetQuota}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 transition cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>
            Reset Status Kuota Lokal ({usedQuota}/{MAX_FREE_QUOTA})
          </span>
        </button>
      )}
    </div>
  </footer>
  );
}
