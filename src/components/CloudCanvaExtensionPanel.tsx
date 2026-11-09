"use client";

import React from "react";
import {
  Copy,
  Check,
  Zap,
  Cloud,
  Palette,
  X,
  ExternalLink,
  Puzzle,
  Download,
  FileJson,
  HelpCircle,
} from "lucide-react";

/** Integrasi cloud & Canva dan kartu integrasi ekstensi browser auto-fill.
 * Dipindah verbatim dari ExportHub (fase 2) — props diteruskan dari induk. */
export interface CloudCanvaExtensionPanelProps {
  canvaBannerOpen: boolean;
  copiedCanvaDraft: boolean;
  copiedExtensionJson: boolean;
  setCanvaBannerOpen: (value: boolean) => void;
  setCopiedCanvaDraft: (value: boolean) => void;
  setIsExtensionModalOpen: (value: boolean) => void;
  handleSyncDirectToExtension: () => void;
  handleOpenDriveSyncModal: () => void;
  buildCanvaPosterDraft: () => string;
  handleOpenCanvaPoster: () => void | Promise<void>;
  handleCopyExtensionJson: () => void | Promise<void>;
  handleDownloadExtension: () => void;
}

export function CloudCanvaExtensionPanel(props: CloudCanvaExtensionPanelProps) {
  const {
    canvaBannerOpen,
    copiedCanvaDraft,
    copiedExtensionJson,
    setCanvaBannerOpen,
    setCopiedCanvaDraft,
    setIsExtensionModalOpen,
    handleSyncDirectToExtension,
    handleOpenDriveSyncModal,
    buildCanvaPosterDraft,
    handleOpenCanvaPoster,
    handleCopyExtensionJson,
    handleDownloadExtension,
  } = props;

  return (
    <>
            {/* Grid Tombol Integrasi Cloud & Canva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenDriveSyncModal}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium text-xs transition cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-zinc-500" />
                <span>Sync to Google Drive / Sheets</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCanvaPoster}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium text-xs transition cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                <span>Buat Poster di Canva</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

            {/* Panel Draf Teks Luaran Canva */}
            {canvaBannerOpen && (
              <div className="rounded-xl bg-violet-50/90 border border-violet-200 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-violet-900 flex items-center gap-1.5">
                      🎨 Draf Teks Luaran Poster Siap Di-Paste ke Canva!
                    </span>
                    <p className="text-[11px] text-violet-700 mt-0.5">
                      Tab Canva telah dibuka. Draf ringkasan poster di bawah ini
                      sudah otomatis disalin ke clipboard Anda (tinggal tekan{" "}
                      <strong>Ctrl+V</strong> di desain Canva).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCanvaBannerOpen(false)}
                    className="text-violet-500 hover:text-violet-800 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <pre className="text-[11px] bg-white/90 border border-violet-200 rounded-lg p-3 text-slate-700 whitespace-pre-wrap font-sans max-h-44 overflow-y-auto">
                  {buildCanvaPosterDraft()}
                </pre>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        buildCanvaPosterDraft()
                      );
                      setCopiedCanvaDraft(true);
                      setTimeout(() => setCopiedCanvaDraft(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {copiedCanvaDraft ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Draf Poster Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Ulang Draf Poster</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Kartu Integrasi Ekstensi Browser Auto-Fill Portal Kampus */}
            <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-700/50 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white">
                        Ekstensi Auto-Fill Portal Kampus
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Chrome / Edge / Opera V3
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      Isi form logbook di portal Kampus Merdeka / SIM KKN secara otomatis dengan 1x klik.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer self-start sm:self-auto"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Panduan Pasang (3 Langkah)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. Sync Langsung ke Ekstensi (Zero-Click Bridge) */}
                <button
                  type="button"
                  onClick={handleSyncDirectToExtension}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-200" />
                  <span>⚡ Kirim ke Ekstensi (1-Click Sync)</span>
                </button>

                {/* 2. Unduh Ekstensi Auto-Fill */}
                <button
                  type="button"
                  onClick={handleDownloadExtension}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>🧩 Unduh Ekstensi (.zip)</span>
                </button>

                {/* 3. Salin Data untuk Ekstensi */}
                <button
                  type="button"
                  onClick={handleCopyExtensionJson}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs transition cursor-pointer"
                >
                  {copiedExtensionJson ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Data JSON Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <FileJson className="w-4 h-4 text-indigo-300" />
                      <span>📋 Salin Data Manual</span>
                    </>
                  )}
                </button>
              </div>
            </div>
    </>
  );
}
