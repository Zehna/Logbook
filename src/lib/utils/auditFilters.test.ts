import { describe, expect, it } from "vitest";
import {
  assessEntryQuality,
  checkDateMatch,
  computeAuditMetrics,
  extractAvailableActivityTypes,
  filterHistory,
  type AuditFilters,
} from "./auditFilters";
import type { LogbookEntry } from "@/src/lib/exporters/types";

function entry(overrides: Partial<LogbookEntry> = {}): LogbookEntry {
  return {
    id: "1",
    tanggal: "2026-11-09",
    deskripsiKegiatan:
      "Menganalisis data sistem dan mengimplementasikan antarmuka pengguna baru untuk modul laporan magang mahasiswa dengan evaluasi berkala dan dokumentasi lengkap setiap pekan",
    kompetensiDikembangkan: "Analisis data",
    kendalaDihadapi: "Kendala konfigurasi",
    solusiTindakan: "Mengoptimalkan konfigurasi",
    refleksiPembelajaran: "Merancang modul baru",
    peran: "Magang",
    tipeKegiatan: "Magang MBKM",
    ...overrides,
  } as LogbookEntry;
}

const baseFilters: AuditFilters = {
  query: "",
  activityType: "all",
  selectedDate: "",
  datePreset: "all",
  qualityFilter: "all",
};

describe("checkDateMatch", () => {
  it("target kosong selalu cocok, entri kosong tidak cocok", () => {
    expect(checkDateMatch("2026-11-09", "")).toBe(true);
    expect(checkDateMatch("", "2026-11-09")).toBe(false);
  });

  it("cocok lewat ISO, tanggal panjang Indonesia, dan DD/MM/YYYY", () => {
    expect(checkDateMatch("2026-11-09", "2026-11-09")).toBe(true);
    expect(checkDateMatch("Senin, 9 November 2026", "2026-11-09")).toBe(true);
    expect(checkDateMatch("09/11/2026", "2026-11-09")).toBe(true);
    expect(checkDateMatch("09-11-2026", "2026-11-09")).toBe(true);
  });

  it("tidak cocok untuk tanggal lain", () => {
    expect(checkDateMatch("2026-11-06", "2026-11-09")).toBe(false);
    expect(checkDateMatch("Senin, 9 November 2025", "2026-11-09")).toBe(false);
  });
});

describe("computeAuditMetrics", () => {
  it("riwayat kosong berarti keunikan 100 tanpa masalah", () => {
    expect(computeAuditMetrics([])).toEqual({
      uniquenessScore: 100,
      shortEntriesCount: 0,
      repetitiveEntriesCount: 0,
    });
  });

  it("menghitung entri singkat dan repetitif", () => {
    const short = entry({ id: "a", deskripsiKegiatan: "Rapat tim" });
    const dupText =
      "Menganalisis data sistem dan mengimplementasikan antarmuka pengguna baru untuk modul laporan magang mahasiswa dengan evaluasi berkala dan dokumentasi lengkap setiap pekan";
    const dup1 = entry({ id: "b", deskripsiKegiatan: dupText });
    const dup2 = entry({ id: "c", deskripsiKegiatan: dupText });
    expect(computeAuditMetrics([short, dup1, dup2])).toEqual({
      uniquenessScore: expect.any(Number),
      shortEntriesCount: 1,
      repetitiveEntriesCount: 2,
    });
  });
});

describe("extractAvailableActivityTypes", () => {
  it("selalu memuat tiga program bawaan plus tipe dari riwayat", () => {
    expect(extractAvailableActivityTypes([entry({ tipeKegiatan: "PKL" })])).toEqual([
      "Magang MBKM",
      "MSIB",
      "KKN",
      "PKL",
    ]);
  });
});

describe("assessEntryQuality", () => {
  it("entri singkat ditandai perlu perbaikan", () => {
    const q = assessEntryQuality(entry({ deskripsiKegiatan: "Rapat tim" }), []);
    expect(q.isShort).toBe(true);
    expect(q.wordCount).toBe(2);
    expect(q.needsFix).toBe(true);
  });

  it("entri repetitif membawa tanggal pasangan yang mirip", () => {
    const text =
      "Menganalisis data sistem dan mengimplementasikan antarmuka pengguna baru untuk modul laporan magang mahasiswa dengan evaluasi berkala dan dokumentasi lengkap setiap pekan";
    const other = entry({ id: "2", tanggal: "2026-11-06", deskripsiKegiatan: text });
    const q = assessEntryQuality(entry({ deskripsiKegiatan: text }), [other]);
    expect(q.isRepetitive).toBe(true);
    expect(q.maxSimilarity).toBe(100);
    expect(q.matchedDate).toBe("2026-11-06");
    expect(q.needsFix).toBe(true);
  });

  it("entri panjang dan unik dinilai optimal", () => {
    const q = assessEntryQuality(entry(), [entry({ id: "2", deskripsiKegiatan: "Membuat kopi pagi" })]);
    expect(q.isShort).toBe(false);
    expect(q.isRepetitive).toBe(false);
    expect(q.needsFix).toBe(false);
  });
});

describe("filterHistory", () => {
  const history = [
    entry({
      id: "1",
      tanggal: "2026-11-09",
      tipeKegiatan: "Magang MBKM",
      peran: "Frontend",
      deskripsiKegiatan:
        "Merancang antarmuka dasbor monitoring magang dengan grafik progres harian dan notifikasi tenggat laporan untuk pembimbing lapangan serta eksport ringkasan mingguan otomatis ke dokumen word",
    }),
    entry({ id: "2", tanggal: "2026-11-06", tipeKegiatan: "KKN", peran: "Sekretaris", deskripsiKegiatan: "Rapat tim" }),
    entry({
      id: "3",
      tanggal: "2026-10-20",
      tipeKegiatan: "Magang MBKM",
      peran: "Backend",
      deskripsiKegiatan:
        "Membangun layanan sinkronisasi data kehadiran berbasis antrean dengan pencatatan waktu dan penanganan galat jaringan secara otomatis beserta laporan pemakaian harian untuk administrator sistem",
    }),
  ];
  const now = new Date(2026, 10, 9);

  it("tanpa filter mengembalikan semua entri", () => {
    expect(filterHistory(history, baseFilters, now)).toHaveLength(3);
  });

  it("filter kata kunci mencari di tanggal, peran, dan deskripsi", () => {
    expect(filterHistory(history, { ...baseFilters, query: "sekretaris" }, now).map((e) => e.id)).toEqual(["2"]);
    expect(filterHistory(history, { ...baseFilters, query: "rapat" }, now).map((e) => e.id)).toEqual(["2"]);
  });

  it("filter tipe kegiatan", () => {
    expect(filterHistory(history, { ...baseFilters, activityType: "KKN" }, now).map((e) => e.id)).toEqual(["2"]);
  });

  it("filter tanggal: today, 7days, dan tanggal spesifik", () => {
    expect(filterHistory(history, { ...baseFilters, datePreset: "today" }, now).map((e) => e.id)).toEqual(["1"]);
    expect(filterHistory(history, { ...baseFilters, datePreset: "7days" }, now).map((e) => e.id)).toEqual(["1", "2"]);
    expect(
      filterHistory(history, { ...baseFilters, selectedDate: "2026-10-20" }, now).map((e) => e.id)
    ).toEqual(["3"]);
  });

  it("filter kualitas: needs_fix vs optimal", () => {
    expect(filterHistory(history, { ...baseFilters, qualityFilter: "needs_fix" }, now).map((e) => e.id)).toEqual(["2"]);
    expect(filterHistory(history, { ...baseFilters, qualityFilter: "optimal" }, now).map((e) => e.id)).toEqual(["1", "3"]);
  });
});
