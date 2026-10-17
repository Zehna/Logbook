"use client";

import React, { useState } from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LogbookEntry } from "@/src/lib/exporters/types";

interface AttendanceTrackerProps {
  history: LogbookEntry[];
  onSelectDateToBackfill: (dateIso: string, formattedDateStr: string) => void;
  isPro?: boolean;
  remainingQuota?: number;
  maxFreeQuota?: number;
  planName?: string;
  onOpenUpgradeModal?: () => void;
}

interface WorkDayItem {
  date: Date;
  isoDate: string; // YYYY-MM-DD
  dayName: string; // Senin, Selasa, dll
  displayDate: string; // misal "12 Okt"
  fullDisplayDate: string; // misal "Senin, 12 Oktober 2026"
  isFilled: boolean;
  isToday: boolean;
  entry?: LogbookEntry;
}

export function AttendanceTracker({
  history,
  onSelectDateToBackfill,
  isPro = false,
  remainingQuota = 3,
  maxFreeQuota = 3,
  planName = "Member Pro",
  onOpenUpgradeModal,
}: AttendanceTrackerProps) {
  // Collapsed by default for a calm, ultra-compact 1-line strip
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(false);

  // Kalkulasi 900 Jam MBKM (1 hari kerja formal = 8 jam kerja)
  const totalDays = history.length;
  const totalHours = totalDays * 8;
  const TARGET_HOURS = 900;
  const TARGET_DAYS = Math.ceil(TARGET_HOURS / 8); // ~113 hari kerja
  const percentComplete = Math.min(
    100,
    Math.round((totalHours / TARGET_HOURS) * 100)
  );
  const remainingHours = Math.max(0, TARGET_HOURS - totalHours);
  const remainingDays = Math.max(0, TARGET_DAYS - totalDays);

  // Audit Kualitas Logbook (Keunikan Kosakata & Rata-rata Kata)
  const wordsList = history.flatMap((e) =>
    (e.deskripsiKegiatan || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const totalWords = wordsList.length;
  const uniqueWords = new Set(wordsList).size;
  const uniqueness = totalWords === 0 ? 100 : Math.round((uniqueWords / totalWords) * 100);
  const avgWords = totalDays === 0 ? 0 : Math.round(totalWords / totalDays);

  // Buat 30 hari kerja terakhir (Senin s/d Jumat)
  const generateRecentWorkDays = (): WorkDayItem[] => {
    const list: WorkDayItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cursor = new Date(today);

    while (list.length < 30) {
      const dayOfWeek = cursor.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const iso = cursor.toISOString().slice(0, 10);
        const dayName = cursor.toLocaleDateString("id-ID", { weekday: "short" });
        const displayDate = cursor.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        const fullDisplayDate = cursor.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const isToday = cursor.getTime() === today.getTime();

        const matched = history.find((h) => {
          if (!h.tanggal) return false;
          const cleanHistoryDate = h.tanggal.toLowerCase();
          return (
            cleanHistoryDate.includes(displayDate.toLowerCase()) ||
            cleanHistoryDate.includes(iso) ||
            cleanHistoryDate.includes(
              cursor
                .toLocaleDateString("id-ID", { day: "numeric", month: "long" })
                .toLowerCase()
            )
          );
        });

        list.push({
          date: new Date(cursor),
          isoDate: iso,
          dayName,
          displayDate,
          fullDisplayDate,
          isFilled: Boolean(matched),
          isToday,
          entry: matched,
        });
      }

      cursor.setDate(cursor.getDate() - 1);
    }

    return list.reverse();
  };

  const workDays = generateRecentWorkDays();
  const filledCountIn30Days = workDays.filter((d) => d.isFilled).length;
  const missedCountIn30Days = 30 - filledCountIn30Days;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-3 sm:px-4 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: 900 Jam MBKM Progress */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              900 Jam MBKM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 sm:w-32 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {totalHours}h / 900h ({percentComplete}%)
            </span>
          </div>
        </div>

        {/* Center / Right: 30-Day Contribution Dots (GitHub style) */}
        <div className="flex items-center justify-between sm:justify-end gap-3 min-w-0">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {workDays.map((day, idx) => {
              const isFilled = day.isFilled;
              return (
                <button
                  key={`${day.isoDate}-${idx}`}
                  type="button"
                  onClick={() => {
                    if (!isFilled) {
                      onSelectDateToBackfill(day.isoDate, day.fullDisplayDate);
                    }
                  }}
                  title={`${day.fullDisplayDate}: ${
                    isFilled
                      ? `Terisi (${day.entry?.peran || "Logbook"})`
                      : "Kosong (Klik untuk isi)"
                  }`}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] transition-transform hover:scale-125 cursor-pointer shrink-0 ${
                    isFilled
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : day.isToday
                      ? "bg-zinc-300 dark:bg-zinc-700 ring-1 ring-zinc-400 dark:ring-zinc-500"
                      : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                />
              );
            })}
          </div>

          {/* Toggle Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsCalendarExpanded((prev) => !prev)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer shrink-0"
            title={isCalendarExpanded ? "Sembunyikan detail" : "Lihat detail kehadiran"}
          >
            {isCalendarExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details Section */}
      {isCalendarExpanded && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400 animate-fadeIn">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span>
              Target: <strong className="text-zinc-800 dark:text-zinc-200">{totalDays}</strong> / {TARGET_DAYS} hari ({remainingHours} jam sisa)
            </span>
            <span>•</span>
            <span>
              30 Hari Terakhir:{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">{filledCountIn30Days} terisi</strong>,{" "}
              <strong className="text-zinc-500">{missedCountIn30Days} kosong</strong>
            </span>
            <span>•</span>
            <span>
              Kualitas: <strong className="text-zinc-800 dark:text-zinc-200">{uniqueness}%</strong> unik (~{avgWords} kata/entri)
            </span>
            {onOpenUpgradeModal && !isPro && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenUpgradeModal}
                  className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline cursor-pointer"
                >
                  Upgrade Pro ({remainingQuota}/{maxFreeQuota} kuota gratis)
                </button>
              </>
            )}
          </div>

          <div className="text-[11px] text-zinc-400">
            Klik titik abu-abu untuk mengisi logbook tanggal terlewat
          </div>
        </div>
      )}
    </div>
  );
}
