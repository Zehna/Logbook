import { describe, expect, it } from "vitest";
import {
  buildMailtoHref,
  getFormattedLogbookSnippet,
} from "./livePreviewText";
import type { LogbookEntry, StudentProfile } from "@/src/lib/exporters/types";

function entry(overrides: Partial<LogbookEntry> = {}): LogbookEntry {
  return {
    tanggal: "2026-02-10",
    peran: "Magang",
    tipeKegiatan: "Magang MBKM",
    deskripsiKegiatan: "Menganalisis data",
    kompetensiDikembangkan: "Analisis data",
    kendalaDihadapi: "Server lambat",
    solusiTindakan: "Optimasi query",
    refleksiPembelajaran: "Belajar indexing",
    ...overrides,
  } as LogbookEntry;
}

const profile = {
  namaMahasiswa: "Budi Santoso",
  nim: "180310240067",
  namaMitra: "PT Contoh",
  namaPembimbing: "Dr. Siti",
  perguruanTinggi: "Universitas Padjadjaran",
} as StudentProfile;

describe("getFormattedLogbookSnippet", () => {
  it("mengembalikan string kosong tanpa entri", () => {
    expect(getFormattedLogbookSnippet([], null, false, profile)).toBe("");
  });

  it("memformat satu entri dengan 5 bagian Dikti", () => {
    const text = getFormattedLogbookSnippet([entry()], entry(), false, profile);
    expect(text).toContain("LOGBOOK AKTIVITAS - 2026-02-10");
    expect(text).toContain("Nama: Budi Santoso");
    expect(text).toContain("1. DESKRIPSI KEGIATAN:\nMenganalisis data");
    expect(text).toContain("5. REFLEKSI PEMBELAJARAN:\nBelajar indexing");
  });

  it("menggabungkan semua entri saat viewAllEntries", () => {
    const text = getFormattedLogbookSnippet(
      [entry(), entry({ tanggal: "2026-02-11" })],
      entry(),
      true,
      profile
    );
    expect(text).toContain("LOGBOOK HARI KE-1 (2026-02-10)");
    expect(text).toContain("LOGBOOK HARI KE-2 (2026-02-11)");
  });
});

describe("buildMailtoHref", () => {
  it("mengembalikan mailto: kosong tanpa entri", () => {
    expect(
      buildMailtoHref({
        entries: [],
        currentEntry: null,
        viewAllEntries: false,
        studentProfile: profile,
        mentorEmail: "",
      })
    ).toBe("mailto:");
  });

  it("membangun mailto dengan subjek, penerima, dan isi ter-encode", () => {
    const href = buildMailtoHref({
      entries: [entry()],
      currentEntry: entry(),
      viewAllEntries: false,
      studentProfile: profile,
      mentorEmail: "mentor@kampus.ac.id",
    });
    expect(href.startsWith("mailto:mentor%40kampus.ac.id?subject=")).toBe(true);
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain("[Laporan Logbook Magang MBKM] Budi Santoso");
    expect(decoded).toContain("Yth. Bapak/Ibu Dr. Siti,");
    expect(decoded).toContain("Menganalisis data");
  });
});
