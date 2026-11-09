"use client";


import React from "react";
import { Check, Copy, Download, Puzzle, X } from "lucide-react";

/** Modal panduan pasang ekstensi auto-fill (3 langkah). Sebelumnya JSX inline di app/page.tsx. */
interface ExtensionGuideModalProps {
  onClose: () => void;
  onCopyExtensionJson: () => void;
  copiedExtensionJson: boolean;
}

export function ExtensionGuideModal(props: ExtensionGuideModalProps) {
  const {
    onClose,
    onCopyExtensionJson,
    copiedExtensionJson,
  } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Cara Pasang Ekstensi Auto-Fill
              </h3>
              <p className="text-xs text-slate-500">
                3 Langkah Mudah untuk Google Chrome, Edge & Opera (Manifest V3)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Langkah Instalasi */}
        <div className="space-y-3 text-xs text-slate-700">
          <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <span>Unduh & Ekstrak File Ekstensi (.zip)</span>
            </div>
            <p className="pl-7 text-slate-600 leading-relaxed">
              Unduh paket ekstensi dengan tombol di bawah, lalu ekstrak file zip tersebut ke folder komputer Anda (misal ke folder <code>Dokumen/extension</code>).
            </p>
          </div>

          <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <span>Buka chrome://extensions & Aktifkan Developer Mode</span>
            </div>
            <p className="pl-7 text-slate-600 leading-relaxed">
              Buka tab baru di browser Anda, ketik <code>chrome://extensions</code> (atau <code>edge://extensions</code> di Edge), lalu aktifkan tombol switch <strong>Developer mode (Mode Pengembang)</strong> di sudut kanan atas.
            </p>
          </div>

          <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <span>Klik "Load unpacked" & Pilih Folder Ekstensi</span>
            </div>
            <p className="pl-7 text-slate-600 leading-relaxed">
              Klik tombol <strong>Load unpacked (Muat yang belum dibongkar)</strong> di kiri atas, lalu pilih folder <code>extension</code> hasil ekstrak. Selesai! Tombol mengambang 📄 <strong>Auto-Fill LogMagang</strong> akan langsung muncul di portal kampus Anda.
            </p>
          </div>
        </div>

        {/* Cara Pemakaian Singkat */}
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <span className="font-bold block">💡 Cara Mengisi Form di Portal Kampus:</span>
          <p className="leading-relaxed">
            1. Klik <strong>"Salin Data untuk Ekstensi"</strong> di bawah.<br />
            2. Buka formulir logbook di portal kampus Anda (misal Kampus Merdeka atau SIM KKN).<br />
            3. Buka popup ekstensi LogMagang atau klik tombol melayang 📄 <strong>Auto-Fill LogMagang</strong> di pojok kanan bawah halaman portal untuk mengisi otomatis seluruh kolom!
          </p>
        </div>

        {/* Tombol Aksi di Modal */}
        <div className="space-y-2 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="/api/download-extension"
              download="logmagang-autofill-extension.zip"
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Ekstensi (.zip)</span>
            </a>

            <button
              type="button"
              onClick={onCopyExtensionJson}
              className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
            >
              {copiedExtensionJson ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Data JSON Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Data Logbook (JSON)</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
