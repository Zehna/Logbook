import { describe, expect, it } from "vitest";
import {
  SAMPLE_QR_PATTERNS,
  formatIndonesianDate,
  parseMentorQrPayload,
  type MentorQrContext,
} from "./qrMentorCode";

const now = new Date(2026, 10, 9);
const ctx: MentorQrContext = {
  mentorName: "Pembimbing Lapangan",
  mitraName: "PT Mitra",
  currentRole: "Software Engineer Intern",
  currentProgram: "Magang MBKM",
};

describe("formatIndonesianDate", () => {
  it("memformat ISO dan tampilan Indonesia", () => {
    expect(formatIndonesianDate(new Date(2026, 10, 9))).toEqual({
      iso: "2026-11-09",
      display: "9 November 2026",
    });
    expect(formatIndonesianDate(new Date(2026, 0, 5))).toEqual({
      iso: "2026-01-05",
      display: "5 Januari 2026",
    });
  });
});

describe("parseMentorQrPayload", () => {
  it("JSON attendance memakai field payload dan fallback konteks", () => {
    const payload = JSON.stringify({
      type: "LOGMAGANG_ATTENDANCE",
      mentor: "Ir. Budi Santoso, M.T.",
      mitra: "PT Telkom Indonesia (Persero) Tbk",
      role: "Software Engineer Intern",
      program: "Magang MBKM",
      agenda: "Daily standup dan integrasi API.",
      hash: "LM-ATT-2026-8841",
      hours: 8,
    });
    expect(parseMentorQrPayload(payload, ctx, now)).toEqual({
      rawCode: payload,
      mode: "attendance",
      tanggal: "9 November 2026",
      isoDate: "2026-11-09",
      mentorName: "Ir. Budi Santoso, M.T.",
      mitraName: "PT Telkom Indonesia (Persero) Tbk",
      peran: "Software Engineer Intern",
      tipeKegiatan: "Magang MBKM",
      agendaCatatan: "Daily standup dan integrasi API.",
      verificationHash: "LM-ATT-2026-8841",
      jamKerja: 8,
    });
  });

  it("JSON verify dikenali dari type VERIFY atau verificationCode", () => {
    const payload = JSON.stringify({
      type: "LOGMAGANG_VERIFY",
      verificationCode: "LM-VER-1",
      mentor: "Dr. Ratna",
    });
    const parsed = parseMentorQrPayload(payload, ctx, now);
    expect(parsed.mode).toBe("verification");
    expect(parsed.verificationHash).toBe("LM-VER-1");
    expect(parsed.mentorName).toBe("Dr. Ratna");
    expect(parsed.mitraName).toBe("PT Mitra");
  });

  it("URL mengambil mentor, mitra, agenda, dan code dari query", () => {
    const url =
      "https://mentor.example.id/verify?mentor=Pak%20Budi&mitra=PT%20Telkom&agenda=Sesi%20evaluasi&code=LM-URL-1";
    const parsed = parseMentorQrPayload(url, ctx, now);
    expect(parsed.mode).toBe("verification");
    expect(parsed.mentorName).toBe("Pak Budi");
    expect(parsed.mitraName).toBe("PT Telkom");
    expect(parsed.agendaCatatan).toBe("Sesi evaluasi");
    expect(parsed.verificationHash).toBe("LM-URL-1");
    expect(parsed.jamKerja).toBe(8);
  });

  it("kode polos pendek menjadi hash uppercase, kode panjang dipotong", () => {
    const short = parseMentorQrPayload("LM-ATT-2026", ctx, now);
    expect(short.mode).toBe("attendance");
    expect(short.verificationHash).toBe("LM-ATT-2026");
    expect(short.mentorName).toBe("Pembimbing Lapangan");

    const long = parseMentorQrPayload("abcdefghijklmnopqrstuvwxyz123456", ctx, now);
    expect(long.verificationHash).toBe("QR-ABCDEFGH");
  });

  it("kode polos berisi VER dinilai verification", () => {
    expect(parseMentorQrPayload("KODE-VER-99", ctx, now).mode).toBe("verification");
  });

  it("tanpa konteks memakai nilai default", () => {
    const parsed = parseMentorQrPayload("ABC123", {}, now);
    expect(parsed.mentorName).toBe("Mentor Pembimbing Lapangan");
    expect(parsed.mitraName).toBe("Instansi Mitra MBKM");
    expect(parsed.peran).toBe("Mahasiswa Peserta Program");
    expect(parsed.tipeKegiatan).toBe("Magang MBKM");
  });
});

describe("SAMPLE_QR_PATTERNS", () => {
  it("tiga pola demo semuanya bisa diparse sebagai attendance/verification", () => {
    expect(SAMPLE_QR_PATTERNS).toHaveLength(3);
    for (const pattern of SAMPLE_QR_PATTERNS) {
      const parsed = parseMentorQrPayload(pattern.rawPayload, ctx, now);
      expect(["attendance", "verification"]).toContain(parsed.mode);
      expect(parsed.mentorName.length).toBeGreaterThan(0);
    }
  });
});
