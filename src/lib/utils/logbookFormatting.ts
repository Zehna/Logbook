import type {
  LogbookEntry,
  LogbookResult,
  StudentProfile,
  WeeklyLogbookDayItem,
} from "@/src/lib/exporters/types";

/**
 * Formatter teks murni (tanpa clipboard / state) yang sebelumnya inline di
 * app/page.tsx. Dipindah verbatim agar bisa diuji unit tanpa browser.
 */

export function formatWeeklyMarkdown(
  weeklyResults: WeeklyLogbookDayItem[],
  tipeKegiatan: string,
  peran: string
): string {
  if (weeklyResults.length === 0) return "";
  const blocks = weeklyResults.map((day, idx) =>
      [
        `## Hari Ke-${idx + 1}: ${day.tanggal} (${day.tahap_fase})`,
        `- **Program & Peran:** ${tipeKegiatan} — ${peran}`,
        `- **1. Deskripsi Kegiatan:**\n  ${day.deskripsi_kegiatan}`,
        `- **2. Kompetensi yang Dikembangkan:**\n  ${day.kompetensi_dikembangkan}`,
        `- **3. Kendala yang Dihadapi:**\n  ${day.kendala_dihadapi}`,
        `- **4. Solusi & Tindakan:**\n  ${day.solusi_tindakan}`,
        `- **5. Refleksi Pembelajaran:**\n  ${day.refleksi_pembelajaran}`,
      ].join("\n")
    );

  return [
      `# REKAP LOGBOOK 1 PEKAN — ${tipeKegiatan.toUpperCase()}`,
      `**Peran / Posisi:** ${peran}`,
      `**Rentang Waktu:** ${weeklyResults[0]?.tanggal} s/d ${weeklyResults[weeklyResults.length - 1]?.tanggal}`,
      "",
      ...blocks.join("\n\n---\n\n").split("\n"),
    ].join("\n");
}

export function formatWeeklyDayCopy(
  day: WeeklyLogbookDayItem,
  tipeKegiatan: string,
  peran: string
): string {
  return [
    `LOGBOOK HARIAN ${tipeKegiatan.toUpperCase()} — ${day.tanggal.toUpperCase()}`,
    `Peran / Posisi: ${peran}`,
    `Fase Kegiatan: ${day.tahap_fase}`,
    "",
    `1. Deskripsi Kegiatan:`,
    day.deskripsi_kegiatan,
    "",
    `2. Kompetensi yang Dikembangkan:`,
    day.kompetensi_dikembangkan,
    "",
    `3. Kendala yang Dihadapi:`,
    day.kendala_dihadapi,
    "",
    `4. Solusi & Tindakan:`,
    day.solusi_tindakan,
    "",
    `5. Refleksi Pembelajaran:`,
    day.refleksi_pembelajaran,
  ].join("\n");
}

export function formatDailyLogbookCopy(
  result: LogbookResult,
  tipeKegiatan: string,
  peran: string
): string {
  return [
      `LOGBOOK HARIAN ${tipeKegiatan.toUpperCase()}`,
      `Peran / Posisi: ${peran}`,
      `Tanggal: ${new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      "",
      `1. Deskripsi Kegiatan:`,
      result.deskripsiKegiatan,
      "",
      `2. Kompetensi yang Dikembangkan:`,
      result.kompetensiDikembangkan,
      "",
      `3. Kendala yang Dihadapi:`,
      result.kendalaDihadapi,
      "",
      `4. Solusi & Tindakan:`,
      result.solusiTindakan,
      "",
      `5. Refleksi Pembelajaran:`,
      result.refleksiPembelajaran,
    ].join("\n");
}

export function buildCanvaPosterDraft(
  entries: LogbookEntry[],
  tipeKegiatan: string,
  studentProfile: StudentProfile
): string {
    const active = entries[0];
    if (!active) return "";
    return [
      `🎯 POSTER PUBLIKASI / LUARAN KEGIATAN ${tipeKegiatan.toUpperCase()}`,
      `👤 Penyusun: ${studentProfile.namaMahasiswa} (${studentProfile.nim})`,
      `🏢 Peran & Mitra: ${active.peran} — ${studentProfile.namaMitra}`,
      "",
      "📌 RINGKASAN AKTIVITAS UTAMA:",
      active.deskripsiKegiatan,
      "",
      "🏆 CAPAIAN KOMPETENSI:",
      active.kompetensiDikembangkan,
      "",
      "💡 INOVASI & SOLUSI PEMECAHAN MASALAH:",
      active.solusiTindakan,
      "",
      "🌟 REFLEKSI & DAMPAK KEGIATAN:",
      active.refleksiPembelajaran,
    ].join("\n");
}

export function buildSheetsTsv(entries: LogbookEntry[]): string {
  const header = [
      "No",
      "Tanggal",
      "Peran",
      "Deskripsi Kegiatan",
      "Kompetensi",
      "Kendala",
      "Solusi",
      "Refleksi Pembelajaran",
    ].join("\t");
  const rows = entries.map((e, i) =>
      [
        i + 1,
        e.tanggal,
        e.peran,
        e.deskripsiKegiatan.replace(/\s+/g, " "),
        e.kompetensiDikembangkan.replace(/\s+/g, " "),
        e.kendalaDihadapi.replace(/\s+/g, " "),
        e.solusiTindakan.replace(/\s+/g, " "),
        e.refleksiPembelajaran.replace(/\s+/g, " "),
      ].join("\t")
    );
  return [header, ...rows].join("\n");
}
