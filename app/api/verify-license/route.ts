import { NextRequest, NextResponse } from "next/server";
import { LicenseInfo, ProTier, VerifyLicensePayload } from "@/src/lib/types/modules";
import { checkRateLimit } from "@/src/lib/security/rateLimiter";

// Master keys default jika belum diatur di environment variable PRO_LICENSE_KEYS
const DEFAULT_MASTER_KEYS: Record<string, { plan: string; tier: ProTier }> = {
  "LMPRO-2026-BERES": { plan: "Sultan All-in-One", tier: "sultan" },
  "LMPRO-SULTAN-99": { plan: "Sultan All-in-One", tier: "sultan" },
  "KKN-DESA-2026": { plan: "Sultan All-in-One", tier: "sultan" },
  "LMPRO-REGULER-2026": { plan: "Reguler 3 Bulan", tier: "reguler" },
  "LOGMAGANG-PRO-VIP": { plan: "Sultan All-in-One", tier: "sultan" },
  "MERDEKA-BELAJAR-PRO": { plan: "Sultan All-in-One", tier: "sultan" },
};

const FEATURES_REGULER = [
  "Unlimited Generator Logbook Harian",
  "Mode Borongan (1 Pekan Sekaligus)",
  "Tone Humanizer (Mahasiswa Alami, Formal, Korporat)",
  "Salin Logbook ke Clipboard tanpa batas",
];

const FEATURES_SULTAN = [
  "Seluruh Fitur Paket Reguler",
  "Multimodal Vision Analisis Foto Kegiatan",
  "Hub Ekspor Dokumen Resmi (.docx, .xlsx, .pptx)",
  "Matriks Justifikasi Konversi 20 SKS OBE",
  "Transformasi CV ATS Harvard & Postingan LinkedIn",
  "Simulasi Ujian Sidang DPL Kritis (5 Bank Soal)",
  "Paket Ekstensi Chrome Auto-Fill Portal Kampus",
  "Manajemen Program Kerja Tim KKN Desa",
];

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, { limit: 10, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimit.errorResponse;
    }

    const body = (await request.json()) as Partial<VerifyLicensePayload>;
    const rawCode = (body.code?.trim() || "").slice(0, 64);

    if (!rawCode) {
      return NextResponse.json(
        {
          error: "Mohon masukkan kode lisensi atau voucher Pro Anda.",
        },
        { status: 400 }
      );
    }

    const cleanCode = rawCode.toUpperCase();

    // 1. Cek dari Custom Environment Variable PRO_LICENSE_KEYS (jika ada)
    const envMasterKeys = (process.env.PRO_LICENSE_KEYS || "")
      .split(",")
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean);

    let detectedPlan = "";
    let detectedTier: ProTier = "reguler";

    if (DEFAULT_MASTER_KEYS[cleanCode]) {
      detectedPlan = DEFAULT_MASTER_KEYS[cleanCode].plan;
      detectedTier = DEFAULT_MASTER_KEYS[cleanCode].tier;
    } else if (envMasterKeys.includes(cleanCode)) {
      detectedPlan = "Sultan All-in-One";
      detectedTier = "sultan";
    } else {
      // 2. Cek Algoritma Prefix & Signature
      // Contoh Sultan: LMPRO-SULTAN-XXXX atau KKN-DESA-XXXX
      const isSultanPattern =
        /^LMPRO-SULTAN-[A-Z0-9]{2,8}$/.test(cleanCode) ||
        /^KKN-DESA-[A-Z0-9]{2,8}$/.test(cleanCode);

      // Contoh Reguler: LMPRO-2026-XXXX atau LMPRO-XXXX
      const isRegulerPattern =
        /^LMPRO-2026-[A-Z0-9]{4,8}$/.test(cleanCode) ||
        /^LMPRO-[A-Z0-9]{4,10}$/.test(cleanCode);

      if (isSultanPattern) {
        detectedPlan = "Sultan All-in-One";
        detectedTier = "sultan";
      } else if (isRegulerPattern) {
        detectedPlan = "Reguler 3 Bulan";
        detectedTier = "reguler";
      }
    }

    if (!detectedPlan) {
      return NextResponse.json(
        {
          error:
            "Kode lisensi tidak valid atau tidak terdaftar. Pastikan kode diketik sesuai format tanpa spasi (contoh: LMPRO-2026-BERES atau LMPRO-SULTAN-99).",
        },
        { status: 400 }
      );
    }

    // Hitung tanggal kedaluwarsa (90 hari dari sekarang)
    const now = new Date();
    const expiresDate = new Date(now);
    expiresDate.setDate(now.getDate() + 90);

    const licenseData: LicenseInfo = {
      valid: true,
      code: cleanCode,
      plan: detectedPlan,
      tier: detectedTier,
      features: detectedTier === "sultan" ? FEATURES_SULTAN : FEATURES_REGULER,
      activatedAt: now.toISOString(),
      expiresAt: expiresDate.toISOString(),
      message: `Selamat! Lisensi ${detectedPlan} berhasil diaktifkan. Anda kini memiliki akses tak terbatas ke fitur LogMagang OS.`,
    };

    return NextResponse.json({
      success: true,
      data: licenseData,
    });
  } catch (error: unknown) {
    console.error("[API /api/verify-license Error]:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan internal saat memverifikasi lisensi.";

    return NextResponse.json(
      {
        error: `Gagal memverifikasi lisensi: ${message}`,
      },
      { status: 500 }
    );
  }
}
