import { describe, expect, it } from "vitest";
import { buildCombinedLogbookText } from "./combinedLogbookText";
import type { LogbookEntry, WeeklyLogbookDayItem } from "@/src/lib/exporters/types";

const entry = (tanggal: string): LogbookEntry => ({
  id: `e-${tanggal}`,
  tanggal,
  tipeKegiatan: "Magang MBKM",
  peran: "Staff Magang",
  deskripsiKegiatan: "Rekap nota",
  kompetensiDikembangkan: "Excel",
  kendalaDihadapi: "Nota tidak sinkron",
  solusiTindakan: "Cek ulang",
  refleksiPembelajaran: "Teliti",
});

describe("buildCombinedLogbookText", () => {
  it("memakai riwayat (maks 10) bila ada", () => {
    const text = buildCombinedLogbookText({
      history: [entry("Senin, 1 Jan 2026"), entry("Selasa, 2 Jan 2026")],
      weeklyResults: [],
      result: null,
      catatan: "catatan mentah",
      tipeKegiatan: "Magang MBKM",
      peran: "Staff",
    });
    expect(text).toContain("[Hari #1 - Senin, 1 Jan 2026]");
    expect(text).toContain("[Hari #2 - Selasa, 2 Jan 2026]");
    expect(text).not.toContain("catatan mentah");
  });

  it("jatuh ke hasil mingguan bila riwayat kosong", () => {
    const day: WeeklyLogbookDayItem = {
      tanggal: "2026-01-05",
      hari: "Senin",
      tahap_fase: "Orientasi",
      deskripsi_kegiatan: "Onboarding",
      kompetensi_dikembangkan: "Komunikasi",
      kendala_dihadapi: "Belum ada akses",
      solusi_tindakan: "Minta akses",
      refleksi_pembelajaran: "Proaktif",
    };
    const text = buildCombinedLogbookText({
      history: [],
      weeklyResults: [day],
      result: null,
      catatan: "",
      tipeKegiatan: "Magang MBKM",
      peran: "Staff",
    });
    expect(text).toContain("[Hari #1 - Senin, 2026-01-05] (Orientasi)");
  });

  it("jatuh ke hasil harian lalu ke catatan mentah", () => {
    const withResult = buildCombinedLogbookText({
      history: [],
      weeklyResults: [],
      result: {
        deskripsiKegiatan: "D",
        kompetensiDikembangkan: "K",
        kendalaDihadapi: "Kd",
        solusiTindakan: "S",
        refleksiPembelajaran: "R",
      },
      catatan: "mentah",
      tipeKegiatan: "KKN",
      peran: "Anggota",
    });
    expect(withResult).toContain("[Logbook Terkini - KKN] (Anggota)");
    const empty = buildCombinedLogbookText({
      history: [],
      weeklyResults: [],
      result: null,
      catatan: "mentah saja",
      tipeKegiatan: "KKN",
      peran: "Anggota",
    });
    expect(empty).toBe("mentah saja");
  });
});
