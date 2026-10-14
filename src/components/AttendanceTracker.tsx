"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { LogbookEntry } from "@/src/lib/exporters/types";

interface AttendanceTrackerProps {
  history: LogbookEntry[];
  onSelectDateToBackfill: (dateIso: string, formattedDateStr: string) => void;
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
}: AttendanceTrackerProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Kalkulasi 900 Jam MBKM (1 hari kerja formal = 8 jam kerja)
  const totalDays = history.length;
  const totalHours = totalDays * 8;
  const TARGET_HOURS = 900;
  const TARGET_DAYS = Math.ceil(TARGET_HOURS / 8); // 113 hari kerja
  const percentComplete = Math.min(
    100,
    Math.round((totalHours / TARGET_HOURS) * 100)
  );
  const remainingHours = Math.max(0, TARGET_HOURS - totalHours);
  const remainingDays = Math.max(0, TARGET_DAYS - totalDays);

  // Buat 30 hari kerja terakhir (Senin s/d Jumat) mundur dari hari ini
  const generateRecentWorkDays = (): WorkDayItem[] => {
    const list: WorkDayItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cursor = new Date(today);

    while (list.length < 30) {
      const dayOfWeek = cursor.getDay();
      // 0 = Minggu, 6 = Sabtu (hanya masukkan Senin-Jumat)
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

        // Cari apakah ada entri yang cocok dengan tanggal ini
        const matched = history.find((h) => {
          if (!h.tanggal) return false;
          // Cek kecocokan tanggal format id-ID atau ISO
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

      // Mundur 1 hari
      cursor.setDate(cursor.getDate() - 1);
    }

    // Urutkan dari tanggal terlama ke terbaru (kiri ke kanan)
    return list.reverse();
  };

  const workDays = generateRecentWorkDays();
  const filledCountIn30Days = workDays.filter((d) => d.isFilled).length;
  const missedCountIn30Days = 30 - filledCountIn30Days;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3.5 transition-all">
      {/* Header & Status Jam Kerja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Clock className="w-4 h-4" />
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              Tracker Kehadiran & Kalkulator 900 Jam MBKM
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Syarat 20 SKS Kemdikbud: 900 jam kumulatif (~113 hari kerja @ 8 jam/hari)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-xs font-black text-indigo-600">
              {totalHours} / {TARGET_HOURS} Jam ({percentComplete}%)
            </div>
            <div className="text-[10px] text-slate-400">
              {totalDays} hari terisi • sisa {remainingDays} hari ({remainingHours} jam)
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title={isExpanded ? "Sembunyikan kalender" : "Tampilkan kalender"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar 900 Jam */}
      <div className="space-y-1">
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
          <span>0 Jam</span>
          <span className="text-indigo-600 font-bold">
            Target 20 SKS: 900 Jam
          </span>
          <span>{TARGET_HOURS} Jam</span>
        </div>
      </div>

      {/* Heatmap Baris 30 Hari Kerja Terakhir */}
      {isExpanded && (
        <div className="space-y-2 pt-1 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>30 Hari Kerja Terakhir (Senin–Jumat):</span>
            </span>
            <div className="flex items-center gap-3 text-[10.5px]">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Terisi ({filledCountIn30Days})</span>
              </span>
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-200 border border-rose-300" />
                <span>Kosong ({missedCountIn30Days})</span>
              </span>
            </div>
          </div>

          {/* Grid Tanggal Mini Heatmap */}
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-100">
            {workDays.map((day, idx) => {
              if (day.isFilled) {
                return (
                  <div
                    key={day.isoDate + idx}
                    className="p-1 rounded-lg bg-emerald-500 text-white text-center shadow-2xs group relative flex flex-col items-center justify-center select-none"
                    title={`${day.fullDisplayDate}: Sudah Terisi (${day.entry?.peran || "Logbook"})`}
                  >
                    <span className="text-[9px] uppercase font-bold opacity-80">
                      {day.dayName}
                    </span>
                    <span className="text-[10px] font-black leading-none mt-0.5">
                      {day.displayDate.split(" ")[0]}
                    </span>
                    <CheckCircle2 className="w-2.5 h-2.5 mt-0.5 opacity-90" />
                  </div>
                );
              }

              // Kosong / Bolong
              return (
                <button
                  key={day.isoDate + idx}
                  type="button"
                  onClick={() =>
                    onSelectDateToBackfill(day.isoDate, day.fullDisplayDate)
                  }
                  className={`p-1 rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center group relative ${
                    day.isToday
                      ? "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200"
                      : "bg-rose-50/80 border-rose-200 text-rose-800 hover:bg-rose-100 hover:border-rose-400"
                  }`}
                  title={`${day.fullDisplayDate}: Kosong! Klik untuk isi logbook tanggal ini`}
                >
                  <span className="text-[9px] uppercase font-semibold opacity-75">
                    {day.dayName}
                  </span>
                  <span className="text-[10px] font-bold leading-none mt-0.5">
                    {day.displayDate.split(" ")[0]}
                  </span>
                  <span className="text-[9px] font-extrabold text-rose-600 mt-0.5 group-hover:scale-110 transition">
                    +
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/60 flex items-center justify-between">
            <span>
              💡 <strong>Tips Anti-Nunggak:</strong> Klik kotak tanggal berwarna merah bertanda <strong>+</strong> di atas untuk langsung mengisi logbook hari yang terlewat.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
