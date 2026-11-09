import { describe, expect, it } from "vitest";
import {
  computeJaccardSimilarity,
  computeOverallUniqueness,
  getWordList,
  getWordSet,
} from "@/src/lib/utils/textSimilarity";
import type { LogbookEntry } from "@/src/lib/exporters/types";

const entry = (deskripsiKegiatan: string): LogbookEntry => ({
  id: "e1",
  tanggal: "Senin, 1 Januari 2026",
  tipeKegiatan: "Magang MBKM",
  peran: "Intern",
  deskripsiKegiatan,
  kompetensiDikembangkan: "",
  kendalaDihadapi: "",
  solusiTindakan: "",
  refleksiPembelajaran: "",
});

describe("getWordList", () => {
  it("lowercase, buang tanda baca, dan buang kata <= 2 huruf", () => {
    expect(getWordList("Halo, Dunia! AB")).toEqual(["halo", "dunia"]);
  });

  it("teks kosong menghasilkan daftar kosong", () => {
    expect(getWordList("")).toEqual([]);
  });
});

describe("getWordSet", () => {
  it("menghilangkan duplikat", () => {
    expect(getWordSet("laporan laporan harian")).toEqual(
      new Set(["laporan", "harian"]),
    );
  });
});

describe("computeJaccardSimilarity", () => {
  it("teks identik bernilai 100", () => {
    expect(
      computeJaccardSimilarity("membuat laporan harian", "membuat laporan harian"),
    ).toBe(100);
  });

  it("teks tanpa kata sama bernilai 0", () => {
    expect(computeJaccardSimilarity("membuat laporan", "memasak nasi goreng")).toBe(0);
  });

  it("tumpang tindih sebagian: 2 dari 4 kata unik", () => {
    // {membuat, laporan, harian} vs {membuat, laporan, mingguan} -> 2/4
    expect(
      computeJaccardSimilarity("membuat laporan harian", "membuat laporan mingguan"),
    ).toBe(50);
  });

  it("teks kosong bernilai 0", () => {
    expect(computeJaccardSimilarity("", "membuat laporan")).toBe(0);
  });
});

describe("computeOverallUniqueness", () => {
  it("tanpa entri bernilai 100", () => {
    expect(computeOverallUniqueness([])).toBe(100);
  });

  it("satu entri dengan kata berbeda semua bernilai 100", () => {
    expect(computeOverallUniqueness([entry("membuat laporan harian")])).toBe(100);
  });

  it("dua entri identik bernilai 50", () => {
    expect(
      computeOverallUniqueness([
        entry("membuat laporan harian"),
        entry("membuat laporan harian"),
      ]),
    ).toBe(50);
  });
});
