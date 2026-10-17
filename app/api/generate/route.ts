import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from "@/src/lib/security/rateLimiter";

export type ToneType = "alami" | "formal" | "korporat";

export interface LogbookInputPayload {
  catatan?: string;
  tipeKegiatan: "Magang MBKM" | "MSIB" | "KKN" | string;
  peran: string;
  fotoBase64?: string;
  fotoMimeType?: string;
  tone?: ToneType;
  instruksiKhusus?: string;
}

export interface LogbookOutput {
  deskripsiKegiatan: string;
  kompetensiDikembangkan: string;
  kendalaDihadapi: string;
  solusiTindakan: string;
  refleksiPembelajaran: string;
}

const LOGBOOK_JSON_SCHEMA = {
  type: "object",
  properties: {
    deskripsiKegiatan: {
      type: "string",
      description:
        "Uraian kronologis, komprehensif, dan formal mengenai aktivitas harian yang dilakukan, menggunakan kata kerja operasional Taksonomi Bloom (C3-C6) sesuai peran, program, dan bukti foto jika ada.",
    },
    kompetensiDikembangkan: {
      type: "string",
      description:
        "Daftar atau narasi hard skills dan soft skills spesifik yang diasah dari kegiatan tersebut, dikaitkan dengan indikator capaian pembelajaran Taksonomi Bloom dan aktivitas pada foto.",
    },
    kendalaDihadapi: {
      type: "string",
      description:
        "Identifikasi hambatan teknis, operasional, koordinasi, atau adaptasi yang dihadapi selama pelaksanaan kegiatan secara objektif dan konstruktif.",
    },
    solusiTindakan: {
      type: "string",
      description:
        "Langkah strategis, pemecahan masalah (problem solving), atau tindakan mitigasi konkret yang diterapkan untuk mengatasi kendala tersebut.",
    },
    refleksiPembelajaran: {
      type: "string",
      description:
        "Evaluasi diri dan insight pembelajaran bermakna (meaningful learning) serta rencana tindak lanjut peningkatan kinerja ke depannya.",
    },
  },
  required: [
    "deskripsiKegiatan",
    "kompetensiDikembangkan",
    "kendalaDihadapi",
    "solusiTindakan",
    "refleksiPembelajaran",
  ],
};

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request);
    if (!rateLimit.allowed && rateLimit.errorResponse) {
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

    const body = (await request.json()) as Partial<LogbookInputPayload>;
    const catatan = body.catatan?.trim() ?? "";
    const tipeKegiatan = body.tipeKegiatan?.trim() || "Magang MBKM";
    const peran = body.peran?.trim() || "Mahasiswa Peserta Program";
    const fotoBase64 = body.fotoBase64?.trim();
    const fotoMimeType = body.fotoMimeType?.trim() || "image/jpeg";
    const tone: ToneType = body.tone || "alami";
    const instruksiKhusus = body.instruksiKhusus?.trim();

    if (!catatan && !fotoBase64) {
      return NextResponse.json(
        {
          error:
            "Silakan tulis catatan harian santai atau unggah foto dokumentasi kegiatan terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const hasPhoto = Boolean(fotoBase64);

    const toneInstruction =
      tone === "alami"
        ? `GAYA BAHASA: Mahasiswa Alami (Authentic Student Voice - Tone Humanizer Aktif)
   - Tulis dengan gaya bahasa mahasiswa Indonesia yang natural, jujur, mengalir, dan bersahaja.
   - HINDARI frasa klise AI yang kaku, hiperbolik, atau terdengar seperti mesin (misal: "melakukan orkestrasi holistik", "mensinergikan paradigma", "merevolusi kapabilitas").
   - Gunakan kalimat yang realistis mencerminkan tugas harian magang/KKN sesungguhnya, namun tetap rapi, sopan, dan berbobot di mata dosen/mentor.`
        : tone === "korporat"
        ? `GAYA BAHASA: Korporat & Bisnis (Industry Standard)
   - Gunakan gaya bahasa profesional dunia kerja modern (tech / corporate enterprise).
   - Soroti orientasi dampak (impact-driven), efisiensi alur kerja, indikator keberhasilan/KPI, kolaborasi lintas divisi, dan problem solving proaktif.
   - Adopsi terminologi industri yang relevan secara lugas dan profesional.`
        : `GAYA BAHASA: Akademik Formal (Standar Birokrasi Kampus)
   - Gunakan Bahasa Indonesia baku, formal, dan akademis tingkat tinggi sesuai PUEBI/EYD V.
   - Terapkan kata kerja operasional Taksonomi Bloom ranah C3-C6 (Mengaplikasikan, Menganalisis, Mengevaluasi, Merancang).
   - Format kalimat pasif/objektif akademik yang sangat disukai Dosen Pembimbing Lapangan (DPL) dan Tim Verifikator Kampus Merdeka.`;

    const systemInstruction = `Anda adalah Asisten Akademik & Konsultan Penyusun Logbook Resmi Mahasiswa Indonesia untuk program Kampus Merdeka (Magang MBKM, Studi Independen / MSIB, dan Kuliah Kerja Nyata / KKN) dengan kemampuan Multimodal Vision tingkat lanjut.

Tugas Anda adalah menyusun Laporan Logbook Harian Resmi berdasarkan Catatan Harian Santai ${
      hasPhoto ? "dan Foto Bukti Dokumentasi Kegiatan yang dilampirkan" : ""
    }:
1. Menggunakan Bahasa Indonesia yang baik dan terstruktur sesuai panduan gaya bahasa berikut:
${toneInstruction}
2. Berbasis Taksonomi Bloom Revisi (Anderson & Krathwohl) pada ranah kognitif menengah-tinggi (C3 Mengaplikasikan, C4 Menganalisis, C5 Mengevaluasi, C6 Menciptakan/Merancang).
3. ${
      hasPhoto
        ? `INSPEKSI FOTO DOKUMENTASI SECARA MENDALAM:
   - Amati objek visual pada foto: aplikasi/software yang terbuka (misal: lembar spreadsheet/Excel, Figma, VS Code/IDE, dashboard analitik, presentasi, atau browser), dokumen fisik/berkas arsip, suasana diskusi/rapat kerja, atau interaksi sosial/lapangan warga desa KKN.
   - Selaraskan narasi logbook 5 bagian (Deskripsi, Kompetensi, Kendala, Solusi, Refleksi) agar sinkron secara faktual dan meyakinkan dengan apa yang terlihat pada foto.
   - Jika catatan teks mahasiswa sangat singkat atau kosong, lakukan inferensi profesional mandiri mengenai aktivitas kerja harian yang kredibel berdasarkan bukti visual foto tersebut.`
        : "Kontekstual dengan jenis program dan peran mahasiswa."
    }
4. Tetap menjaga kewajaran akademik tanpa melebih-lebihkan fakta ekstrem di luar konteks program (${tipeKegiatan}) dan peran (${peran}).
5. Setiap bagian ditulis dalam 1–2 paragraf yang padat, bernas, mengalir dengan baik, dan siap disalin langsung ke portal Kampus Merdeka / SIM KKN.`;

    const userPrompt = `Tolong susun Logbook Harian Resmi berdasarkan informasi berikut:
- Program Kegiatan: ${tipeKegiatan}
- Peran / Posisi Mahasiswa: ${peran}
- Gaya Bahasa (Tone): ${tone}
${
  catatan
    ? `- Catatan Harian Santai: "${catatan}"`
    : "- Catatan Teks: (Tidak diisi - Harap inferensikan seluruh kegiatan secara profesional dari foto dokumentasi yang dilampirkan)"
}
${
  hasPhoto
    ? "- Bukti Foto Dokumentasi: Terlampir. Silakan analisis objek, software, konteks kerja, dan aktivitas yang terlihat pada foto ini untuk menyusun narasi 5 bagian logbook."
    : ""
}
${
  instruksiKhusus
    ? `- INSTRUKSI KHUSUS / PERBAIKAN AUDIT: ${instruksiKhusus}`
    : ""
}

Kembalikan hasil dalam format JSON sesuai skema 5 bagian: deskripsiKegiatan, kompetensiDikembangkan, kendalaDihadapi, solusiTindakan, dan refleksiPembelajaran.`;

    let inputPayload:
      | string
      | Array<{ type: "text"; text: string } | { type: "image"; data: string; mime_type: string }>;

    if (hasPhoto && fotoBase64) {
      // Bersihkan kemungkinan header Data URL: data:image/png;base64,...
      const cleanBase64 = fotoBase64.replace(/^data:[^;]+;base64,/, "");

      inputPayload = [
        { type: "text", text: userPrompt },
        {
          type: "image",
          data: cleanBase64,
          mime_type: fotoMimeType,
        },
      ];
    } else {
      inputPayload = userPrompt;
    }

    // Menggunakan model gemini-3.8-flash dengan Structured Output
    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: inputPayload,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: LOGBOOK_JSON_SCHEMA,
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

    const parsed: LogbookOutput = JSON.parse(rawText);

    return NextResponse.json({
      data: {
        deskripsiKegiatan: parsed.deskripsiKegiatan || "",
        kompetensiDikembangkan: parsed.kompetensiDikembangkan || "",
        kendalaDihadapi: parsed.kendalaDihadapi || "",
        solusiTindakan: parsed.solusiTindakan || "",
        refleksiPembelajaran: parsed.refleksiPembelajaran || "",
      },
      meta: {
        model: "gemini-3.8-flash",
        tipeKegiatan,
        peran,
        hasPhoto,
        tone,
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/generate Error]:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server saat menyusun logbook.";

    return NextResponse.json(
      {
        error: `Gagal menghasilkan logbook: ${message}`,
      },
      { status: 500 }
    );
  }
}
