import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { WeeklyLogbookDayItem } from "@/src/lib/exporters/types";

export interface WeeklyGeneratePayload {
  tipeKegiatan: string;
  peran: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  ringkasanMingguan: string;
}

const WEEKLY_LOGBOOK_ARRAY_SCHEMA = {
  type: "array",
  description:
    "Daftar logbook harian berurutan untuk setiap hari kerja dalam rentang pekan yang diminta, disusun dengan narasi progresif.",
  items: {
    type: "object",
    properties: {
      tanggal: {
        type: "string",
        description:
          'Tanggal lengkap dalam Bahasa Indonesia, misal: "Senin, 12 Oktober 2026"',
      },
      hari: {
        type: "string",
        description: 'Nama hari dalam Bahasa Indonesia, misal: "Senin"',
      },
      tahap_fase: {
        type: "string",
        description:
          'Label tahap/fase progresif pada hari tersebut, misal: "Tahap Analisis & Perencanaan", "Tahap Persiapan & Perancangan", "Tahap Eksekusi Teknis", "Tahap Evaluasi & Troubleshooting", atau "Tahap Rekapitulasi & Pelaporan"',
      },
      deskripsi_kegiatan: {
        type: "string",
        description:
          "Uraian kronologis, komprehensif, dan formal mengenai aktivitas spesifik hari tersebut berbasis kata kerja operasional Taksonomi Bloom (C3-C6).",
      },
      kompetensi_dikembangkan: {
        type: "string",
        description:
          "Hard skills dan soft skills spesifik yang diasah pada tahap hari tersebut.",
      },
      kendala_dihadapi: {
        type: "string",
        description:
          "Identifikasi hambatan teknis, operasional, atau koordinasi yang realistis sesuai fase hari tersebut.",
      },
      solusi_tindakan: {
        type: "string",
        description:
          "Langkah pemecahan masalah (problem solving) dan mitigasi konkret yang diterapkan pada hari tersebut.",
      },
      refleksi_pembelajaran: {
        type: "string",
        description:
          "Evaluasi pembelajaran bermakna pada hari tersebut serta keterkaitannya dengan progres hari berikutnya.",
      },
    },
    required: [
      "tanggal",
      "hari",
      "tahap_fase",
      "deskripsi_kegiatan",
      "kompetensi_dikembangkan",
      "kendala_dihadapi",
      "solusi_tindakan",
      "refleksi_pembelajaran",
    ],
  },
};

interface WorkdayInfo {
  iso: string;
  hari: string;
  tanggalFormatted: string;
  defaultPhaseTitle: string;
  defaultPhaseGuide: string;
}

const PROGRESSIVE_PHASE_GUIDES = [
  {
    phase: "Tahap Analisis & Perencanaan",
    guide:
      "Hari 1: Fokus pada briefing awal bersama mentor/DPL/tim, audit atau pemetaan kebutuhan, riset awal, serta penyusunan rencana kerja mingguan.",
  },
  {
    phase: "Tahap Persiapan & Perancangan",
    guide:
      "Hari 2: Fokus pada pengumpulan dan pengolahan data, penyiapan instrumen/materi teknis, pembuatan draf/kerangka kerja, atau perancangan dokumen pendukung.",
  },
  {
    phase: "Tahap Eksekusi Teknis & Implementasi",
    guide:
      "Hari 3: Fokus pada eksekusi utama di lapangan atau implementasi operasional inti sesuai target mingguan.",
  },
  {
    phase: "Tahap Pengujian & Penyempurnaan",
    guide:
      "Hari 4: Fokus pada pemeriksaan kualitas (quality control), pengujian hasil kerja, troubleshooting kendala lapangan, serta tindak lanjut revisi.",
  },
  {
    phase: "Tahap Rekapitulasi & Evaluasi Akhir Pekan",
    guide:
      "Hari 5: Fokus pada rekapitulasi capaian 1 pekan, verifikasi deliverables, evaluasi bersama mentor/supervisor/DPL, serta dokumentasi penutupan pekan.",
  },
];

function buildWorkdaysList(
  tanggalMulai: string,
  tanggalSelesai: string
): WorkdayInfo[] {
  const start = new Date(`${tanggalMulai}T00:00:00`);
  const end = new Date(`${tanggalSelesai}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    // Fallback 5 hari kerja mulai dari tanggalMulai atau pekan berjalan
    const base = Number.isNaN(start.getTime()) ? new Date() : start;
    return Array.from({ length: 5 }, (_, idx) => {
      const d = new Date(base);
      d.setDate(base.getDate() + idx);
      const hari = d.toLocaleDateString("id-ID", { weekday: "long" });
      const tanggalFormatted = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const guideObj =
        PROGRESSIVE_PHASE_GUIDES[idx] ||
        PROGRESSIVE_PHASE_GUIDES[PROGRESSIVE_PHASE_GUIDES.length - 1];
      return {
        iso: d.toISOString().slice(0, 10),
        hari,
        tanggalFormatted,
        defaultPhaseTitle: guideObj.phase,
        defaultPhaseGuide: guideObj.guide,
      };
    });
  }

  const allDays: Date[] = [];
  const cursor = new Date(start);
  // Batasi maksimal 7 hari kerja agar tetap fokus dalam 1 pekan
  while (cursor <= end && allDays.length < 10) {
    allDays.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Jika rentang > 5 hari dan mencakup Sabtu/Minggu, prioritaskan hari kerja (Senin-Jumat)
  const weekdaysOnly = allDays.filter((d) => {
    const dayOfWeek = d.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  });

  const targetDays =
    weekdaysOnly.length > 0 ? weekdaysOnly.slice(0, 7) : allDays.slice(0, 5);

  return targetDays.map((d, idx) => {
    const hari = d.toLocaleDateString("id-ID", { weekday: "long" });
    const tanggalFormatted = d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const guideObj =
      PROGRESSIVE_PHASE_GUIDES[
        Math.min(idx, PROGRESSIVE_PHASE_GUIDES.length - 1)
      ];
    return {
      iso: d.toISOString().slice(0, 10),
      hari,
      tanggalFormatted,
      defaultPhaseTitle: guideObj.phase,
      defaultPhaseGuide: guideObj.guide,
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          error:
            "Konfigurasi GEMINI_API_KEY belum diatur di server. Silakan tambahkan GEMINI_API_KEY pada file .env.local Anda.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Partial<WeeklyGeneratePayload>;
    const tipeKegiatan = body.tipeKegiatan?.trim() || "Magang MBKM";
    const peran = body.peran?.trim() || "Mahasiswa Peserta Program";
    const tanggalMulai = body.tanggalMulai?.trim() || "";
    const tanggalSelesai = body.tanggalSelesai?.trim() || "";
    const ringkasanMingguan = body.ringkasanMingguan?.trim() || "";

    if (!ringkasanMingguan) {
      return NextResponse.json(
        {
          error:
            "Ringkasan aktivitas pekan ini wajib diisi sebelum menyusun logbook borongan.",
        },
        { status: 400 }
      );
    }

    const workdays = buildWorkdaysList(tanggalMulai, tanggalSelesai);

    const client = new GoogleGenAI({ apiKey });

    const scheduleBreakdownPrompt = workdays
      .map(
        (w, i) =>
          `- Entri Ke-${i + 1}: Hari="${w.hari}", Tanggal="${w.tanggalFormatted}", Rekomendasi Fase="${w.defaultPhaseTitle}" (${w.defaultPhaseGuide})`
      )
      .join("\n");

    const systemInstruction = `Anda adalah Konsultan Akademik & Penyusun Logbook Harian Resmi Mahasiswa Indonesia untuk program Kampus Merdeka (${tipeKegiatan} - Magang MBKM, MSIB, dan KKN).

Tugas Anda adalah memecah "Ringkasan Aktivitas Pekan Ini" yang ditulis santai oleh mahasiswa menjadi rangkaian Logbook Harian 1 Pekan yang memiliki ALUR NARASI PROGRESIF, REALISTIS, dan BERKESINAMBUNGAN (tidak repetitif di mata Dosen Pembimbing / Mentor).

Aturan Wajib:
1. Gunakan Bahasa Indonesia baku, formal, dan akademis sesuai PUEBI/EYD V serta kata kerja operasional Taksonomi Bloom Revisi (C3 Mengaplikasikan, C4 Menganalisis, C5 Mengevaluasi, C6 Menciptakan/Merancang).
2. Pecah aktivitas mingguan ke dalam alur bertahap yang logis dari hari pertama hingga hari terakhir:
   - Hari 1 (Tahap Analisis & Perencanaan): Briefing, riset/audit awal, koordinasi kebutuhan, dan perencanaan alur kerja pekan ini.
   - Hari 2 (Tahap Persiapan & Perancangan): Persiapan data, penyusunan instrumen/materi teknis, atau perancangan draf dokumen/aset.
   - Hari 3 (Tahap Eksekusi Teknis): Eksekusi utama lapangan atau implementasi operasional inti.
   - Hari 4 (Tahap Evaluasi & Troubleshooting): Pengujian, validasi hasil, troubleshooting kendala teknis/lapangan, atau perbaikan revisi.
   - Hari 5 (Tahap Rekapitulasi & Pelaporan): Rekapitulasi akhir pekan, evaluasi bersama mentor/DPL, dan dokumentasi penutupan pekan.
3. Pastikan setiap hari memiliki diksi, fokus kegiatan, kendala spesifik, solusi konkret, dan refleksi pembelajaran yang unik (JANGAN mengulang kalimat yang sama antar-hari).
4. Kembalikan TEPAT ${workdays.length} objek di dalam JSON Array sesuai daftar tanggal berikut.`;

    const userPrompt = `Susun Logbook Harian 1 Pekan (Mode Borongan) berdasarkan data berikut:
- Program Kegiatan: ${tipeKegiatan}
- Peran / Posisi Mahasiswa: ${peran}
- Rentang Tanggal: ${workdays[0]?.tanggalFormatted} s/d ${workdays[workdays.length - 1]?.tanggalFormatted}
- Ringkasan Aktivitas Pekan Ini (Bahasa Santai): "${ringkasanMingguan}"

Daftar Hari yang WAJIB dibuatkan entri logbooknya secara berurutan:
${scheduleBreakdownPrompt}

Kembalikan output berupa JSON Array berisi ${workdays.length} objek sesuai skema.`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: WEEKLY_LOGBOOK_ARRAY_SCHEMA,
      },
    });

    const rawText = interaction.output_text;

    if (!rawText) {
      return NextResponse.json(
        {
          error:
            "Model tidak mengembalikan respons teks. Silakan coba beberapa saat lagi.",
        },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText);
    const items: WeeklyLogbookDayItem[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.entries)
        ? parsed.entries
        : [];

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: "Format respons logbook mingguan tidak valid. Silakan coba lagi.",
        },
        { status: 502 }
      );
    }

    const normalizedItems: WeeklyLogbookDayItem[] = items.map((item, idx) => {
      const fallbackDay = workdays[idx] || workdays[workdays.length - 1];
      return {
        tanggal: item.tanggal || fallbackDay.tanggalFormatted,
        hari: item.hari || fallbackDay.hari,
        tahap_fase: item.tahap_fase || fallbackDay.defaultPhaseTitle,
        deskripsi_kegiatan: item.deskripsi_kegiatan || "",
        kompetensi_dikembangkan: item.kompetensi_dikembangkan || "",
        kendala_dihadapi: item.kendala_dihadapi || "",
        solusi_tindakan: item.solusi_tindakan || "",
        refleksi_pembelajaran: item.refleksi_pembelajaran || "",
      };
    });

    return NextResponse.json({
      data: normalizedItems,
      meta: {
        model: "gemini-3.8-flash",
        tipeKegiatan,
        peran,
        totalDays: normalizedItems.length,
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/generate-weekly Error]:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server saat menyusun logbook mingguan.";

    return NextResponse.json(
      {
        error: `Gagal menghasilkan logbook 1 pekan: ${message}`,
      },
      { status: 500 }
    );
  }
}
