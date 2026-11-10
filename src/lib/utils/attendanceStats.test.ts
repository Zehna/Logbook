import { describe, expect, it } from "vitest";
import {
  MILESTONES,
  TARGET_DAYS,
  TARGET_HOURS,
  computeDashboardData,
  computeHoursProgress,
  computeQualityAudit,
  emptyDashboardData,
  findMatchingEntry,
} from "./attendanceStats";
import type { LogbookEntry } from "@/src/lib/exporters/types";

function entry(overrides: Partial<LogbookEntry> = {}): LogbookEntry {
  return {
    id: "1",
    tanggal: "2026-11-09",
    deskripsiKegiatan: "Menganalisis data sistem",
    kompetensiDikembangkan: "Analisis data",
    kendalaDihadapi: "Kendala konfigurasi",
    solusiTindakan: "Mengoptimalkan konfigurasi",
    refleksiPembelajaran: "Merancang modul baru",
    peran: "Magang",
    tipeKegiatan: "Magang MBKM",
    ...overrides,
  } as LogbookEntry;
}

describe("computeHoursProgress", () => {
  it("nol hari berarti nol jam dan sisa penuh", () => {
    expect(computeHoursProgress(0)).toEqual({
      totalHours: 0,
      percentComplete: 0,
      remainingHours: 900,
      remainingDays: 113,
    });
    expect(TARGET_HOURS).toBe(900);
    expect(TARGET_DAYS).toBe(113);
  });

  it("56 hari mencapai setengah target", () => {
    expect(computeHoursProgress(56)).toEqual({
      totalHours: 448,
      percentComplete: 50,
      remainingHours: 452,
      remainingDays: 57,
    });
  });

  it("persentase dibatasi 100 dan sisa nol setelah target", () => {
    expect(computeHoursProgress(113)).toEqual({
      totalHours: 904,
      percentComplete: 100,
      remainingHours: 0,
      remainingDays: 0,
    });
  });

  it("milestone terakhir adalah target 20 SKS", () => {
    expect(MILESTONES[MILESTONES.length - 1]).toEqual({
      label: "20 SKS",
      fullTitle: "Target Lulus Konversi 20 SKS (100%)",
      hours: 900,
      days: 113,
    });
  });
});

describe("computeQualityAudit", () => {
  it("riwayat kosong berarti keunikan 100 dan rata-rata 0 kata", () => {
    expect(computeQualityAudit([])).toEqual({ uniqueness: 100, avgWords: 0 });
  });

  it("kata yang berulang menurunkan skor keunikan", () => {
    const audit = computeQualityAudit([
      entry({ deskripsiKegiatan: "Menganalisis data sistem" }),
      entry({ id: "2", deskripsiKegiatan: "Menganalisis data sistem" }),
    ]);
    expect(audit).toEqual({ uniqueness: 50, avgWords: 3 });
  });
});

describe("findMatchingEntry", () => {
  it("cocok lewat tanggal ISO", () => {
    expect(findMatchingEntry(new Date(2026, 10, 9), [entry()])?.id).toBe("1");
  });

  it("cocok lewat tanggal panjang Bahasa Indonesia", () => {
    const e = entry({ tanggal: "Senin, 9 November 2026" });
    expect(findMatchingEntry(new Date(2026, 10, 9), [e])?.id).toBe("1");
  });

  it("tidak cocok untuk tanggal lain", () => {
    expect(findMatchingEntry(new Date(2026, 10, 9), [entry({ tanggal: "2026-11-06" })])).toBeUndefined();
  });
});

describe("computeDashboardData", () => {
  // 2026-11-09 adalah hari Senin
  const monday = new Date(2026, 10, 9);

  it("riwayat kosong menghasilkan 30 hari kerja tanpa isian", () => {
    const data = computeDashboardData([], monday);
    expect(data.workDays).toHaveLength(30);
    expect(data.weeklyBuckets).toHaveLength(8);
    expect(data.filledCountIn30Days).toBe(0);
    expect(data.missedCountIn30Days).toBe(30);
    expect(data.consistencyRate30d).toBe(0);
    expect(data.currentStreakDays).toBe(0);
    expect(data.bestStreakDays).toBe(0);
    expect(data.activeWeekStreak).toBe(0);
    expect(emptyDashboardData()).toEqual({
      workDays: [],
      weeklyBuckets: [],
      currentStreakDays: 0,
      bestStreakDays: 0,
      activeWeekStreak: 0,
      filledCountIn30Days: 0,
      missedCountIn30Days: 30,
      consistencyRate30d: 0,
    });
  });

  it("menghitung isian, streak, dan bucket mingguan dari riwayat seminggu penuh", () => {
    const history = [
      "2026-11-09",
      "2026-11-06",
      "2026-11-05",
      "2026-11-04",
      "2026-11-03",
      "2026-11-02",
    ].map((tanggal, i) => entry({ id: String(i + 1), tanggal }));
    const data = computeDashboardData(history, monday);
    expect(data.filledCountIn30Days).toBe(6);
    expect(data.consistencyRate30d).toBe(20);
    expect(data.currentStreakDays).toBe(6);
    expect(data.bestStreakDays).toBe(6);
    expect(data.weeklyBuckets[7].filledDays).toBe(1); // pekan ini: hanya Senin
    expect(data.weeklyBuckets[6].filledDays).toBe(5); // pekan lalu: Senin-Jumat
    expect(data.activeWeekStreak).toBe(2);
  });
});
