import type { TipeKegiatan } from "@/src/lib/exporters/types";

/**
 * Parsing kode QR dokumen mentor — sebelumnya inline di QrScannerModal.
 * Murni kecuali tanggal "sekarang" dan Math.random() untuk hash fallback;
 * keduanya bisa di-inject (param `now`) atau hanya diuji lewat pola hasilnya.
 */

export interface ScannedMentorQrData {
  rawCode: string;
  mode: "attendance" | "verification" | "custom";
  tanggal: string;
  isoDate: string;
  mentorName: string;
  mitraName: string;
  peran: string;
  tipeKegiatan: TipeKegiatan | string;
  agendaCatatan: string;
  verificationHash: string;
  jamKerja: number;
}

export interface MentorQrContext {
  mentorName?: string;
  mitraName?: string;
  currentRole?: string;
  currentProgram?: TipeKegiatan | string;
}

export function formatIndonesianDate(now: Date = new Date()): {
  iso: string;
  display: string;
} {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const dateNum = now.getDate();
  const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
  const display = `${dateNum} ${months[monthIdx]} ${year}`;
  return { iso, display };
}


export const SAMPLE_QR_PATTERNS: {
  id: string;
  label: string;
  badge: string;
  rawPayload: string;
}[] = [
  {
    id: "att-1",
    label: "QR Presensi Harian Mentor (WFO / Lapangan)",
    badge: "Kehadiran +8 Jam",
    rawPayload: JSON.stringify({
      type: "LOGMAGANG_ATTENDANCE",
      mentor: "Ir. Budi Santoso, M.T.",
      mitra: "PT Telkom Indonesia (Persero) Tbk",
      role: "Software Engineer Intern",
      program: "Magang MBKM",
      agenda:
        "Mengikuti daily standup sprint bersama mentor lapangan, melakukan integrasi endpoint API autentikasi, serta pengujian unit test modul pelaporan.",
      hash: "LM-ATT-2026-8841",
    }),
  },
  {
    id: "ver-1",
    label: "QR Pengesahan & Paraf Digital DPL / Mentor",
    badge: "Verifikasi Logbook",
    rawPayload: JSON.stringify({
      type: "LOGMAGANG_VERIFY",
      mentor: "Dr. Eng. Ratna Sari, S.Kom., M.Cs.",
      mitra: "Direktorat Kemahasiswaan & MBKM",
      role: "Peserta Program MBKM",
      program: "MSIB",
      agenda:
        "Evaluasi berkala pemenuhan jam kerja 900 jam MBKM dan validasi kesesuaian bukti dokumentasi kegiatan mingguan bersama Dosen Pembimbing Lapangan.",
      hash: "LM-VER-DPL-9920",
    }),
  },
  {
    id: "kkn-1",
    label: "QR Presensi Posko KKN Desa Binaan",
    badge: "Presensi KKN",
    rawPayload: JSON.stringify({
      type: "LOGMAGANG_ATTENDANCE",
      mentor: "Drs. Hendra Wijaya, M.Si. (Kepala Desa / DPL)",
      mitra: "Pemerintah Desa Sukamaju",
      role: "Koordinator Program Kerja Digitalisasi Desa",
      program: "KKN",
      agenda:
        "Melaksanakan sosialisasi literasi digital dan pendampingan pembukuan UMKM warga desa di Balai Desa bersama perangkat desa.",
      hash: "LM-KKN-2026-5519",
    }),
  },
];

export function parseMentorQrPayload(
  rawText: string,
  ctx: MentorQrContext = {},
  now: Date = new Date()
): ScannedMentorQrData {
  const { iso, display } = formatIndonesianDate(now);
  const cleaned = rawText.trim();

  // Try JSON format first
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      const isVerify =
        String(parsed.type || "").toUpperCase().includes("VERIFY") ||
        Boolean(parsed.verificationCode);
      return {
        rawCode: cleaned,
        mode: isVerify ? "verification" : "attendance",
        tanggal: parsed.date || display,
        isoDate: parsed.isoDate || iso,
        mentorName:
          parsed.mentor ||
          parsed.pembimbing ||
          ctx.mentorName ||
          "Mentor Pembimbing Lapangan",
        mitraName:
          parsed.mitra ||
          parsed.company ||
          ctx.mitraName ||
          "Mitra Industri / Instansi",
        peran: parsed.role || parsed.peran || ctx.currentRole || "Peserta Magang MBKM",
        tipeKegiatan: parsed.program || ctx.currentProgram || "Magang MBKM",
        agendaCatatan:
          parsed.agenda ||
          parsed.notes ||
          parsed.catatan ||
          "Melaksanakan kegiatan kerja harian sesuai arahan dan verifikasi QR dokumen Mentor Lapangan.",
        verificationHash:
          parsed.hash ||
          parsed.token ||
          parsed.verificationCode ||
          `QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        jamKerja: Number(parsed.hours) || 8,
      };
    }
  } catch {
    // Not JSON, parse prefix or URL or plain string
  }

  // Check URL query params or key=value pattern
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    try {
      const url = new URL(cleaned);
      const mentor =
        url.searchParams.get("mentor") ||
        ctx.mentorName ||
        "Mentor Lapangan";
      const mitra =
        url.searchParams.get("mitra") ||
        ctx.mitraName ||
        url.hostname;
      const agenda =
        url.searchParams.get("agenda") ||
        `Verifikasi kehadiran dan logbook melalui tautan resmi mentor (${url.hostname}).`;
      const code =
        url.searchParams.get("code") ||
        url.searchParams.get("token") ||
        `URL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      return {
        rawCode: cleaned,
        mode: "verification",
        tanggal: display,
        isoDate: iso,
        mentorName: mentor,
        mitraName: mitra,
        peran: ctx.currentRole || "Peserta Program",
        tipeKegiatan: ctx.currentProgram || "Magang MBKM",
        agendaCatatan: agenda,
        verificationHash: code,
        jamKerja: 8,
      };
    } catch {
      // Fall through
    }
  }

  // Plain code or custom mentor string
  return {
    rawCode: cleaned,
    mode: cleaned.toUpperCase().includes("VER") ? "verification" : "attendance",
    tanggal: display,
    isoDate: iso,
    mentorName: ctx.mentorName || "Mentor Pembimbing Lapangan",
    mitraName: ctx.mitraName || "Instansi Mitra MBKM",
    peran: ctx.currentRole || "Mahasiswa Peserta Program",
    tipeKegiatan: ctx.currentProgram || "Magang MBKM",
    agendaCatatan: `Kehadiran & aktivitas harian terverifikasi melalui kode QR Dokumen Mentor (${cleaned.slice(
      0,
      80
    )}). Melaksanakan tugas kerja lapangan sesuai arahan pembimbing.`,
    verificationHash:
      cleaned.length <= 24
        ? cleaned.toUpperCase()
        : `QR-${cleaned.slice(0, 8).toUpperCase()}`,
    jamKerja: 8,
  };
}
