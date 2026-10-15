import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DplSimulatorResponse } from "@/src/lib/types/modules";

export interface DplSimulatorPayload {
  tipeKegiatan: string;
  peran: string;
  riwayatKegiatan?: string;
  judulLaporan?: string;
  mitraPerusahaan?: string;
  konteksMatkulSks?: string;
}

const DPL_DEFENSE_SCHEMA = {
  type: "object",
  properties: {
    evaluasiKesiapanSidang: {
      type: "object",
      properties: {
        skorPrediksi: {
          type: "integer",
          description: "Estimasi skor kesiapan mental & materi mahasiswa (skala 0-100).",
        },
        tingkatKesiapan: {
          type: "string",
          description: "Status kesiapan, misal: 'Siap dengan Catatan Pendalaman Data' atau 'Perlu Menyiapkan Bukti Portofolio Tambahan'.",
        },
        catatanUtama: {
          type: "string",
          description: "Saran komprehensif bagi mahasiswa untuk menghadapi gaya tanya dosen penguji yang kritis.",
        },
      },
      required: ["skorPrediksi", "tingkatKesiapan", "catatanUtama"],
    },
    pertanyaanSidang: {
      type: "array",
      description: "Daftar tepat 5 pertanyaan ujian sidang paling kritis dan menantang dari dosen penguji.",
      items: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Nomor urut pertanyaan (1 sampai 5).",
          },
          kategori: {
            type: "string",
            description: "Kategori pengujian (misal: 'Kontribusi Riil vs Tim', 'Relevansi Teori Kuliah', 'Problem Solving & Krisis', 'Metodologi & Validitas Data', 'Dampak & Keberlanjutan').",
          },
          pertanyaan: {
            type: "string",
            description: "Kalimat pertanyaan tajam, skeptis, dan langsung menyasar celah yang mungkin ada di laporan logbook.",
          },
          alasanPenguji: {
            type: "string",
            description: "Mengapa DPL menanyakan ini (apa kecurigaan penguji atau esensi akademik yang ingin diuji).",
          },
          tipsTaktis: {
            type: "string",
            description: "Panduan taktis cara bersikap dan menyusun argumen saat menjawab agar tidak terkesan defensif atau berbohong.",
          },
          contohJawabanLisan: {
            type: "string",
            description: "Draf jawaban lisan formal yang percaya diri, lugas, santun, dan didukung bukti nyata aktivitas logbook.",
          },
        },
        required: [
          "id",
          "kategori",
          "pertanyaan",
          "alasanPenguji",
          "tipsTaktis",
          "contohJawabanLisan",
        ],
      },
    },
  },
  required: ["evaluasiKesiapanSidang", "pertanyaanSidang"],
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

    const body = (await request.json()) as Partial<DplSimulatorPayload>;
    const tipeKegiatan = body.tipeKegiatan?.trim() || "Magang MBKM";
    const peran = body.peran?.trim() || "Mahasiswa Peserta Program";
    const judulLaporan = body.judulLaporan?.trim() || `Laporan Akhir ${tipeKegiatan}`;
    const mitraPerusahaan = body.mitraPerusahaan?.trim() || "Mitra / Lokasi Kegiatan";
    const riwayatKegiatan = body.riwayatKegiatan?.trim() || "";
    const konteksMatkulSks = body.konteksMatkulSks?.trim() || "";

    if (!riwayatKegiatan) {
      return NextResponse.json(
        {
          error:
            "Mohon sertakan ringkasan riwayat logbook kegiatan agar Dosen AI dapat membedah isi laporan Anda.",
        },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const systemInstruction = `Anda adalah Dosen Pembimbing Lapangan (DPL) senior dan Ketua Majelis Sidang Pertanggungjawaban Magang MBKM / KKN di universitas terkemuka. Karakter Anda:
1. Sangat kritis, analitis, skeptis, dan berpengalaman puluhan tahun menguji sidang mahasiswa.
2. Anda alergi terhadap klaim kosong tanpa bukti angka atau laporan yang terkesan 'dilebih-lebihkan oleh AI'.
3. Anda ingin memastikan mahasiswa benar-benar bekerja, memahami korelasi teori keilmuan perguruan tinggi dengan kenyataan lapangan, dan mampu menyelesaikan masalah nyata (problem solving).
${
  konteksMatkulSks
    ? "4. Mahasiswa juga mengajukan konversi 20 SKS untuk mata kuliah tertentu. Salah satu pertanyaan Anda HARUS secara tajam menguji apakah aktivitas kerja dan luaran mahasiswa benar-benar memenuhi Capaian Pembelajaran Lulusan (CPL) dan bobot SKS mata kuliah yang diajukan, bukan sekadar klaim administratif!"
    : ""
}

Tugas Anda:
1. Analisis riwayat kegiatan mahasiswa (${tipeKegiatan} sebagai ${peran} di ${mitraPerusahaan}).
2. Susun 5 PERTANYAAN PALING KRITIS & MEMATIKAN yang sering menjatuhkan mahasiswa saat sidang:
   - Pertanyaan 1: Kontribusi Individual (membedakan pekerjaan mahasiswa vs tim).
   - Pertanyaan 2: Integrasi Teori vs Praktik Lapangan (menantang mahasiswa menjelaskan teori apa yang dipakai${konteksMatkulSks ? " serta relevansinya terhadap mata kuliah konversi SKS" : ""}).
   - Pertanyaan 3: Penanganan Krisis & Hambatan Nyata (menguji kejujuran atas kendala yang dialami).
   - Pertanyaan 4: Metodologi & Validitas Pekerjaan (bagaimana mahasiswa memastikan hasil kerjanya tidak keliru).
   - Pertanyaan 5: Dampak Jangka Panjang & Keberlanjutan (apa legasi atau nilai tambah yang ditinggalkan untuk mitra/desa).
3. Berikan tips taktis bagaimana mahasiswa harus merespon dosen dengan tenang, santun, dan berbobot ilmiah.
4. Buatkan contoh jawaban lisan formal berbasis data dan fakta logbook.`;

    const userPrompt = `Inspeksi riwayat logbook berikut dan jalankan Simulasi Sidang DPL Kritis:
- Jenis Program: ${tipeKegiatan}
- Posisi / Peran: ${peran}
- Lokasi / Mitra: ${mitraPerusahaan}
- Judul Laporan: ${judulLaporan}
${
  konteksMatkulSks
    ? `- Daftar Mata Kuliah Konversi 20 SKS yang Diajukan Mahasiswa:\n${konteksMatkulSks}\n`
    : ""
}
- Riwayat Aktivitas & Catatan Mahasiswa:
${riwayatKegiatan}

Kembalikan hasil dalam format JSON yang memuat evaluasi kesiapan dan 5 pertanyaan sidang kritis lengkap dengan tips taktis serta contoh jawaban lisan.`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: DPL_DEFENSE_SCHEMA,
      },
    });

    const rawText = interaction.output_text;

    if (!rawText) {
      return NextResponse.json(
        {
          error: "Model tidak mengembalikan respon teks. Silakan coba kembali.",
        },
        { status: 502 }
      );
    }

    const parsed: DplSimulatorResponse = JSON.parse(rawText);

    return NextResponse.json({
      data: parsed,
      meta: {
        model: "gemini-3.8-flash",
        tipeKegiatan,
        peran,
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/simulator-dpl Error]:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server saat menjalankan simulasi sidang.";

    return NextResponse.json(
      {
        error: `Gagal menjalankan simulasi sidang DPL: ${message}`,
      },
      { status: 500 }
    );
  }
}
