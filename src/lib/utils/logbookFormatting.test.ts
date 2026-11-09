import { describe, expect, it } from "vitest";
import {
  buildCanvaPosterDraft,
  buildSheetsTsv,
  formatDailyLogbookCopy,
  formatWeeklyDayCopy,
  formatWeeklyMarkdown,
} from "@/src/lib/utils/logbookFormatting";
import type {
  LogbookEntry,
  LogbookResult,
  StudentProfile,
  WeeklyLogbookDayItem,
} from "@/src/lib/exporters/types";

const result: LogbookResult = {
  deskripsiKegiatan: "Membuat laporan",
  kompetensiDikembangkan: "Menulis",
  kendalaDihadapi: "Waktu",
  solusiTindakan: "Prioritas",
  refleksiPembelajaran: "Belajar",
};

const day: WeeklyLogbookDayItem = {
  tanggal: "Senin, 1 Januari 2026",
  hari: "Senin",
  tahap_fase: "Fase 1",
  deskripsi_kegiatan: "Membuat laporan",
  kompetensi_dikembangkan: "Menulis",
  kendala_dihadapi: "Waktu",
  solusi_tindakan: "Prioritas",
  refleksi_pembelajaran: "Belajar",
};

const entry: LogbookEntry = {
  ...result,
  id: "hist-1",
  tanggal: "Senin, 1 Januari 2026",
  tipeKegiatan: "Magang MBKM",
  peran: "Intern",
};

const profile: StudentProfile = {
  namaMahasiswa: "Benny Wirasanjaya",
  nim: "180310240067",
  programStudi: "Ilmu Komunikasi",
  perguruanTinggi: "Universitas Padjadjaran",
  namaMitra: "Mitra Contoh",
  namaPembimbing: "Dosen Contoh",
  periodeKegiatan: "2026",
};

describe("formatDailyLogbookCopy", () => {
  it("memuat header dan kelima bagian Bloom", () => {
    const text = formatDailyLogbookCopy(result, "Magang MBKM", "Intern");
    expect(text).toContain("LOGBOOK HARIAN MAGANG MBKM");
    expect(text).toContain("Peran / Posisi: Intern");
    expect(text).toContain("1. Deskripsi Kegiatan:");
    expect(text).toContain("Membuat laporan");
    expect(text).toContain("5. Refleksi Pembelajaran:");
    expect(text).toContain("Belajar");
  });
});

describe("formatWeeklyDayCopy", () => {
  it("memuat tanggal, fase, dan kelima bagian", () => {
    const text = formatWeeklyDayCopy(day, "Magang MBKM", "Intern");
    expect(text).toContain("SENIN, 1 JANUARI 2026");
    expect(text).toContain("Fase Kegiatan: Fase 1");
    expect(text).toContain("2. Kompetensi yang Dikembangkan:");
  });
});

describe("formatWeeklyMarkdown", () => {
  it("mingguan kosong menghasilkan string kosong", () => {
    expect(formatWeeklyMarkdown([], "Magang MBKM", "Intern")).toBe("");
  });

  it("memuat judul rekap dan blok per hari", () => {
    const text = formatWeeklyMarkdown([day], "Magang MBKM", "Intern");
    expect(text).toContain("# REKAP LOGBOOK 1 PEKAN");
    expect(text).toContain("## Hari Ke-1: Senin, 1 Januari 2026 (Fase 1)");
    expect(text).toContain("Membuat laporan");
  });
});

describe("buildSheetsTsv", () => {
  it("header tab-separated dengan 8 kolom dan satu baris per entri", () => {
    const tsv = buildSheetsTsv([entry]);
    const lines = tsv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(
      "No\tTanggal\tPeran\tDeskripsi Kegiatan\tKompetensi\tKendala\tSolusi\tRefleksi Pembelajaran",
    );
    expect(lines[1]).toContain("Membuat laporan");
  });

  it("entri kosong hanya menghasilkan header", () => {
    expect(buildSheetsTsv([]).split("\n")).toHaveLength(1);
  });
});

describe("buildCanvaPosterDraft", () => {
  it("tanpa entri menghasilkan string kosong", () => {
    expect(buildCanvaPosterDraft([], "Magang MBKM", profile)).toBe("");
  });

  it("memuat penyusun, mitra, dan isi entri pertama", () => {
    const text = buildCanvaPosterDraft([entry], "Magang MBKM", profile);
    expect(text).toContain("Benny Wirasanjaya (180310240067)");
    expect(text).toContain("Mitra Contoh");
    expect(text).toContain("Membuat laporan");
  });
});
