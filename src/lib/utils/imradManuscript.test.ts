import { describe, expect, it } from "vitest";
import {
  buildImradManuscript,
  computeTotalWeightedScore,
  getPredikat,
  type ImradManuscriptInput,
} from "./imradManuscript";
import type { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";

describe("getPredikat", () => {
  it("memetakan batas skor dengan benar", () => {
    expect(getPredikat(100)).toBe("Sangat Memuaskan (A)");
    expect(getPredikat(85)).toBe("Sangat Memuaskan (A)");
    expect(getPredikat(84.9)).toBe("Memuaskan (B)");
    expect(getPredikat(75)).toBe("Memuaskan (B)");
    expect(getPredikat(60)).toBe("Cukup (C)");
    expect(getPredikat(59.9)).toBe("Kurang (D)");
    expect(getPredikat(0)).toBe("Kurang (D)");
  });
});

describe("computeTotalWeightedScore", () => {
  const scores = (nilai: number[]): MentorAdminData["scores"] =>
    nilai.map((n, i) => ({
      aspek: `Aspek ${i + 1}`,
      bobot: 20,
      nilai: n,
      keterangan: "",
    }));

  it("menghitung rata-rata terbobot dan membulatkan ke 1 desimal", () => {
    expect(computeTotalWeightedScore(scores([100, 100, 100, 100, 100]))).toBe(
      100
    );
    expect(computeTotalWeightedScore(scores([80, 80, 80, 80, 80]))).toBe(80);
    // (90*20 + 80*20 + 70*20 + 60*20 + 50*20) / 100 = 70
    expect(computeTotalWeightedScore(scores([90, 80, 70, 60, 50]))).toBe(70);
  });
});

function baseInput(overrides: Partial<ImradManuscriptInput> = {}) {
  const input: ImradManuscriptInput = {
    profile: {
      namaMahasiswa: "Budi Santoso",
      nim: "180310240067",
      programStudi: "Teknik Informatika",
      perguruanTinggi: "Universitas Padjadjaran",
      namaPembimbing: "Dr. Siti, M.Kom.",
      namaMitra: "PT Contoh",
    } as ImradManuscriptInput["profile"],
    adminData: {
      namaMentor: "Andi Mentor",
      jabatanMentor: "Manajer",
      divisi: "Divisi IT",
      kopSurat: { namaInstansi: "PT Contoh" },
      scores: [
        { aspek: "A", bobot: 20, nilai: 90, keterangan: "Baik" },
        { aspek: "B", bobot: 20, nilai: 80, keterangan: "Baik" },
        { aspek: "C", bobot: 20, nilai: 80, keterangan: "Baik" },
        { aspek: "D", bobot: 20, nilai: 80, keterangan: "Baik" },
        { aspek: "E", bobot: 20, nilai: 80, keterangan: "Baik" },
      ],
      catatanEvaluasi: "Lanjutkan.",
    } as unknown as ImradManuscriptInput["adminData"],
    skemaJurnal: "terapan",
    judulJurnal: "Sistem Informasi Magang",
    kataKunci: "magang; sistem informasi",
    masalahMitra: "Proses manual lambat",
    solusiInovasi: "Aplikasi web logbook",
    capaianKuantitatif: "Waktu proses turun 40%",
    totalWeightedScore: 82,
    ...overrides,
  };
  return input;
}

describe("buildImradManuscript", () => {
  it("memuat judul huruf besar, skor, predikat, dan kata kunci", () => {
    const text = buildImradManuscript(baseInput());
    expect(text).toContain("SISTEM INFORMASI MAGANG");
    expect(text).toContain("82/100");
    expect(text).toContain('Memuaskan (B)');
    expect(text).toContain("magang; sistem informasi");
    expect(text).toContain("Budi Santoso");
    expect(text).toContain("1. PENDAHULUAN");
    expect(text).toContain("4. KESIMPULAN DAN SARAN");
  });

  it("memakai label skema pengabdian/SINTA saat skema pengabdian", () => {
    const text = buildImradManuscript(baseInput({ skemaJurnal: "pengabdian" }));
    expect(text).toContain("JURNAL PENGABDIAN MASYARAKAT - STANDAR SINTA");
    expect(text).not.toContain("JURNAL RISET TERAPAN");
  });

  it("memakai fallback saat profil/mitra kosong", () => {
    const text = buildImradManuscript(
      baseInput({
        profile: {} as ImradManuscriptInput["profile"],
        adminData: {
          namaMentor: "",
          scores: [],
          catatanEvaluasi: "",
        } as unknown as ImradManuscriptInput["adminData"],
      })
    );
    expect(text).toContain("Nama Mahasiswa");
    expect(text).toContain("Instansi Mitra");
  });
});
