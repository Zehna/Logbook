import { describe, expect, it } from "vitest";
import {
  getEntriesForExport,
  getSelectedEntriesForExport,
} from "@/src/lib/utils/exportEntries";
import type {
  LogbookEntry,
  LogbookResult,
  WeeklyLogbookDayItem,
} from "@/src/lib/exporters/types";

const result: LogbookResult = {
  deskripsiKegiatan: "Membuat laporan",
  kompetensiDikembangkan: "Menulis",
  kendalaDihadapi: "Waktu",
  solusiTindakan: "Prioritas",
  refleksiPembelajaran: "Belajar",
};

const historyEntry: LogbookEntry = {
  ...result,
  id: "hist-1",
  tanggal: "Senin, 1 Januari 2026",
  tipeKegiatan: "Magang MBKM",
  peran: "Intern",
};

const weeklyDay: WeeklyLogbookDayItem = {
  tanggal: "Senin, 1 Januari 2026",
  hari: "Senin",
  tahap_fase: "Fase 1",
  deskripsi_kegiatan: "Membuat laporan",
  kompetensi_dikembangkan: "Menulis",
  kendala_dihadapi: "Waktu",
  solusi_tindakan: "Prioritas",
  refleksi_pembelajaran: "Belajar",
};

const baseArgs = {
  history: [] as LogbookEntry[],
  weeklyResults: [] as WeeklyLogbookDayItem[],
  result: null as LogbookResult | null,
  resultPhoto: null as string | null,
  fotoMimeType: "image/jpeg",
  tipeKegiatan: "Magang MBKM",
  peran: "Intern",
};

describe("getEntriesForExport", () => {
  it("riwayat diutamakan dan id dipertahankan", () => {
    const out = getEntriesForExport({ ...baseArgs, history: [historyEntry] });
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("hist-1");
  });

  it("riwayat tanpa id mendapat id hist-*", () => {
    const noId = { ...historyEntry, id: "" };
    const out = getEntriesForExport({ ...baseArgs, history: [noId] });
    expect(out[0]?.id).toMatch(/^hist-0-/);
  });

  it("tanpa riwayat, hasil mingguan dipetakan ke entri", () => {
    const out = getEntriesForExport({ ...baseArgs, weeklyResults: [weeklyDay] });
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("weekly-0-Senin, 1 Januari 2026");
    expect(out[0]?.tahapFase).toBe("Fase 1");
    expect(out[0]?.deskripsiKegiatan).toBe("Membuat laporan");
  });

  it("tanpa riwayat & mingguan, hasil harian jadi satu entri current-result", () => {
    const out = getEntriesForExport({
      ...baseArgs,
      result,
      resultPhoto: "data:image/jpeg;base64,xxx",
    });
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("current-result");
    expect(out[0]?.fotoBase64).toBe("data:image/jpeg;base64,xxx");
    expect(out[0]?.fotoMimeType).toBe("image/jpeg");
  });

  it("tanpa data apa pun menghasilkan daftar kosong", () => {
    expect(getEntriesForExport(baseArgs)).toEqual([]);
  });
});

describe("getSelectedEntriesForExport", () => {
  const all = [historyEntry, { ...historyEntry, id: "hist-2" }];

  it("tanpa mode bulk, semua entri dikembalikan", () => {
    expect(getSelectedEntriesForExport(all, false, [])).toHaveLength(2);
  });

  it("mode bulk memfilter berdasarkan id terpilih", () => {
    const out = getSelectedEntriesForExport(all, true, ["hist-2"]);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("hist-2");
  });

  it("mode bulk dengan id tak dikenal menghasilkan daftar kosong", () => {
    expect(getSelectedEntriesForExport(all, true, ["tidak-ada"])).toEqual([]);
  });
});
