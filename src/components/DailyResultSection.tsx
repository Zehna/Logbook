import type { RefObject } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Eye, ImageIcon } from "lucide-react";
import { SECTIONS_CONFIG } from "@/src/lib/config/sections";
import type { LogbookResult } from "@/src/lib/exporters/types";

interface DailyResultSectionProps {
  result: LogbookResult;
  resultPhoto: string | null;
  tipeKegiatan: string;
  peran: string;
  copiedAll: boolean;
  copiedSection: string | null;
  collapsedSections: Record<string, boolean>;
  areAllSectionsCollapsed: boolean;
  setAreAllSectionsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  setCollapsedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onCopyAll: () => void;
  onCopySection: (key: keyof LogbookResult, title: string) => void;
  onOpenLivePreview: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
}

/** Hasil logbook harian (5 kartu Taksonomi Bloom + foto bukti). Dipindah verbatim dari app/page.tsx. */
export function DailyResultSection({
  result,
  resultPhoto,
  tipeKegiatan,
  peran,
  copiedAll,
  copiedSection,
  collapsedSections,
  areAllSectionsCollapsed,
  setAreAllSectionsCollapsed,
  setCollapsedSections,
  onCopyAll,
  onCopySection,
  onOpenLivePreview,
  resultRef,
}: DailyResultSectionProps) {
  return (
<section
  ref={resultRef}
  className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 scroll-mt-16"
>
  {/* Header Hasil + Tombol Salin Semua */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
    <div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
          {tipeKegiatan}
        </span>
        <span className="text-xs text-zinc-500 truncate max-w-[200px]">
          • {peran}
        </span>
      </div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
        Hasil Logbook Harian Resmi
      </h2>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const nextState = !areAllSectionsCollapsed;
          setAreAllSectionsCollapsed(nextState);
          const updated: Record<string, boolean> = {};
          SECTIONS_CONFIG.forEach((s) => {
            updated[s.key] = nextState;
          });
          setCollapsedSections(updated);
        }}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs"
        title={areAllSectionsCollapsed ? "Buka seluruh rincian kartu Bloom" : "Lipat ringkas seluruh kartu Bloom"}
      >
        {areAllSectionsCollapsed ? (
          <>
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Buka Semua</span>
          </>
        ) : (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Tutup Semua</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onOpenLivePreview}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-2xs"
      >
        <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Live Preview</span>
      </button>

      <button
        type="button"
        onClick={onCopyAll}
        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs"
      >
        {copiedAll ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Semua Bagian Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Semua</span>
          </>
        )}
      </button>
    </div>
  </div>

  {/* Bukti Dokumentasi Kegiatan (Jika ada foto yang dianalisis) */}
  {resultPhoto && (
    <div className="rounded-xl p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-zinc-900 shrink-0 shadow-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resultPhoto}
          alt="Bukti Dokumentasi Kegiatan"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 space-y-1 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Bukti Dokumentasi Kegiatan Terverifikasi</span>
        </span>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Narasi di bawah ini telah disinkronkan secara multimodal
          berdasarkan pengamatan visual foto dokumentasimu. Foto ini
          juga akan otomatis tersemat di Laporan Word (.docx) & Slide
          Sidang (.pptx).
        </p>
      </div>
    </div>
  )}

  {/* 5 Kartu Bagian Logbook */}
  <div className="space-y-3.5">
    {SECTIONS_CONFIG.map((sec) => {
      const Icon = sec.icon;
      const isCopied = copiedSection === sec.key;
      const isCollapsed = Boolean(collapsedSections[sec.key]);
      const content = result[sec.key];

      return (
        <div
          key={sec.key}
          className={`rounded-xl p-4 border transition ${sec.bgClass} ${sec.borderClass}`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <button
              type="button"
              onClick={() =>
                setCollapsedSections((prev) => ({
                  ...prev,
                  [sec.key]: !prev[sec.key],
                }))
              }
              className="flex items-center gap-2.5 text-left cursor-pointer flex-1 group"
              title={isCollapsed ? "Klik untuk membuka rincian" : "Klik untuk melipat"}
            >
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${sec.accentClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500">
                    {sec.number}.
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sec.title}
                  </h3>
                  {isCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform" />
                  )}
                </div>
                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 block">
                  {sec.badge}
                </span>
              </div>
            </button>

            {/* Tombol Salin per Bagian */}
            <button
              type="button"
              onClick={() => onCopySection(sec.key, sec.title)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 cursor-pointer ${
                isCopied
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 shadow-2xs"
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Bagian</span>
                </>
              )}
            </button>
          </div>

          {!isCollapsed ? (
            <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pl-0 sm:pl-10">
              {content}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic line-clamp-1 pl-0 sm:pl-10">
              {content}
            </p>
          )}
        </div>
      );
    })}
  </div>
</section>
  );
}
