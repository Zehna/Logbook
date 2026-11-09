import type { LogbookEntry } from "@/src/lib/exporters/types";
import { getIndonesianHolidayInfo } from "@/src/lib/utils/indonesianHolidays";

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const DAY_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export interface CalendarDayCell {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isFuture: boolean;
  holidayName: string | null;
  matchedEntry?: LogbookEntry;
  fullFormattedDate: string;
}

export interface CalendarData {
  cells: CalendarDayCell[];
  filledInMonth: CalendarDayCell[];
  missingWorkdaysInMonth: CalendarDayCell[];
  qrVerifiedInMonth: CalendarDayCell[];
}

/**
 * Grid kalender untuk (viewYear, viewMonth): sel padding bulan sebelum/
 * sesudah, entri logbook yang cocok per tanggal, hari libur, dan ringkasan
 * hari terisi / hari kerja kosong / terverifikasi QR. Sebelumnya useMemo
 * inline di CalendarCompetencyModal — dipindah verbatim ke sini.
 */
export function buildCalendarData(
  viewYear: number,
  viewMonth: number,
  history: LogbookEntry[]
): CalendarData {
const today = new Date();
today.setHours(0, 0, 0, 0);

const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
const daysInMonth = lastDayOfMonth.getDate();

// Monday-based index (0 = Mon, ..., 6 = Sun)
const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

const cells: CalendarDayCell[] = [];

const matchEntryForDate = (year: number, monthIdx: number, dayNum: number): LogbookEntry | undefined => {
  const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
  const monthNameLong = (MONTH_NAMES[monthIdx] || "").toLowerCase();
  const monthNameShort = monthNameLong.slice(0, 3);
  return history.find((h) => {
    if (!h.tanggal) return false;
    const lower = h.tanggal.toLowerCase();
    return (
      lower.includes(iso) ||
      lower.includes(`${dayNum} ${monthNameLong}`) ||
      lower.includes(`${dayNum} ${monthNameShort}`)
    );
  });
};

// Previous month padding days
const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
for (let i = startOffset - 1; i >= 0; i--) {
  const dNum = prevMonthLastDate - i;
  const dObj = new Date(viewYear, viewMonth - 1, dNum);
  const y = dObj.getFullYear();
  const m = dObj.getMonth();
  const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
  const hol = getIndonesianHolidayInfo(iso);
  cells.push({
    isoDate: iso,
    dayNumber: dNum,
    isCurrentMonth: false,
    isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
    isToday: dObj.getTime() === today.getTime(),
    isFuture: dObj.getTime() > today.getTime(),
    holidayName: hol.isHoliday ? hol.name || "Libur Nasional" : null,
    matchedEntry: matchEntryForDate(y, m, dNum),
    fullFormattedDate: `${DAY_FULL[dObj.getDay()]}, ${dNum} ${MONTH_NAMES[m]} ${y}`,
  });
}

// Current month days
for (let dNum = 1; dNum <= daysInMonth; dNum++) {
  const dObj = new Date(viewYear, viewMonth, dNum);
  const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
  const hol = getIndonesianHolidayInfo(iso);
  cells.push({
    isoDate: iso,
    dayNumber: dNum,
    isCurrentMonth: true,
    isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
    isToday: dObj.getTime() === today.getTime(),
    isFuture: dObj.getTime() > today.getTime(),
    holidayName: hol.isHoliday ? hol.name || "Libur Nasional" : null,
    matchedEntry: matchEntryForDate(viewYear, viewMonth, dNum),
    fullFormattedDate: `${DAY_FULL[dObj.getDay()]}, ${dNum} ${MONTH_NAMES[viewMonth]} ${viewYear}`,
  });
}

// Next month padding to complete 35 or 42 cells
const totalNeeded = cells.length > 35 ? 42 : 35;
const remaining = totalNeeded - cells.length;
for (let dNum = 1; dNum <= remaining; dNum++) {
  const dObj = new Date(viewYear, viewMonth + 1, dNum);
  const y = dObj.getFullYear();
  const m = dObj.getMonth();
  const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
  const hol = getIndonesianHolidayInfo(iso);
  cells.push({
    isoDate: iso,
    dayNumber: dNum,
    isCurrentMonth: false,
    isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
    isToday: dObj.getTime() === today.getTime(),
    isFuture: dObj.getTime() > today.getTime(),
    holidayName: hol.isHoliday ? hol.name || "Libur Nasional" : null,
    matchedEntry: matchEntryForDate(y, m, dNum),
    fullFormattedDate: `${DAY_FULL[dObj.getDay()]}, ${dNum} ${MONTH_NAMES[m]} ${y}`,
  });
}

const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
const filledInMonth = currentMonthCells.filter((c) => Boolean(c.matchedEntry));
const missingWorkdaysInMonth = currentMonthCells.filter(
  (c) => !c.isWeekend && !c.holidayName && !c.isFuture && !c.matchedEntry
);
const qrVerifiedInMonth = filledInMonth.filter((c) =>
  (c.matchedEntry?.catatanAsli || "").includes("QR") ||
  (c.matchedEntry?.tahapFase || "").includes("Terverifikasi QR")
);

return {
  cells,
  filledInMonth,
  missingWorkdaysInMonth,
  qrVerifiedInMonth,
};
}

export interface CompetencyDomainScore {
  id: string;
  label: string;
  desc: string;
  keywords: string[];
  count: number;
  percentage: number;
}

export interface CompetencyAnalytics {
  domainScores: CompetencyDomainScore[];
  bloomCounts: { c3: number; c4: number; c5: number; c6: number };
  weakestDomain: CompetencyDomainScore;
  totalEntries: number;
}

/**
 * Analitik kompetensi & taksonomi Bloom dari riwayat logbook: skor 5 domain
 * (keyword match) dan hitungan C3-C6 (regex kata kerja). Sebelumnya useMemo
 * inline di CalendarCompetencyModal — dipindah verbatim ke sini.
 */
export function computeCompetencyAnalytics(
  history: LogbookEntry[]
): CompetencyAnalytics {
const domains = [
  {
    id: "technical",
    label: "Rekayasa Teknis & Implementasi Sistem",
    desc: "Pengembangan teknis, arsitektur, analisis data, dan eksekusi alat kerja profesional",
    keywords: [
      "sistem", "data", "kode", "api", "aplikasi", "teknis", "analisis", "desain",
      "implementasi", "pengujian", "fitur", "modul", "database", "konfigurasi", "arsitektur"
    ],
    count: 0,
  },
  {
    id: "problem_solving",
    label: "Pemecahan Masalah & Mitigasi Risiko (C4–C6)",
    desc: "Identifikasi akar masalah, debugging, optimasi proses, dan evaluasi solusi alternatif",
    keywords: [
      "solusi", "masalah", "kendala", "optimasi", "evaluasi", "perbaikan", "mitigasi",
      "efisiensi", "validasi", "investigasi", "troubleshooting", "strategi"
    ],
    count: 0,
  },
  {
    id: "communication",
    label: "Komunikasi Profesional & Kolaborasi Lintas Tim",
    desc: "Koordinasi pemangku kepentingan, presentasi, diskusi mentor, dan dokumentasi",
    keywords: [
      "koordinasi", "diskusi", "mentor", "tim", "presentasi", "rapat", "komunikasi",
      "kolaborasi", "dokumentasi", "laporan", "stakeholder", "bimbingan", "sinkronisasi"
    ],
    count: 0,
  },
  {
    id: "management",
    label: "Manajemen Proyek & Kepemimpinan Eksekusi",
    desc: "Perencanaan jadwal, manajemen prioritas, kemandirian kerja, dan target milestone",
    keywords: [
      "jadwal", "target", "prioritas", "manajemen", "perencanaan", "proyek", "inisiatif",
      "monitoring", "timeline", "tanggung jawab", "kepemimpinan", "agenda"
    ],
    count: 0,
  },
  {
    id: "community",
    label: "Pemberdayaan Sosial & Dampak Lapangan (KKN/Mitra)",
    desc: "Edukasi masyarakat, sosialisasi program kerja, observasi lapangan, dan pengabdian",
    keywords: [
      "masyarakat", "desa", "sosialisasi", "edukasi", "warga", "lapangan", "pelatihan",
      "observasi", "pendampingan", "program kerja", "kkn", "umkm"
    ],
    count: 0,
  },
];

const bloomCounts = {
  c3: 0, // Pelaksanaan & Penerapan
  c4: 0, // Analisis & Pemetaan
  c5: 0, // Evaluasi & Validasi
  c6: 0, // Perancangan & Sintesis
};

history.forEach((entry) => {
  const fullText = [
    entry.deskripsiKegiatan,
    entry.kompetensiDikembangkan,
    entry.kendalaDihadapi,
    entry.solusiTindakan,
    entry.refleksiPembelajaran,
  ]
    .join(" ")
    .toLowerCase();

  domains.forEach((dom) => {
    const hit = dom.keywords.some((kw) => fullText.includes(kw));
    if (hit) dom.count += 1;
  });

  if (/melaksanakan|menerapkan|mengoperasikan|menggunakan|menjalankan|menyusun/.test(fullText)) {
    bloomCounts.c3 += 1;
  }
  if (/menganalisis|mengidentifikasi|memetakan|menelaah|mengurai|mendeteksi/.test(fullText)) {
    bloomCounts.c4 += 1;
  }
  if (/mengevaluasi|memvalidasi|menguji|menilai|memverifikasi|mengukur/.test(fullText)) {
    bloomCounts.c5 += 1;
  }
  if (/merancang|membangun|mengembangkan|mengintegrasikan|merumuskan|menciptakan/.test(fullText)) {
    bloomCounts.c6 += 1;
  }
});

const totalEntries = Math.max(1, history.length);
const domainScores = domains.map((d) => ({
  ...d,
  percentage: history.length === 0 ? 0 : Math.min(100, Math.round((d.count / totalEntries) * 100)),
}));

// Find lowest domain for recommendation
const sortedByWeakest = [...domainScores].sort((a, b) => a.percentage - b.percentage);
const weakestDomain = sortedByWeakest[0];

return {
  domainScores,
  bloomCounts,
  weakestDomain,
  totalEntries: history.length,
};
}
