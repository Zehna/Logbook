import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DefenseEvaluationResult, DefenseEvaluationPayload } from "@/src/lib/types/modules";
import { checkRateLimit } from "@/src/lib/security/rateLimiter";

const DEFENSE_EVALUATION_SCHEMA = {
  type: "object",
  properties: {
    skorJawaban: {
      type: "integer",
      description: "Skor numerik kelayakan jawaban mahasiswa (skala 0 sampai 100).",
    },
    tingkatKualitas: {
      type: "string",
      description: "Predikat nilai: 'Istimewa (A)', 'Sangat Baik (A- / B+)', 'Cukup (B)', atau 'Perlu Revisi Signifikan'.",
    },
    umpanBalikDosen: {
      type: "string",
      description:
        "Ulasan kritis dari perspektif Dosen Pembimbing Lapangan (DPL): bedah kelemahan argumentasi, nada bicara, ketepatan substansi, dan apakah mahasiswa terkesan berbelit-belit atau meyakinkan.",
    },
    poinYangTerlewat: {
      type: "array",
      items: { type: "string" },
      description:
        "Daftar 2 sampai 4 poin penting, metrik data, atau konsep keilmuan yang seharusnya disebutkan oleh mahasiswa agar jawaban lebih kokoh.",
    },
    jawabanRevisiIdeal: {
      type: "string",
      description:
        "Contoh draf jawaban lisan revisi sempurna berbobot akademis tinggi dan berwibawa yang siap diucapkan mahasiswa di ruang sidang.",
    },
  },
  required: [
    "skorJawaban",
    "tingkatKualitas",
    "umpanBalikDosen",
    "poinYangTerlewat",
    "jawabanRevisiIdeal",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, { limit: 15, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimit.errorResponse;
    }

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

    const body = (await request.json()) as DefenseEvaluationPayload;
    const pertanyaan = body.pertanyaan?.trim().slice(0, 2000);
    const jawabanMahasiswa = body.jawabanMahasiswa?.trim().slice(0, 10000);
    const kategori = body.kategori?.trim().slice(0, 100) || "Sidang Magang/KKN";
    const alasanPenguji = body.alasanPenguji?.trim().slice(0, 1000) || "Menguji kontribusi nyata dan integritas mahasiswa.";
    const peran = body.peran?.trim().slice(0, 100) || "Mahasiswa Peserta";
    const tipeKegiatan = body.tipeKegiatan?.trim().slice(0, 50) || "Magang MBKM";
    const riwayatKegiatan = body.riwayatKegiatan?.trim().slice(0, 50000) || "";

    if (!pertanyaan || !jawabanMahasiswa) {
      return NextResponse.json(
        {
          error: "Pertanyaan sidang dan draf jawaban lisan mahasiswa wajib diisi.",
        },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const systemInstruction = `Anda adalah Dosen Pembimbing Lapangan (DPL) senior di perguruan tinggi Indonesia yang sangat kritis, teliti, berwibawa, dan menuntut standar akademik tinggi saat menguji sidang mahasiswa (Magang MBKM / KKN / Kerja Praktik).

TUGAS ANDA:
Mengevaluasi secara objektif dan mendalam jawaban yang diucapkan/diketik oleh mahasiswa saat menjawab pertanyaan sidang tertentu.

STANDAR PENILAIAN DOSEN:
1. Skor 85 - 100 (Istimewa - A): Jawaban berbasis data, menyebutkan metode terukur (STAR), mengakui kendala tanpa defensif, dan mengaitkan praktik kerja dengan landasan teori/manfaat instansi.
2. Skor 70 - 84 (Sangat Baik - A-/B+): Jawaban logis dan jujur, namun masih minim angka metrik konkret atau kurang mendalam pada aspek pemecahan masalah.
3. Skor 55 - 69 (Cukup - B): Jawaban terlalu normatif, bertele-tele, bersifat hafalan, atau mengulang-ulang hal umum tanpa bukti kerja spesifik.
4. Skor < 55 (Perlu Revisi Signifikan): Jawaban menghindar, tidak menjawab esensi pertanyaan dosen, atau menunjukkan ketidakpahaman atas tugas yang dikerjakannya sendiri.

Kembalikan evaluasi dalam format JSON sesuai skema yang mencakup skor, umpan balik dosen, poin terlewat, dan draf jawaban ideal.`;

    const userPrompt = `KONTEKS SIDANG MAHASISWA:
- Program: ${tipeKegiatan}
- Peran Mahasiswa: ${peran}
- Kategori Pertanyaan: ${kategori}
- Catatan Riwayat Logbook Mahasiswa:
${riwayatKegiatan ? riwayatKegiatan.slice(0, 800) : "(Tidak ada riwayat tambahan)"}

PERTANYAAN PENGUJI DPL:
"${pertanyaan}"
(Motif Dosen Menanyakan Ini: ${alasanPenguji})

JAWABAN YANG DISAMPAIKAN MAHASISWA:
"${jawabanMahasiswa}"

Berikan penilaian, skor, umpan balik kritis, identifikasi poin yang terlewat, dan draf jawaban lisan revisi ideal berbobot A.`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: DEFENSE_EVALUATION_SCHEMA,
      },
    });

    const rawText = interaction.output_text;
    if (!rawText) {
      return NextResponse.json(
        { error: "Model AI tidak mengembalikan output evaluasi." },
        { status: 502 }
      );
    }

    const parsed: DefenseEvaluationResult = JSON.parse(rawText);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: unknown) {
    console.error("[API /api/evaluate-defense Error]:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal pada server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
