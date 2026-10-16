"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Zap,
  BarChart3,
  Flame,
  Check,
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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState<boolean>(true);

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

  // Circular progress parameter
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentComplete / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 3-Card Bento Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Bento Card 1: Status Akses & Kuota AI */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Lisensi & Kuota AI
              </span>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                {isPro ? (
                  <>
                    <span>{planName}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      AKTIF
                    </span>
                  </>
                ) : (
                  <>
                    <span>Starter Free</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      GRATIS
                    </span>
                  </>
                )}
              </h4>
            </div>

            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isPro
                  ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/20"
                  : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900"
              }`}
            >
              {isPro ? (
                <Crown className="w-5 h-5 drop-shadow-xs" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="text-xs">
              {isPro ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Unlimited Generate & Ekspor
                </span>
              ) : (
                <span className="text-slate-600 dark:text-slate-300 font-semibold">
                  Sisa Kuota: <strong className="text-indigo-600 dark:text-indigo-400">{remainingQuota}</strong> / {maxFreeQuota}
                </span>
              )}
            </div>

            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
              >
                {isPro ? "Cek Detail" : "Upgrade Pro 🚀"}
              </button>
            )}
          </div>
        </div>

        {/* Bento Card 2: Cincin Progress Jam Kerja 900 Jam MBKM */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Kalkulator 900 Jam MBKM
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalHours}{" "}
              <span className="text-xs font-semibold text-slate-400">/ 900 Jam</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {totalDays} hari terisi • sisa ~{remainingDays} hari ({remainingHours} jam)
            </p>
          </div>

          {/* SVG Circular Progress */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-500 transition-all duration-700 ease-out"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900 dark:text-white">
              {percentComplete}%
            </span>
          </div>
        </div>

        {/* Bento Card 3: Skor Audit Kualitas & Keunikan Kosakata */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Audit Kualitas Narasi
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1.5">
                <span>{uniqueness}%</span>
                <span className="text-xs font-semibold text-slate-400">Keunikan Kata</span>
              </div>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Rata-rata: <strong>{avgWords} kata</strong> / entri
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                uniqueness >= 70
                  ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              }`}
            >
              {uniqueness >= 70 ? "✨ Sangat Variatif" : "⚠️ Cenderung Repetitif"}
            </span>
          </div>
        </div>
      </div>

      {/* Baris Kalender 30 Hari Kerja Terakhir (Rounded-md Compact) */}
      <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-4 h-4" />
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Kalender 30 Hari Kerja Terakhir (Senin – Jumat)
            </h4>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-[10.5px]">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>Terisi ({filledCountIn30Days})</span>
              </span>
              <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800" />
                <span>Kosong ({missedCountIn30Days})</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCalendarExpanded((prev) => !prev)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={isCalendarExpanded ? "Sembunyikan kalender" : "Tampilkan kalender"}
            >
              {isCalendarExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {isCalendarExpanded && (
          <div className="space-y-2 pt-1 animate-fadeIn">
            {/* Grid Tanggal Compact dengan rounded-md */}
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 p-2 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
              {workDays.map((day, idx) => {
                if (day.isFilled) {
                  return (
                    <div
                      key={day.isoDate + idx}
                      className="p-1 rounded-md bg-emerald-500 dark:bg-emerald-600 text-white text-center shadow-2xs group relative flex flex-col items-center justify-center select-none transition-transform hover:scale-105"
                      title={`${day.fullDisplayDate}: Sudah Terisi (${day.entry?.peran || "Logbook"})`}
                    >
                      <span className="text-[9px] uppercase font-bold opacity-85">
                        {day.dayName}
                      </span>
                      <span className="text-[10px] font-black leading-none mt-0.5">
                        {day.displayDate.split(" ")[0]}
                      </span>
                      <CheckCircle2 className="w-2.5 h-2.5 mt-0.5 opacity-90" />
                    </div>
                  );
                }

                // Kosong / Terlewat
                return (
                  <button
                    key={day.isoDate + idx}
                    type="button"
                    onClick={() =>
                      onSelectDateToBackfill(day.isoDate, day.fullDisplayDate)
                    }
                    className={`p-1 rounded-md border text-center transition cursor-pointer flex flex-col items-center justify-center group relative hover:scale-105 ${
                      day.isToday
                        ? "bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 hover:bg-amber-200"
                        : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60"
                    }`}
                    title={`${day.fullDisplayDate}: Kosong! Klik untuk isi logbook tanggal ini`}
                  >
                    <span className="text-[9px] uppercase font-semibold opacity-75">
                      {day.dayName}
                    </span>
                    <span className="text-[10px] font-bold leading-none mt-0.5">
                      {day.displayDate.split(" ")[0]}
                    </span>
                    <span className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                      +
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/40 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between">
              <span>
                💡 <strong>Tips Anti-Nunggak:</strong> Klik kotak tanggal merah bertanda <strong>+</strong> untuk langsung mengisi logbook hari yang terlewat.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
