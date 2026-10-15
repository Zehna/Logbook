import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { LogbookEntry, StudentProfile } from "@/src/lib/exporters/types";
import { SynthesizedReportChapters } from "@/src/lib/types/modules";

export interface SynthesizeReportPayload {
  studentProfile?: Partial<StudentProfile>;
  tipeKegiatan?: string;
  peran?: string;
  preset?: string;
  logbookEntries?: LogbookEntry[];
}

const SYNTHESIZE_REPORT_SCHEMA = {
  type: "object",
  properties: {
    bab1_latar_belakang: {
      type: "string",
      description:
        "Narasi mendalam 3 paragraf komprehensif tentang latar belakang program magang/KKN, dinamika industri atau desa mitra, urgensi pemecahan masalah di lapangan, dan relevansi langsung dengan kurikulum perguruan tinggi mahasiswa.",
    },
    bab1_rumusan_dan_tujuan: {
      type: "string",
      description:
        "Uraian rumusan masalah operasional yang dihadapi di instansi dan poin-poin tujuan strategis pelaksanaan kegiatan yang terukur dan aplikatif.",
    },
    bab2_profil_dan_tinjauan_teori: {
      type: "string",
      description:
        "Tinjauan profil instansi/mitra/desa binaan serta landasan teoritis keilmuan akademik dan metodologi standar industri yang menjadi kerangka kerja mahasiswa.",
    },
    bab4_pembahasan_komprehensif: {
      type: "string",
      description:
        "Sintesis pembahasan analitis mendalam mengenai eksekusi teknis dari seluruh aktivitas harian yang tercatat di logbook, analisis problem solving atas kendala nyata di lapangan, serta evaluasi dampak output bagi instansi/warga.",
    },
    bab5_kesimpulan_dan_saran: {
      type: "string",
      description:
        "Kesimpulan komprehensif atas pemenuhan target kompetensi kerja serta rekomendasi atau saran konstruktif yang berbobot untuk instansi mitra dan program studi di kampus.",
    },
  },
  required: [
    "bab1_latar_belakang",
    "bab1_rumusan_dan_tujuan",
    "bab2_profil_dan_tinjauan_teori",
    "bab4_pembahasan_komprehensif",
    "bab5_kesimpulan_dan_saran",
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

    const body = (await request.json()) as SynthesizeReportPayload;
    const profile = body.studentProfile || {};
    const tipeKegiatan = body.tipeKegiatan || "Magang MBKM";
    const peran = body.peran || "Mahasiswa Peserta Program";
    const preset = body.preset || "dikti";
    const entries = Array.isArray(body.logbookEntries) ? body.logbookEntries : [];

    if (entries.length === 0) {
      return NextResponse.json(
        {
          error:
            "Belum ada riwayat entri logbook untuk disintesis menjadi laporan akhir. Silakan buat atau generate beberapa entri logbook terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    // Format ringkasan entri logbook untuk konteks Gemini
    const logbookSummary = entries
      .slice(0, 30) // batas hingga 30 entri representatif
      .map(
        (e, idx) =>
          `[Hari #${idx + 1} - ${e.tanggal}] (${e.peran})
- Deskripsi: ${e.deskripsiKegiatan}
- Kompetensi: ${e.kompetensiDikembangkan}
- Kendala & Solusi: Kendala: ${e.kendalaDihadapi} | Solusi: ${e.solusiTindakan}
- Refleksi: ${e.refleksiPembelajaran}`
      )
      .join("\n\n");

    const systemInstruction = `Anda adalah Tim Akademik Ahli Penyusun Laporan Akhir Kampus Merdeka (MBKM / Kerja Praktik / KKN) bereputasi tinggi di Indonesia.
Tugas Anda adalah membaca data identitas mahasiswa, mitra, peran, dan seluruh riwayat entri logbook kerja harian untuk MENYINTESIS naskah akademik Bab I, Bab II, Bab IV, dan Bab V yang orisinal, mendalam, dan ilmiah berbobot tinggi.

ATURAN PENULISAN AKADEMIK:
1. Hindari kalimat klise robotik dan template kosong generic. Tulis dengan gaya bahasa akademik baku Indonesia (Pedoman Ejaan Bahasa Indonesia / PUEBI).
2. 'bab1_latar_belakang': Harus terdiri dari 3 paragraf mendalam:
   - Paragraf 1: Lanskap industri/desa, tantangan sektor terkait, dan peran strategis program nasional MBKM/KKN.
   - Paragraf 2: Mengapa instansi mitra (${profile.namaMitra || "Mitra Kegiatan"}) dan peran (${peran}) menjadi lokus krusial untuk implementasi keilmuan (${profile.programStudi || "Program Studi Mahasiswa"}).
   - Paragraf 3: Kesenjangan teoritis di kampus dengan realitas tantangan operasional di lapangan, serta motivasi pelaksanaan program.
3. 'bab1_rumusan_dan_tujuan': Uraikan minimal 2 rumusan masalah operasional dan 3 tujuan strategis berbasis kata kerja Taksonomi Bloom (Menganalisis, Merancang, Mengimplementasikan, Mengevaluasi).
4. 'bab2_profil_dan_tinjauan_teori': Deskripsikan profil singkat mitra, struktur operasional, dan minimal 2 konsep/teori ilmiah utama yang relevan dengan pekerjaan harian yang dilakukan mahasiswa.
5. 'bab4_pembahasan_komprehensif': Lakukan sintesis kritis terhadap aktivitas-aktivitas harian logbook, soroti metodologi pemecahan masalah (problem solving) pada kendala-kendala utama yang berhasil diatasi, serta output konkret yang diserahkan ke instansi.
6. 'bab5_kesimpulan_dan_saran': Buat kesimpulan holistik tentang capaian kompetensi serta saran spesifik yang dapat ditindaklanjuti bagi instansi mitra dan perguruan tinggi (${profile.perguruanTinggi || "Kampus Asal"}).`;

    const userPrompt = `DATA MAHASISWA & KEGIATAN:
- Nama Mahasiswa: ${profile.namaMahasiswa || "Mahasiswa"} (NIM: ${profile.nim || "-"})
- Program Studi: ${profile.programStudi || "-"}
- Perguruan Tinggi: ${profile.perguruanTinggi || "-"}
- Instansi Mitra / Desa: ${profile.namaMitra || "-"}
- Dosen Pembimbing: ${profile.namaPembimbing || "-"}
- Jenis Program: ${tipeKegiatan}
- Peran / Posisi: ${peran}
- Format Standar Kampus: ${preset.toUpperCase()}
- Total Entri Logbook: ${entries.length} entri

REKAMAN AKTIVITAS LOGBOOK HARIAN:
${logbookSummary}

Sintesiskan naskah laporan akademik lengkap Bab I, II, IV, dan V dalam format JSON sesuai skema yang telah ditentukan.`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: SYNTHESIZE_REPORT_SCHEMA,
      },
    });

    const rawText = interaction.output_text;
    if (!rawText) {
      return NextResponse.json(
        { error: "Model AI tidak mengembalikan output naskah laporan." },
        { status: 502 }
      );
    }

    const parsed: SynthesizedReportChapters = JSON.parse(rawText);
    parsed.synthesizedAt = new Date().toISOString();

    // Hitung perkiraan total kata naskah
    const allText = `${parsed.bab1_latar_belakang} ${parsed.bab1_rumusan_dan_tujuan} ${parsed.bab2_profil_dan_tinjauan_teori} ${parsed.bab4_pembahasan_komprehensif} ${parsed.bab5_kesimpulan_dan_saran}`;
    parsed.totalKata = allText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      data: parsed,
      meta: {
        model: "gemini-3.8-flash",
        tipeKegiatan,
        peran,
        namaMahasiswa: profile.namaMahasiswa || "Mahasiswa",
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/synthesize-report Error]:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan internal pada server.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
