import type { RefObject } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Eye, Layers } from "lucide-react";
import { SECTIONS_CONFIG } from "@/src/lib/config/sections";
import type { WeeklyLogbookDayItem } from "@/src/lib/exporters/types";

interface WeeklyResultsSectionProps {
  weeklyResults: WeeklyLogbookDayItem[];
  tipeKegiatan: string;
  peran: string;
  expandedDayIdx: number;
  setExpandedDayIdx: React.Dispatch<React.SetStateAction<number>>;
  copiedDayIdx: number | null;
  copiedWeeklyAll: boolean;
  onOpenLivePreview: () => void;
  onCopySingleDayWeekly: (day: WeeklyLogbookDayItem, index: number) => void;
  onCopyAllWeeklyMarkdown: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
}

/** Hasil logbook borongan 1 pekan. Dipindah verbatim dari app/page.tsx. */
export function WeeklyResultsSection({
  weeklyResults,
  tipeKegiatan,
  peran,
  expandedDayIdx,
  setExpandedDayIdx,
  copiedDayIdx,
  copiedWeeklyAll,
  onOpenLivePreview,
  onCopySingleDayWeekly,
  onCopyAllWeeklyMarkdown,
  resultRef,
}: WeeklyResultsSectionProps) {
  return (
<section
  ref={resultRef}
  className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 scroll-mt-16"
>
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
          <Layers className="w-3.5 h-3.5 text-zinc-500" />
          <span>Batch {weeklyResults.length} Hari Kerja</span>
        </span>
        <span className="text-xs text-zinc-500">
          {tipeKegiatan} • {peran}
        </span>
      </div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
        Hasil Logbook 1 Pekan
      </h2>
    </div>

    <div className="flex flex-wrap items-center gap-2">
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
        onClick={onCopyAllWeeklyMarkdown}
        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs"
      >
        {copiedWeeklyAll ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Rekap Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Rekap (Markdown)</span>
          </>
        )}
      </button>
    </div>
  </div>

  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
    {weeklyResults.map((dayItem, idx) => {
      const isSelected = expandedDayIdx === idx;
      return (
        <button
          key={`${dayItem.tanggal}-${idx}`}
          type="button"
          onClick={() => setExpandedDayIdx(idx)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition cursor-pointer ${
            isSelected
              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70 dark:hover:bg-zinc-700"
          }`}
        >
          Hari {idx + 1}: {dayItem.hari}
        </button>
      );
    })}
  </div>

  <div className="space-y-3">
    {weeklyResults.map((dayItem, idx) => {
      const isExpanded = expandedDayIdx === idx;
      const isDayCopied = copiedDayIdx === idx;

      return (
        <div
          key={`${dayItem.tanggal}-acc-${idx}`}
          className={`rounded-2xl border transition-all overflow-hidden ${
            isExpanded
              ? "border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 shadow-xs"
              : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          <div className="p-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                setExpandedDayIdx(isExpanded ? -1 : idx)
              }
              className="flex-1 flex items-start sm:items-center gap-3 text-left cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                  isExpanded
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                }`}
              >
                H-{idx + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    {dayItem.tanggal}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    {dayItem.tahap_fase}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {dayItem.deskripsi_kegiatan}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onCopySingleDayWeekly(dayItem, idx)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isDayCopied
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {isDayCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Hari Ini</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setExpandedDayIdx(isExpanded ? -1 : idx)
                }
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              {SECTIONS_CONFIG.map((sec) => {
                const Icon = sec.icon;
                const content = dayItem[sec.weeklyKey];
                return (
                  <div
                    key={sec.key}
                    className={`rounded-xl p-3.5 border ${sec.bgClass} ${sec.borderClass}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${sec.accentClass}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {sec.number}. {sec.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                          {sec.badge}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pl-0 sm:pl-9">
                      {content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}
  </div>
</section>
  );
}
