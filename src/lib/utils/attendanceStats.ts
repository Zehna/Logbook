import { LogbookEntry } from "@/src/lib/exporters/types";

/**
 * Statistik kehadiran & konsistensi logbook (900 jam MBKM, streak, grafik
 * 8 pekan). Sebelumnya kalkulasi inline di AttendanceTracker — dipindah
 * verbatim ke sini agar bisa diuji unit; JSX komponen tidak berubah.
 */

export interface WorkDayItem {
  date: Date;
  isoDate: string; // YYYY-MM-DD
  dayName: string; // Sen, Sel, dll
  displayDate: string; // misal "12 Okt"
  fullDisplayDate: string; // misal "Senin, 12 Oktober 2026"
  isFilled: boolean;
  isToday: boolean;
  entry?: LogbookEntry;
}

export interface WeeklyBucket {
  label: string;
  rangeLabel: string;
  mondayIso: string;
  filledDays: number;
  hoursLogged: number;
  targetHours: number;
  isCurrentWeek: boolean;
}

export interface DashboardData {
  workDays: WorkDayItem[];
  weeklyBuckets: WeeklyBucket[];
  currentStreakDays: number;
  bestStreakDays: number;
  activeWeekStreak: number;
  filledCountIn30Days: number;
  missedCountIn30Days: number;
  consistencyRate30d: number;
}

export const TARGET_HOURS = 900;
export const TARGET_DAYS = Math.ceil(TARGET_HOURS / 8); // 113 hari kerja

const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
const MONTH_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

export function computeHoursProgress(totalDays: number) {
  const totalHours = totalDays * 8;
  const percentComplete = Math.min(100, Math.round((totalHours / TARGET_HOURS) * 100));
  const remainingHours = Math.max(0, TARGET_HOURS - totalHours);
  const remainingDays = Math.max(0, TARGET_DAYS - totalDays);
  return { totalHours, percentComplete, remainingHours, remainingDays };
}

export function computeQualityAudit(history: LogbookEntry[]) {
  const totalDays = history.length;
  const wordsList = history.flatMap((e) =>
    (e.deskripsiKegiatan || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const totalW = wordsList.length;
  const uniqueW = new Set(wordsList).size;
  return {
    uniqueness: totalW === 0 ? 100 : Math.round((uniqueW / totalW) * 100),
    avgWords: totalDays === 0 ? 0 : Math.round(totalW / totalDays),
  };
}

export function findMatchingEntry(dateObj: Date, entries: LogbookEntry[]): LogbookEntry | undefined {
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const dateNum = dateObj.getDate();
  const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
  const displayDateShort = `${dateNum} ${MONTH_SHORT[month] || ""}`.toLowerCase();
  const displayDateLong = `${dateNum} ${MONTH_LONG[month] || ""}`.toLowerCase();

  return entries.find((h) => {
    if (!h.tanggal) return false;
    const cleanHistoryDate = h.tanggal.toLowerCase();
    return (
      cleanHistoryDate.includes(iso) ||
      cleanHistoryDate.includes(displayDateLong) ||
      cleanHistoryDate.includes(displayDateShort)
    );
  });
}

export function emptyDashboardData(): DashboardData {
  return {
    workDays: [],
    weeklyBuckets: [],
    currentStreakDays: 0,
    bestStreakDays: 0,
    activeWeekStreak: 0,
    filledCountIn30Days: 0,
    missedCountIn30Days: 30,
    consistencyRate30d: 0,
  };
}

export function computeDashboardData(history: LogbookEntry[], referenceDate: Date = new Date()): DashboardData {
  const list: WorkDayItem[] = [];
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);

  while (list.length < 30) {
    const dayOfWeek = cursor.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const dateNum = cursor.getDate();
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
      const dayName = DAY_SHORT[dayOfWeek] || "";
      const displayDate = `${dateNum} ${MONTH_SHORT[month] || ""}`;
      const fullDisplayDate = `${DAY_LONG[dayOfWeek] || ""}, ${dateNum} ${MONTH_LONG[month] || ""} ${year}`;
      const isToday = cursor.getTime() === today.getTime();
      const matched = findMatchingEntry(cursor, history);

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

  const chronologicalWorkDays = list.reverse();
  const filledCountIn30Days = chronologicalWorkDays.filter((d) => d.isFilled).length;
  const missedCountIn30Days = 30 - filledCountIn30Days;
  const consistencyRate30d = Math.round((filledCountIn30Days / 30) * 100);

  // Hitung Current Workday Streak & Best Streak
  let currentStreakDays = 0;
  for (let i = chronologicalWorkDays.length - 1; i >= 0; i--) {
    const d = chronologicalWorkDays[i];
    if (d.isFilled) {
      currentStreakDays += 1;
    } else if (d.isToday) {
      continue;
    } else {
      break;
    }
  }

  let bestStreakDays = 0;
  let runningStreak = 0;
  for (const d of chronologicalWorkDays) {
    if (d.isFilled) {
      runningStreak += 1;
      if (runningStreak > bestStreakDays) bestStreakDays = runningStreak;
    } else {
      runningStreak = 0;
    }
  }
  if (bestStreakDays === 0 && history.length > 0) {
    bestStreakDays = Math.min(5, history.length);
  }

  // Bangun data Grafik Konsistensi 8 Pekan Terakhir (Senin - Jumat per pekan)
  const weeklyBuckets: WeeklyBucket[] = [];
  const currentDay = today.getDay();
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() + diffToMonday);
  currentMonday.setHours(0, 0, 0, 0);

  for (let w = 7; w >= 0; w--) {
    const weekMonday = new Date(currentMonday);
    weekMonday.setDate(currentMonday.getDate() - w * 7);
    const weekFriday = new Date(weekMonday);
    weekFriday.setDate(weekMonday.getDate() + 4);

    let filledInWeek = 0;
    for (let dOffset = 0; dOffset < 5; dOffset++) {
      const dCheck = new Date(weekMonday);
      dCheck.setDate(weekMonday.getDate() + dOffset);
      if (findMatchingEntry(dCheck, history)) {
        filledInWeek += 1;
      }
    }

    const startLabel = `${weekMonday.getDate()} ${MONTH_SHORT[weekMonday.getMonth()]}`;
    const endLabel = `${weekFriday.getDate()} ${MONTH_SHORT[weekFriday.getMonth()]}`;
    const mondayIso = `${weekMonday.getFullYear()}-${String(weekMonday.getMonth() + 1).padStart(2, "0")}-${String(weekMonday.getDate()).padStart(2, "0")}`;

    weeklyBuckets.push({
      label: w === 0 ? "Pekan Ini" : `P-${w}`,
      rangeLabel: `${startLabel} – ${endLabel}`,
      mondayIso,
      filledDays: filledInWeek,
      hoursLogged: filledInWeek * 8,
      targetHours: 40,
      isCurrentWeek: w === 0,
    });
  }

  // Hitung Weekly Consistency Streak
  let activeWeekStreak = 0;
  for (let i = weeklyBuckets.length - 1; i >= 0; i--) {
    if (weeklyBuckets[i].filledDays > 0) {
      activeWeekStreak += 1;
    } else if (weeklyBuckets[i].isCurrentWeek) {
      continue;
    } else {
      break;
    }
  }
  if (activeWeekStreak === 0 && history.length > 0) {
    activeWeekStreak = 1;
  }

  return {
    workDays: chronologicalWorkDays,
    weeklyBuckets,
    currentStreakDays,
    bestStreakDays,
    activeWeekStreak,
    filledCountIn30Days,
    missedCountIn30Days,
    consistencyRate30d,
  };
}

export const MILESTONES = [
    { label: "Monev 1", fullTitle: "Monitoring & Evaluasi 1 (25%)", hours: 225, days: 29 },
    { label: "Tengah Sem", fullTitle: "Laporan Tengah Semester (50%)", hours: 450, days: 57 },
    { label: "Monev 2", fullTitle: "Monitoring & Evaluasi 2 (75%)", hours: 675, days: 85 },
    { label: "20 SKS", fullTitle: "Target Lulus Konversi 20 SKS (100%)", hours: 900, days: 113 },
  ];
