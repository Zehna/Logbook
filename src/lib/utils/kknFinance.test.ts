import { describe, expect, it } from "vitest";
import { computeFinancialSummary, formatRupiah } from "./kknFinance";
import type { KknRabItem } from "@/src/lib/data/kknSamples";

function item(
  overrides: Partial<KknRabItem> = {}
): KknRabItem {
  return {
    id: "rab-1",
    prokerTerkait: "Proker A",
    uraianPengeluaran: "Belanja",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 1000000,
    realisasiPengeluaran: 750000,
    nomorBuktiNota: "KW/001",
    ...overrides,
  };
}

describe("computeFinancialSummary", () => {
  it("menjumlahkan rencana & realisasi dan menghitung serapan", () => {
    const s = computeFinancialSummary([
      item(),
      item({ id: "rab-2", anggaranRencana: 500000, realisasiPengeluaran: 500000 }),
    ]);
    expect(s.totalRencana).toBe(1500000);
    expect(s.totalRealisasi).toBe(1250000);
    expect(s.sisaSaldo).toBe(250000);
    expect(s.serapanPersen).toBe(83);
  });

  it("mengembalikan 0 saat tidak ada item (hindari NaN)", () => {
    expect(computeFinancialSummary([])).toEqual({
      totalRencana: 0,
      totalRealisasi: 0,
      sisaSaldo: 0,
      serapanPersen: 0,
    });
  });

  it("membatasi serapan maksimal 100%", () => {
    const s = computeFinancialSummary([
      item({ anggaranRencana: 100, realisasiPengeluaran: 250 }),
    ]);
    expect(s.serapanPersen).toBe(100);
    expect(s.sisaSaldo).toBe(-150);
  });
});

describe("formatRupiah", () => {
  it("memformat dengan pemisah ribuan id-ID", () => {
    expect(formatRupiah(1500000)).toBe("Rp 1.500.000");
    expect(formatRupiah(0)).toBe("Rp 0");
  });
});
