import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { SksMappingResponse } from "@/src/lib/types/modules";

export interface SksMappingPayload {
  tipeKegiatan: string;
  peran: string;
  daftarMatkul: string;
  riwayatKegiatan?: string;
  namaMahasiswa?: string;
  programStudi?: string;
}

const SKS_MAPPING_SCHEMA = {
  type: "object",
  properties: {
    totalSksDiajukan: {
      type: "integer",
      description: "Total akumulasi SKS dari mata kuliah yang diajukan oleh mahasiswa.",
    },
    totalSksDisetujui: {
      type: "integer",
      description: "Total SKS yang layak dan direkomendasikan untuk dikonversi penuh (umumnya 20 SKS jika terpenuhi).",
    },
    ringkasanJustifikasi: {
      type: "string",
      description:
        "Paragraf pengantar komprehensif yang merangkum keselarasan aktivitas magang/KKN dengan kurikulum perguruan tinggi berbasis Outcome-Based Education (OBE).",
    },
    matriks: {
      type: "array",
      description: "Daftar pemetaan justifikasi untuk setiap mata kuliah yang diajukan.",
      items: {
        type: "object",
        properties: {
          mataKuliah: {
            type: "string",
            description: "Nama mata kuliah, misal: 'Manajemen Proyek' atau 'Komunikasi Bisnis'.",
          },
          sks: {
            type: "integer",
            description: "Bobot SKS mata kuliah tersebut (misal: 2, 3, atau 4).",
          },
          cplTerpenuhi: {
            type: "string",
            description:
              "Capaian Pembelajaran Lulusan (CPL) / CPMK spesifik yang terpenuhi oleh aktivitas mahasiswa.",
          },
          aktivitasLogbook: {
            type: "string",
            description:
              "Aktivitas atau bukti riil pekerjaan magang/KKN yang berkorelasi langsung dengan mata kuliah ini.",
          },
          justifikasiAkademis: {
            type: "string",
            description:
              "Alasan akademis formal berbasis Taksonomi Bloom (C3-C6) yang membuktikan kedalaman kompetensi mahasiswa.",
          },
          rekomendasiNilai: {
            type: "string",
            description:
              "Rekomendasi nilai kesetaraan dan tingkat keselarasan, misal: 'A (95% Keselarasan Sangat Tinggi)'.",
          },
        },
        required: [
          "mataKuliah",
          "sks",
          "cplTerpenuhi",
          "aktivitasLogbook",
          "justifikasiAkademis",
          "rekomendasiNilai",
        ],
      },
    },
    rekomendasiUntukDosen: {
      type: "string",
      description:
        "Catatan penutup formal yang ditujukan kepada Dosen Pembimbing Akademik / Kaprodi agar menyetujui konversi penuh 20 SKS.",
    },
  },
  required: [
    "totalSksDiajukan",
    "totalSksDisetujui",
    "ringkasanJustifikasi",
    "matriks",
    "rekomendasiUntukDosen",
  ],
};

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

    const body = (await request.json()) as Partial<SksMappingPayload>;
    const tipeKegiatan = body.tipeKegiatan?.trim() || "Magang MBKM";
    const peran = body.peran?.trim() || "Mahasiswa Peserta Program";
    const daftarMatkul = body.daftarMatkul?.trim() || "";
    const riwayatKegiatan = body.riwayatKegiatan?.trim() || "";

    if (!daftarMatkul) {
      return NextResponse.json(
        {
          error:
            "Mohon isi daftar mata kuliah yang ingin dikonversi beserta bobot SKS-nya.",
        },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const systemInstruction = `Anda adalah Anggota Komisi Kurikulum & Verifikator Konversi 20 SKS Program Merdeka Belajar Kampus Merdeka (MBKM / MSIB / KKN) di Perguruan Tinggi Indonesia.

Tugas Utama Anda:
1. Menganalisis daftar mata kuliah yang diajukan mahasiswa beserta aktivitas nyata yang dilakukan selama program (${tipeKegiatan} sebagai ${peran}).
2. Menyusun "Matriks Justifikasi Konversi SKS Resmi" yang menghubungkan setiap mata kuliah dengan Capaian Pembelajaran Lulusan (CPL) dan Capaian Pembelajaran Mata Kuliah (CPMK) berbasis Outcome-Based Education (OBE).
3. Memberikan justifikasi akademis yang kokoh, kredibel, dan berbobot Taksonomi Bloom (C3 Mengaplikasikan, C4 Menganalisis, C5 Mengevaluasi, C6 Merancang/Menciptakan) agar Dosen Pembimbing Akademik (DPA) dan Ketua Program Studi (Kaprodi) yakin untuk mengesahkan konversi penuh (total hingga 20 SKS).
4. Gunakan Bahasa Indonesia baku, formal, dan meyakinkan secara keilmuan akademis.`;

    const userPrompt = `Tolong buatkan Matriks Justifikasi Konversi SKS Resmi berdasarkan data berikut:
- Jenis Program: ${tipeKegiatan}
- Peran / Bidang Kerja Mahasiswa: ${peran}
- Daftar Mata Kuliah & Bobot SKS yang Diajukan:
${daftarMatkul}

${
  riwayatKegiatan
    ? `- Bukti Riwayat Aktivitas / Logbook Mahasiswa:
${riwayatKegiatan}`
    : `- Catatan: Mahasiswa menjalankan tugas-tugas standar yang relevan dengan peran "${peran}" pada program "${tipeKegiatan}". Mohon petakan aktivitas kerja tipikal yang kredibel dan bernilai tinggi.`
}

Petakan SETIAP mata kuliah yang tercantum pada daftar menjadi baris matriks justifikasi yang lengkap, logis, dan formal sesuai format JSON Schema.`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: SKS_MAPPING_SCHEMA,
      },
    });

    const rawText = interaction.output_text;

    if (!rawText) {
      return NextResponse.json(
        {
          error:
            "Model tidak mengembalikan respon teks. Silakan coba kembali.",
        },
        { status: 502 }
      );
    }

    const parsed: SksMappingResponse = JSON.parse(rawText);

    return NextResponse.json({
      data: parsed,
      meta: {
        model: "gemini-3.8-flash",
        tipeKegiatan,
        peran,
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/map-sks Error]:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server saat memetakan konversi SKS.";

    return NextResponse.json(
      {
        error: `Gagal memetakan konversi SKS: ${message}`,
      },
      { status: 500 }
    );
  }
}
