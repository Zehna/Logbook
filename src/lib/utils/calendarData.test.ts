import { describe, expect, it } from "vitest";
import {
  buildCalendarData,
  computeCompetencyAnalytics,
} from "./calendarData";
import type { LogbookEntry } from "@/src/lib/exporters/types";

function entry(overrides: Partial<LogbookEntry> = {}): LogbookEntry {
  return {
    tanggal: "2026-02-10",
    deskripsiKegiatan: "Menganalisis data sistem dan mengimplementasikan api",
    kompetensiDikembangkan: "Analisis data",
    kendalaDihadapi: "Kendala konfigurasi database",
    solusiTindakan: "Mengoptimalkan konfigurasi dan mengevaluasi hasil",
    refleksiPembelajaran: "Merancang modul baru",
    peran: "Magang",
    tipeKegiatan: "Magang",
    ...overrides,
  } as LogbookEntry;
}

describe("buildCalendarData", () => {
  it("menghasilkan 35 atau 42 sel dengan jumlah hari bulan berjalan yang tepat", () => {
    // Februari 2026: 28 hari
    const data = buildCalendarData(2026, 1, []);
    expect([35, 42]).toContain(data.cells.length);
    expect(data.cells.filter((c) => c.isCurrentMonth)).toHaveLength(28);
    expect(data.filledInMonth).toHaveLength(0);
    expect(data.missingWorkdaysInMonth.length).toBeGreaterThan(0);
  });

  it("mencocokkan entri berdasarkan tanggal ISO dan menandai hari terisi", () => {
    const data = buildCalendarData(2026, 1, [entry()]);
    expect(data.filledInMonth).toHaveLength(1);
    expect(data.filledInMonth[0].isoDate).toBe("2026-02-10");
    expect(data.filledInMonth[0].matchedEntry?.tanggal).toBe("2026-02-10");
    const missing = data.missingWorkdaysInMonth.map((c) => c.isoDate);
    expect(missing).not.toContain("2026-02-10");
  });

  it("mencocokkan entri berdasarkan format tanggal Indonesia", () => {
    const data = buildCalendarData(2026, 1, [
      entry({ tanggal: "10 Februari 2026" }),
    ]);
    expect(data.filledInMonth).toHaveLength(1);
  });

  it("tidak menghitung akhir pekan dan hari mendatang sebagai hari kerja kosong", () => {
    const data = buildCalendarData(2026, 1, []);
    for (const c of data.missingWorkdaysInMonth) {
      expect(c.isWeekend).toBe(false);
      expect(c.isFuture).toBe(false);
      expect(c.holidayName).toBeNull();
    }
  });
});

describe("computeCompetencyAnalytics", () => {
  it("menghitung skor domain dan bloom dari kata kunci", () => {
    const a = computeCompetencyAnalytics([entry()]);
    expect(a.totalEntries).toBe(1);
    expect(a.domainScores).toHaveLength(5);
    const technical = a.domainScores.find((d) => d.id === "technical");
    expect(technical?.count).toBe(1);
    expect(technical?.percentage).toBe(100);
    // "menganalisis" -> C4, "mengoptimalkan"+"mengevaluasi" -> C5, "merancang" -> C6
    expect(a.bloomCounts.c4).toBe(1);
    expect(a.bloomCounts.c5).toBe(1);
    expect(a.bloomCounts.c6).toBe(1);
    expect(a.weakestDomain).toBeDefined();
  });

  it("mengembalikan 0 saat riwayat kosong tanpa NaN", () => {
    const a = computeCompetencyAnalytics([]);
    expect(a.totalEntries).toBe(0);
    expect(a.domainScores.every((d) => d.percentage === 0)).toBe(true);
    expect(a.bloomCounts).toEqual({ c3: 0, c4: 0, c5: 0, c6: 0 });
  });
});
