"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  ChevronDown,
  ChevronUp,
  QrCode,
  Calendar,
  PenTool,
  Flame,
  BarChart3,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { LogbookEntry } from "@/src/lib/exporters/types";

interface AttendanceTrackerProps {
  history: LogbookEntry[];
  onSelectDateToBackfill: (dateIso: string, formattedDateStr: string) => void;
  isPro?: boolean;
  remainingQuota?: number;
  maxFreeQuota?: number;
  planName?: string;
  onOpenUpgradeModal?: () => void;
  onOpenQrScanner?: () => void;
  onOpenCalendarHub?: (tab?: "calendar" | "competency" | "signature") => void;
}

import {
  MILESTONES,
  TARGET_DAYS,
  TARGET_HOURS,
  WorkDayItem,
  computeDashboardData,
  computeHoursProgress,
  computeQualityAudit,
  emptyDashboardData,
} from "@/src/lib/utils/attendanceStats";


export function AttendanceTracker({
  history,
  onSelectDateToBackfill,
  isPro = false,
  remainingQuota = 3,
  maxFreeQuota = 3,
  onOpenUpgradeModal,
  onOpenQrScanner,
  onOpenCalendarHub,
}: AttendanceTrackerProps) {
  const [isDashboardExpanded, setIsDashboardExpanded] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(7); // Default: Pekan Ini (index 7)
  const [selectedDayPreview, setSelectedDayPreview] = useState<WorkDayItem | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Kalkulasi 900 Jam MBKM (1 hari kerja formal = 8 jam kerja)
  const totalDays = history.length;
  const { totalHours, percentComplete, remainingHours, remainingDays } =
    computeHoursProgress(totalDays);

  // Audit Kualitas Logbook (Keunikan Kosakata & Rata-rata Kata)
  const { uniqueness, avgWords } = useMemo(() => computeQualityAudit(history), [history]);

  // Kalkulasi 30 Hari Kerja Terakhir, Streak Konsistensi, dan Grafik 8 Pekan Terakhir
  const dashboardData = useMemo(
    () => (isMounted ? computeDashboardData(history) : emptyDashboardData()),
    [isMounted, history]
  );

  const milestones = MILESTONES;

  const selectedWeek =
    dashboardData.weeklyBuckets[selectedWeekIndex] ||
    dashboardData.weeklyBuckets[dashboardData.weeklyBuckets.length - 1];

  return (
    <section
      aria-label="Dashboard Ringkasan Progres & Konsistensi Logbook"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 sm:p-5 shadow-xs transition-colors space-y-4"
    >
      {/* Top Bar: Title, Quick Summary & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Ringkasan Progres 900 Jam &amp; Konsistensi Mingguan
              </h2>
              <span className="text-xs text-zinc-400" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                {totalHours}j / {TARGET_HOURS}j ({percentComplete}%)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {totalDays} hari tercatat ({remainingHours} jam tersisa menuju target konversi 20 SKS)
            </p>
          </div>
        </div>

        {/* Right Action Buttons - Flex-wrap so nothing clips on mobile or tablet */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {onOpenCalendarHub && (
            <button
              type="button"
              onClick={() => onOpenCalendarHub("calendar")}
              title="Buka Kalender Heatmap Kehadiran, Deteksi Hari Bolong & Peta Kompetensi"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Kalender &amp; Peta</span>
            </button>
          )}

          {onOpenCalendarHub && (
            <button
              type="button"
              onClick={() => onOpenCalendarHub("signature")}
              title="Kelola E-Paraf & Tanda Tangan Digital Mahasiswa / Mentor"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>E-Paraf</span>
            </button>
          )}

          {onOpenQrScanner && (
            <button
              type="button"
              onClick={onOpenQrScanner}
              title="Pindai QR Dokumen Mentor untuk presensi atau verifikasi logbook cepat"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDashboardExpanded((prev) => !prev)}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={isDashboardExpanded ? "Ringkas dashboard" : "Bentangkan grafik & metrik"}
            aria-expanded={isDashboardExpanded}
          >
            {isDashboardExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Summary Dashboard Grid (3 Columns on Desktop) */}
      {isDashboardExpanded && (
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Column 1 (4 Cols): Total Hours Logged & 900-Hour Milestone Progress */}
            <div className="lg:col-span-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Total Jam Kerja Tercatat
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                    {percentComplete}% Selesai
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {totalHours}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    / {TARGET_HOURS} Jam ({totalDays} dari {TARGET_DAYS} Hari)
                  </span>
                </div>
              </div>

              {/* Progress Bar with 4 Interactive Milestones */}
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full bg-zinc-200/80 dark:bg-zinc-800 overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentComplete, totalHours > 0 ? 3 : 0)}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px] font-mono tabular-nums">
                  {milestones.map((m) => {
                    const reached = totalHours >= m.hours;
                    const diffHours = Math.max(0, m.hours - totalHours);
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => {
                          toast.info(`${m.fullTitle}`, {
                            description: reached
                              ? `Tercapai! Anda telah melewati target ${m.hours} jam (${m.days} hari kerja).`
                              : `Butuh ${diffHours} jam lagi (${Math.ceil(diffHours / 8)} hari kerja) untuk mencapai ${m.label}.`,
                          });
                        }}
                        className={`text-left p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer ${
                          reached
                            ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                        title={`Klik untuk detail ${m.fullTitle}`}
                      >
                        <div>{m.hours}j</div>
                        <div className="font-sans text-[10px] leading-tight">{m.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>
                  Sisa Target:{" "}
                  <strong className="font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
                    {remainingDays} hari kerja
                  </strong>
                </span>
                <span>8 jam / entri</span>
              </div>
            </div>

            {/* Column 2 (3 Cols): Weekly Consistency Streaks & 30-Day Audit */}
            <div className="lg:col-span-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-3.5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Streak Konsistensi
                  </span>
                  <span className="font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                    {dashboardData.activeWeekStreak} Pekan Aktif
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
                    {dashboardData.currentStreakDays}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Hari Kerja Berturut-turut
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Rekor Streak Terbaik</span>
                  <span className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
                    {dashboardData.bestStreakDays} Hari
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Kepatuhan 30 Hari</span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    {dashboardData.filledCountIn30Days}/30 ({dashboardData.consistencyRate30d}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Keunikan Narasi</span>
                  <span className="font-mono tabular-nums font-semibold text-zinc-800 dark:text-zinc-200">
                    {uniqueness}% (~{avgWords} kata)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <button
                  type="button"
                  onClick={() => onOpenCalendarHub && onOpenCalendarHub("calendar")}
                  className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="underline">{dashboardData.missedCountIn30Days} hari kosong (Cek)</span>
                </button>
                {onOpenUpgradeModal && !isPro && (
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="text-zinc-900 dark:text-zinc-100 font-semibold hover:underline cursor-pointer"
                  >
                    Kuota {remainingQuota}/{maxFreeQuota}
                  </button>
                )}
              </div>
            </div>

            {/* Column 3 (5 Cols): Interactive Weekly Consistency Bar Chart (Last 8 Weeks vs 40h/Week Target) */}
            <div className="lg:col-span-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-3.5 flex flex-col justify-between space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Grafik Konsistensi Jam Mingguan (8 Pekan Terakhir)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Klik batang pekan untuk melihat detail jam &amp; menambal tanggal
                  </p>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400 shrink-0">
                  Target 40j
                </span>
              </div>

              {/* Interactive Bar Chart (Each Bar is a Clickable Button) */}
              <div className="h-24 pt-2 flex items-end justify-between gap-1.5 sm:gap-2 relative border-b border-zinc-200 dark:border-zinc-800 pb-1">
                {/* Dashed 40h Target Line at top */}
                <div
                  className="absolute inset-x-0 top-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 pointer-events-none"
                  title="Target 40 Jam / Pekan"
                />

                {dashboardData.weeklyBuckets.map((bucket, idx) => {
                  const pctHeight = Math.min(
                    100,
                    Math.round((bucket.hoursLogged / bucket.targetHours) * 100)
                  );
                  const isFull = bucket.hoursLogged >= 40;
                  const hasSome = bucket.hoursLogged > 0;
                  const isSelected = selectedWeekIndex === idx;

                  return (
                    <button
                      key={bucket.label}
                      type="button"
                      onClick={() => setSelectedWeekIndex(idx)}
                      className={`flex-1 flex flex-col items-center justify-end h-full group relative rounded-md py-0.5 transition cursor-pointer ${
                        isSelected
                          ? "bg-zinc-200/60 dark:bg-zinc-800/80 ring-1 ring-zinc-400 dark:ring-zinc-600"
                          : "hover:bg-zinc-200/30 dark:hover:bg-zinc-800/40"
                      }`}
                      title={`${bucket.label} (${bucket.rangeLabel}): ${bucket.hoursLogged} Jam (${bucket.filledDays}/5 hari kerja)`}
                    >
                      <span className="text-[9px] font-mono tabular-nums text-zinc-600 dark:text-zinc-300 mb-1">
                        {bucket.hoursLogged}j
                      </span>
                      <div className="w-full max-w-[26px] h-14 bg-zinc-200/80 dark:bg-zinc-800 rounded-t-sm overflow-hidden flex items-end">
                        <div
                          className={`w-full rounded-t-sm transition-all duration-500 ${
                            isFull
                              ? "bg-emerald-600 dark:bg-emerald-500"
                              : hasSome
                              ? "bg-zinc-800 dark:bg-zinc-200"
                              : "bg-transparent"
                          }`}
                          style={{ height: `${hasSome ? Math.max(16, pctHeight) : 0}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 text-[10px] font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                {dashboardData.weeklyBuckets.map((bucket, idx) => (
                  <button
                    key={bucket.label}
                    type="button"
                    onClick={() => setSelectedWeekIndex(idx)}
                    className={`flex-1 text-center truncate cursor-pointer transition ${
                      selectedWeekIndex === idx
                        ? "font-bold text-zinc-900 dark:text-zinc-100 underline"
                        : "hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {bucket.label}
                  </button>
                ))}
              </div>

              {/* Selected Week Interactive Detail Footer */}
              {selectedWeek && (
                <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-zinc-600 dark:text-zinc-300 truncate">
                    <strong>{selectedWeek.label}</strong> ({selectedWeek.rangeLabel}):{" "}
                    <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {selectedWeek.hoursLogged}/40 Jam
                    </span>{" "}
                    ({selectedWeek.filledDays}/5 hari)
                  </span>
                  {selectedWeek.filledDays < 5 ? (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectDateToBackfill(
                          selectedWeek.mondayIso,
                          `${selectedWeek.label} (${selectedWeek.rangeLabel})`
                        )
                      }
                      className="inline-flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-semibold hover:underline shrink-0 cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>Isi Pekan Ini</span>
                    </button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
                      Target Tercapai
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Strip: 30-Workday Interactive Backfill Bar */}
          <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap">
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                Peta 30 Hari Kerja Terakhir:
              </span>
              {selectedDayPreview ? (
                <span className="text-zinc-800 dark:text-zinc-200">
                  <strong>{selectedDayPreview.fullDisplayDate}</strong> —{" "}
                  {selectedDayPreview.isFilled
                    ? `Terisi (${selectedDayPreview.entry?.peran || "8 Jam"})`
                    : "Kosong (Tanggal telah disetel ke form di bawah)"}
                </span>
              ) : (
                <span>Klik kotak mana saja untuk memilih atau menambal tanggal logbook</span>
              )}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {dashboardData.workDays.map((day, idx) => {
                const isFilled = day.isFilled;
                const isSelected = selectedDayPreview?.isoDate === day.isoDate;
                return (
                  <button
                    key={`${day.isoDate}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedDayPreview(day);
                      onSelectDateToBackfill(day.isoDate, day.fullDisplayDate);
                    }}
                    title={`${day.fullDisplayDate}: ${
                      isFilled
                        ? `Terisi (${day.entry?.peran || "Logbook"}) — Klik untuk pilih tanggal ini`
                        : "Kosong — Klik untuk menambal tanggal ini"
                    }`}
                    className={`w-3.5 h-3.5 rounded-[3px] transition-transform hover:scale-125 cursor-pointer shrink-0 ${
                      isSelected ? "ring-2 ring-zinc-900 dark:ring-zinc-100 scale-110 " : ""
                    }${
                      isFilled
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : day.isToday
                        ? "bg-zinc-300 dark:bg-zinc-700 ring-1 ring-zinc-400 dark:ring-zinc-500"
                        : "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 hover:bg-amber-200 dark:hover:bg-amber-800/60"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
