import type { LogbookEntry } from "@/src/lib/exporters/types";
import {
  computeJaccardSimilarity,
  computeOverallUniqueness,
  getWordList,
} from "./textSimilarity";

/**
 * Filter, metrik, dan penilaian kualitas riwayat logbook. Sebelumnya
 * inline di AuditHistoryPanel — dipindah verbatim ke sini agar bisa diuji
 * unit. Empat util kata (getWordList dkk.) sebelumnya diduplikasi persis
 * di panel padahal sudah ada di textSimilarity; panel kini memakai yang itu.
 */

const INDONESIAN_MONTHS = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

export function checkDateMatch(entryTanggal: string, targetDateYmd: string): boolean {
  if (!targetDateYmd) return true;
  if (!entryTanggal) return false;

  // Cek substring langsung jika berformat YYYY-MM-DD
  if (entryTanggal.includes(targetDateYmd)) return true;

  const [y, m, d] = targetDateYmd.split("-");
  if (!y || !m || !d) return false;

  const monthIdx = parseInt(m, 10) - 1;
  const monthName = INDONESIAN_MONTHS[monthIdx];
  const dayNum = parseInt(d, 10).toString();

  const lowerEntry = entryTanggal.toLowerCase();

  // Cek apakah tanggal teks bahasa Indonesia memuat nama bulan, hari, dan tahun
  if (
    monthName &&
    lowerEntry.includes(monthName) &&
    lowerEntry.includes(dayNum) &&
    lowerEntry.includes(y)
  ) {
    return true;
}

// Cek format angka DD/MM/YYYY atau DD-MM-YYYY
const slashFormat = `${d}/${m}/${y}`;
const dashFormat = `${d}-${m}-${y}`;
if (entryTanggal.includes(slashFormat) || entryTanggal.includes(dashFormat)) {
  return true;
}

return false;
}

export interface AuditMetrics {
  uniquenessScore: number;
  shortEntriesCount: number;
  repetitiveEntriesCount: number;
}

export function computeAuditMetrics(history: LogbookEntry[]): AuditMetrics {
  const uniquenessScore = computeOverallUniqueness(history);
  const shortEntriesCount = history.filter(
    (e) => getWordList(e.deskripsiKegiatan || "").length < 20
  ).length;

  let repetitiveEntriesCount = 0;
  for (let i = 0; i < history.length; i++) {
    const cur = history[i];
    const others = history.filter((_, idx) => idx !== i);
    const maxSim = Math.max(
      0,
      ...others.map((o) =>
        computeJaccardSimilarity(
          cur.deskripsiKegiatan || "",
          o.deskripsiKegiatan || ""
        )
      )
    );
    if (maxSim >= 70) {
      repetitiveEntriesCount++;
    }
  }

  return {
    uniquenessScore,
    shortEntriesCount,
    repetitiveEntriesCount,
  };
}

export function extractAvailableActivityTypes(history: LogbookEntry[]): string[] {
  const typesSet = new Set<string>();
  typesSet.add("Magang MBKM");
  typesSet.add("MSIB");
  typesSet.add("KKN");
  history.forEach((e) => {
    if (e.tipeKegiatan && e.tipeKegiatan.trim()) {
      typesSet.add(e.tipeKegiatan.trim());
    }
  });
  return Array.from(typesSet);
}

export interface EntryQuality {
  wordCount: number;
  isShort: boolean;
  maxSimilarity: number;
  matchedDate: string;
  isRepetitive: boolean;
  needsFix: boolean;
}

export function assessEntryQuality(entry: LogbookEntry, history: LogbookEntry[]): EntryQuality {
  const words = getWordList(entry.deskripsiKegiatan || "");
  const wordCount = words.length;
  const isShort = wordCount < 20;
  let maxSimilarity = 0;
  let matchedDate = "";
  for (const other of history.filter((o) => o.id !== entry.id)) {
    const sim = computeJaccardSimilarity(
      entry.deskripsiKegiatan || "",
      other.deskripsiKegiatan || ""
    );
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      matchedDate = other.tanggal;
    }
  }
  const isRepetitive = maxSimilarity >= 70;
  return { wordCount, isShort, maxSimilarity, matchedDate, isRepetitive, needsFix: isShort || isRepetitive };
}

export interface AuditFilters {
  query: string;
  activityType: string;
  selectedDate: string;
  datePreset: "all" | "today" | "7days" | "30days" | "custom";
  qualityFilter: "all" | "needs_fix" | "optimal";
}

export function filterHistory(
  history: LogbookEntry[],
  filters: AuditFilters,
  now: Date = new Date()
): LogbookEntry[] {
  const { query, activityType, selectedDate, datePreset, qualityFilter } = filters;
  return history.filter((entry) => {
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    const matchKeyword =
      (entry.tanggal || "").toLowerCase().includes(q) ||
      (entry.peran || "").toLowerCase().includes(q) ||
      (entry.tipeKegiatan || "").toLowerCase().includes(q) ||
      (entry.deskripsiKegiatan || "").toLowerCase().includes(q) ||
      (entry.kompetensiDikembangkan || "").toLowerCase().includes(q) ||
      (entry.kendalaDihadapi || "").toLowerCase().includes(q) ||
      (entry.solusiTindakan || "").toLowerCase().includes(q) ||
      (entry.refleksiPembelajaran || "").toLowerCase().includes(q);

    if (!matchKeyword) return false;
  }

  // 2. Filter Tipe Kegiatan (Activity Type)
  if (activityType !== "all") {
    if (entry.tipeKegiatan !== activityType) {
      return false;
    }
  }

  // 3. Filter Tanggal (Date Filter)
  // Tanggal lokal, bukan UTC: toISOString() menggeser hari untuk zona
  // waktu di timur UTC (mis. WIB) sebelum pukul 07:00.
  const toLocalYmd = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (datePreset === "today") {
    const todayIso = toLocalYmd(new Date(now));
    if (!checkDateMatch(entry.tanggal, todayIso)) return false;
  } else if (datePreset === "7days" || datePreset === "30days") {
    const daysCount = datePreset === "7days" ? 7 : 30;
    let inRange = false;
    for (let i = 0; i <= daysCount; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = toLocalYmd(d);
      if (checkDateMatch(entry.tanggal, iso)) {
        inRange = true;
        break;
      }
    }
    if (!inRange) return false;
  } else if (selectedDate) {
    if (!checkDateMatch(entry.tanggal, selectedDate)) {
      return false;
    }
  }

  // 4. Filter Kualitas Audit
  if (qualityFilter !== "all") {
    const { needsFix } = assessEntryQuality(entry, history);

    if (qualityFilter === "needs_fix" && !needsFix) return false;
    if (qualityFilter === "optimal" && needsFix) return false;
  }

    return true;
  });
}
