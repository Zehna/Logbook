/**
 * indonesianHolidays.ts
 * Detektor Hari Libur Nasional & Akhir Pekan Resmi Indonesia
 * Digunakan untuk validasi kepatuhan jadwal logbook harian & mingguan mahasiswa magang/KKN.
 */

export interface HolidayCheckResult {
  isHoliday: boolean;
  isWeekend: boolean;
  isNonWorkingDay: boolean;
  name: string | null;
  description: string | null;
  formattedDate: string;
}

export interface RangeHolidayItem {
  date: string;
  formattedDate: string;
  description: string;
  info: HolidayCheckResult;
}

// Database Hari Libur Nasional & Cuti Bersama Resmi Indonesia (2024 - 2027)
const HOLIDAYS_MAP: Record<string, string> = {
  // === 2024 ===
  "2024-01-01": "Tahun Baru 2024 Masehi",
  "2024-02-08": "Isra Miraj Nabi Muhammad SAW",
  "2024-02-09": "Cuti Bersama Tahun Baru Imlek",
  "2024-02-10": "Tahun Baru Imlek 2575 Kongzili",
  "2024-03-11": "Hari Suci Nyepi Tahun Baru Saka 1946",
  "2024-03-12": "Cuti Bersama Hari Suci Nyepi",
  "2024-03-29": "Wafat Isa Almasih",
  "2024-03-31": "Hari Paskah",
  "2024-04-08": "Cuti Bersama Hari Raya Idul Fitri 1445 H",
  "2024-04-09": "Cuti Bersama Hari Raya Idul Fitri 1445 H",
  "2024-04-10": "Hari Raya Idul Fitri 1445 H",
  "2024-04-11": "Hari Raya Idul Fitri 1445 H",
  "2024-04-12": "Cuti Bersama Hari Raya Idul Fitri 1445 H",
  "2024-04-15": "Cuti Bersama Hari Raya Idul Fitri 1445 H",
  "2024-05-01": "Hari Buruh Internasional",
  "2024-05-09": "Kenaikan Isa Almasih",
  "2024-05-10": "Cuti Bersama Kenaikan Isa Almasih",
  "2024-05-23": "Hari Raya Waisak 2568 BE",
  "2024-05-24": "Cuti Bersama Hari Raya Waisak",
  "2024-06-01": "Hari Lahir Pancasila",
  "2024-06-17": "Hari Raya Idul Adha 1445 H",
  "2024-06-18": "Cuti Bersama Hari Raya Idul Adha",
  "2024-07-07": "Tahun Baru Islam 1446 H",
  "2024-08-17": "Hari Kemerdekaan Republik Indonesia ke-79",
  "2024-09-16": "Maulid Nabi Muhammad SAW",
  "2024-12-25": "Hari Raya Natal",
  "2024-12-26": "Cuti Bersama Hari Raya Natal",

  // === 2025 ===
  "2025-01-01": "Tahun Baru 2025 Masehi",
  "2025-01-27": "Isra Miraj Nabi Muhammad SAW",
  "2025-01-28": "Cuti Bersama Tahun Baru Imlek",
  "2025-01-29": "Tahun Baru Imlek 2576 Kongzili",
  "2025-03-28": "Cuti Bersama Hari Suci Nyepi",
  "2025-03-29": "Hari Suci Nyepi Tahun Baru Saka 1947",
  "2025-03-31": "Hari Raya Idul Fitri 1446 H",
  "2025-04-01": "Hari Raya Idul Fitri 1446 H",
  "2025-04-02": "Cuti Bersama Hari Raya Idul Fitri 1446 H",
  "2025-04-03": "Cuti Bersama Hari Raya Idul Fitri 1446 H",
  "2025-04-04": "Cuti Bersama Hari Raya Idul Fitri 1446 H",
  "2025-04-07": "Cuti Bersama Hari Raya Idul Fitri 1446 H",
  "2025-04-18": "Wafat Yesus Kristus",
  "2025-04-20": "Kebangkitan Yesus Kristus (Paskah)",
  "2025-05-01": "Hari Buruh Internasional",
  "2025-05-12": "Hari Raya Waisak 2569 BE",
  "2025-05-13": "Cuti Bersama Hari Raya Waisak",
  "2025-05-29": "Kenaikan Yesus Kristus",
  "2025-05-30": "Cuti Bersama Kenaikan Yesus Kristus",
  "2025-06-01": "Hari Lahir Pancasila",
  "2025-06-06": "Hari Raya Idul Adha 1446 H",
  "2025-06-09": "Cuti Bersama Hari Raya Idul Adha",
  "2025-06-27": "1 Muharram / Tahun Baru Islam 1447 H",
  "2025-08-17": "Hari Kemerdekaan Republik Indonesia ke-80",
  "2025-09-05": "Maulid Nabi Muhammad SAW",
  "2025-12-25": "Hari Raya Natal",
  "2025-12-26": "Cuti Bersama Hari Raya Natal",

  // === 2026 ===
  "2026-01-01": "Tahun Baru 2026 Masehi",
  "2026-01-16": "Isra Miraj Nabi Muhammad SAW",
  "2026-02-16": "Cuti Bersama Tahun Baru Imlek",
  "2026-02-17": "Tahun Baru Imlek 2577 Kongzili",
  "2026-03-19": "Hari Suci Nyepi Tahun Baru Saka 1948",
  "2026-03-20": "Hari Raya Idul Fitri 1447 H / Cuti Bersama Nyepi",
  "2026-03-21": "Hari Raya Idul Fitri 1447 H (Hari Kedua)",
  "2026-03-23": "Cuti Bersama Hari Raya Idul Fitri 1447 H",
  "2026-03-24": "Cuti Bersama Hari Raya Idul Fitri 1447 H",
  "2026-04-03": "Wafat Yesus Kristus",
  "2026-04-05": "Paskah",
  "2026-05-01": "Hari Buruh Internasional",
  "2026-05-14": "Kenaikan Yesus Kristus",
  "2026-05-15": "Cuti Bersama Kenaikan Yesus Kristus",
  "2026-05-27": "Hari Raya Idul Adha 1447 H",
  "2026-05-28": "Cuti Bersama Hari Raya Idul Adha",
  "2026-05-31": "Hari Raya Waisak 2570 BE",
  "2026-06-01": "Hari Lahir Pancasila",
  "2026-06-16": "Tahun Baru Islam 1448 H",
  "2026-08-17": "Hari Kemerdekaan Republik Indonesia ke-81",
  "2026-08-25": "Maulid Nabi Muhammad SAW",
  "2026-12-24": "Cuti Bersama Hari Raya Natal",
  "2026-12-25": "Hari Raya Natal",

  // === 2027 ===
  "2027-01-01": "Tahun Baru 2027 Masehi",
  "2027-01-05": "Isra Miraj Nabi Muhammad SAW",
  "2027-02-06": "Tahun Baru Imlek 2578 Kongzili",
  "2027-03-09": "Hari Raya Idul Fitri 1448 H",
  "2027-03-10": "Hari Raya Idul Fitri 1448 H",
  "2027-03-26": "Wafat Yesus Kristus",
  "2027-04-07": "Hari Suci Nyepi Tahun Baru Saka 1949",
  "2027-05-01": "Hari Buruh Internasional",
  "2027-05-06": "Kenaikan Yesus Kristus",
  "2027-05-16": "Hari Raya Idul Adha 1448 H",
  "2027-05-20": "Hari Raya Waisak 2571 BE",
  "2027-06-01": "Hari Lahir Pancasila",
  "2027-06-06": "Tahun Baru Islam 1449 H",
  "2027-08-17": "Hari Kemerdekaan Republik Indonesia ke-82",
  "2027-08-14": "Maulid Nabi Muhammad SAW",
  "2027-12-25": "Hari Raya Natal",
};

/**
 * Cek apakah sebuah tanggal (format YYYY-MM-DD) merupakan Hari Libur Nasional atau Akhir Pekan (Sabtu/Minggu)
 */
export function getIndonesianHolidayInfo(dateStr: string): HolidayCheckResult {
  if (!dateStr || !dateStr.includes("-")) {
    return {
      isHoliday: false,
      isWeekend: false,
      isNonWorkingDay: false,
      name: null,
      description: null,
      formattedDate: dateStr || "",
    };
  }

  // Parse YYYY-MM-DD aman timezone lokal
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay(); // 0 = Minggu, 6 = Sabtu

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekendName = dayOfWeek === 0 ? "Hari Minggu" : dayOfWeek === 6 ? "Hari Sabtu" : null;

  const MONTH_NAMES_ID = [
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

  // Format tanggal Indonesia resmi deterministik (kebal perbedaan ICU/timezone host)
  const formattedDate = `${day} ${MONTH_NAMES_ID[month - 1] || month} ${year}`;

  // Cek exact holiday
  const holidayName = HOLIDAYS_MAP[dateStr];

  // Fallback tanggal tetap nasional
  const recurringKey = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  let fallbackHoliday: string | null = null;
  if (recurringKey === "01-01") fallbackHoliday = "Tahun Baru Masehi";
  else if (recurringKey === "05-01") fallbackHoliday = "Hari Buruh Internasional";
  else if (recurringKey === "06-01") fallbackHoliday = "Hari Lahir Pancasila";
  else if (recurringKey === "08-17") fallbackHoliday = "Hari Kemerdekaan Republik Indonesia";
  else if (recurringKey === "12-25") fallbackHoliday = "Hari Raya Natal";

  const resolvedHolidayName = holidayName || fallbackHoliday;
  const isHoliday = Boolean(resolvedHolidayName);
  const isNonWorkingDay = isHoliday || isWeekend;

  let displayName: string | null = null;
  if (isHoliday && isWeekend) {
    displayName = `${resolvedHolidayName} (${weekendName})`;
  } else if (isHoliday) {
    displayName = resolvedHolidayName;
  } else if (isWeekend) {
    displayName = `Akhir Pekan (${weekendName})`;
  }

  const description = isNonWorkingDay
    ? displayName || "Hari Libur"
    : null;

  return {
    isHoliday,
    isWeekend,
    isNonWorkingDay,
    name: displayName,
    description,
    formattedDate,
  };
}

/**
 * Cek daftar hari libur di dalam rentang tanggal (misal untuk Mode Borongan 1 Pekan)
 */
export function checkRangeForHolidays(
  startDateStr: string,
  endDateStr: string
): RangeHolidayItem[] {
  if (!startDateStr || !endDateStr) return [];

  const results: RangeHolidayItem[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (start > end) return [];

  const current = new Date(start);
  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const info = getIndonesianHolidayInfo(dateStr);
    if (info.isNonWorkingDay) {
      results.push({
        date: dateStr,
        formattedDate: info.formattedDate,
        description: info.description || info.name || "Hari Libur",
        info,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return results;
}
