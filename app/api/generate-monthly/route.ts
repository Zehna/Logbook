import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from "@/src/lib/security/rateLimiter";

import { MonthlyGeneratePayload, MonthlyReportOutput } from "@/src/lib/types/monthlyReport";
export type { MonthlyGeneratePayload, MonthlyReportOutput };

const MONTHLY_REPORT_SCHEMA = {
  type: "object",
  properties: {
    periodeBulan: {
      type: "string",
      description:
        "Judul dan label periode resmi laporan kemajuan, misal: 'Laporan Kemajuan Kemahasiswaan & Monev — Bulan 1 (Pekan 1–4)'",
    },
    ringkasanPencapaianIKU: {
      type: "string",
      description:
        "Narasi komprehensif 2-3 paragraf akademik mengenai pemenuhan Indikator Kinerja Utama (IKU MBKM / CPL Kurikulum OBE) yang berhasil diasah oleh mahasiswa, menghubungkan tugas kerja industri dengan capaian belajar.",
    },
    milestoneProyekUtama: {
      type: "string",
      description:
        "Uraian terstruktur mengenai milestone, proyek strategis, atau tugas pokok yang berhasil diselesaikan maupun progres fitur/deliverables yang sedang dikerjakan selama 4 pekan ini.",
    },
    evaluasiHambatanDanSolusi: {
      type: "string",
      description:
        "Analisis kritis dan objektif terhadap kendala teknis, tantangan koordinasi lintas divisi, atau hambatan operasional yang dihadapi, disertai langkah konkret (mitigasi/problem solving) yang telah dan sedang ditempuh.",
    },
    rencanaEmpatPekanKedepan: {
      type: "string",
      description:
        "Action plan terinci dan target capaian terukur (milestone) untuk periode 4 pekan berikutnya hingga penyelesaian atau fase lanjutan program.",
    },
    rekomendasiDanRefleksi: {
      type: "string",
      description:
        "Refleksi mendalam pengalaman belajar bermakna (meaningful learning), peningkatan kedewasaan profesional, serta saran konstruktif untuk kolaborasi antara mahasiswa, DPL, dan mitra industri.",
    },
  },
  required: [
    "periodeBulan",
    "ringkasanPencapaianIKU",
    "milestoneProyekUtama",
    "evaluasiHambatanDanSolusi",
    "rencanaEmpatPekanKedepan",
    "rekomendasiDanRefleksi",
  ],
};

export async function POST(request: NextRequest) {
  try {
    // 1. Sliding Window Rate Limiter
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

    const body = (await request.json()) as Partial<MonthlyGeneratePayload>;
    const bulanKe = body.bulanKe?.trim() || "Bulan 1 (Pekan 1-4)";
    const tipeKegiatan = body.tipeKegiatan?.trim() || "Magang MBKM";
    const peran = body.peran?.trim() || "Mahasiswa Peserta Program";
    const catatanTambahan = body.catatanTambahan?.trim() || "";
    const namaMitra = body.namaMitra?.trim() || "Instansi Mitra";
    const namaMahasiswa = body.namaMahasiswa?.trim() || "Mahasiswa";
    const entries = Array.isArray(body.entries) ? body.entries : [];

    // Siapkan ringkasan logbook harian sebagai data historis
    let historyContext = "";
    if (entries.length > 0) {
      historyContext = entries
        .map((e, idx) => {
          return `[Entri ${idx + 1} - ${e.tanggal}]
- Deskripsi: ${e.deskripsiKegiatan}
- Kompetensi: ${e.kompetensiDikembangkan || "-"}
- Kendala: ${e.kendalaDihadapi || "-"}
- Solusi: ${e.solusiTindakan || "-"}
- Refleksi: ${e.refleksiPembelajaran || "-"}`;
        })
        .join("\n\n");
    } else {
      historyContext = "Belum ada entri logbook harian tersimpan. Sintesiskan berdasarkan profil peran dan estimasi fase program kerja tipikal.";
    }

    const systemInstruction = `Anda adalah Asisten Akademik Ahli Penyusun Laporan Monitoring & Evaluasi (Monev) Kemajuan Bulanan Mahasiswa Indonesia untuk program Kampus Merdeka (Magang MBKM, MSIB, dan KKN).
Tugas Anda adalah merangkum seluruh entri aktivitas harian 4 pekan terakhir menjadi sebuah Dokumen Naskah Laporan Kemajuan Bulanan resmi yang komprehensif, akademis, dan terstruktur.

PANDUAN FORMAT & PENULISAN:
1. Gunakan Bahasa Indonesia baku, formal, dan akademis tingkat tinggi (standar PUEBI / EYD V).
2. Terapkan kata kerja operasional Taksonomi Bloom (C3-C6: Mengaplikasikan, Menganalisis, Mengevaluasi, Merancang).
3. Hubungkan setiap aktivitas dengan Indikator Kinerja Utama (IKU MBKM / Capaian Pembelajaran Lulusan).
4. Buat narasi yang mengalir secara profesional, meyakinkan bagi Dosen Pembimbing Lapangan (DPL) dan Koordinator Program Kampus Merdeka.`;

    const userPrompt = `SUSUN LAPORAN KEMAJUAN BULANAN (MONEV):
- Target Periode: ${bulanKe}
- Tipe Program: ${tipeKegiatan}
- Peran Mahasiswa: ${peran}
- Instansi/Mitra: ${namaMitra}
- Nama Mahasiswa: ${namaMahasiswa}
${catatanTambahan ? `- Fokus Khusus / Catatan Tambahan Mahasiswa: ${catatanTambahan}\n` : ""}

HISTORI AKTIVITAS LOGBOOK HARIAN (${entries.length} entri):
"""
${historyContext}
"""

Tolong rangkum dan sintesiskan menjadi dokumen Laporan Kemajuan Bulanan resmi dalam format JSON sesuai skema yang telah ditentukan.`;

    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: MONTHLY_REPORT_SCHEMA,
        temperature: 0.35,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "Model AI tidak menghasilkan respon." },
        { status: 502 }
      );
    }

    try {
      const parsed = JSON.parse(responseText) as MonthlyReportOutput;
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json(
        { error: "Gagal memproses keluaran JSON dari model AI." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Error pada /api/generate-monthly:", error);
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal pada server.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
