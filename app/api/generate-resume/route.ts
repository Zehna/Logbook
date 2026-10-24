import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ResumeGeneratorResponse } from "@/src/lib/types/modules";
import { checkRateLimit } from "@/src/lib/security/rateLimiter";

export interface ResumeGeneratorPayload {
  tipeKegiatan: string;
  peran: string;
  riwayatKegiatan?: string;
  targetPosisi?: string;
}

const RESUME_GENERATOR_SCHEMA = {
  type: "object",
  properties: {
    targetRole: {
      type: "string",
      description: "Posisi target atau peran profesional hasil pemetaan, misal: 'Social Media & Growth Specialist'.",
    },
    resumeBullets: {
      type: "array",
      description:
        "Daftar 3-4 bullet points pengalaman kerja standar format Harvard / ATS Resume menggunakan STAR Method dengan metrik terukur.",
      items: {
        type: "object",
        properties: {
          bulletText: {
            type: "string",
            description:
              "Kalimat bullet point siap salin ke CV yang diawali action verb kuat, menjelaskan tindakan dan dampak terukur (misal: 'Mengoptimalkan alur rekapitulasi data menggunakan Excel dan spreadsheet otomatis, memangkas waktu pengolahan data sebesar 40% serta meminimalisir deviasi nota hingga 0%').",
          },
          starFramework: {
            type: "object",
            properties: {
              situation: {
                type: "string",
                description: "Situasi / konteks permasalahan awal yang dihadapi.",
              },
              task: {
                type: "string",
                description: "Tanggung jawab atau tugas yang diamanahkan kepada mahasiswa.",
              },
              action: {
                type: "string",
                description: "Tindakan dan inisiatif nyata yang dieksekusi menggunakan skill spesifik.",
              },
              result: {
                type: "string",
                description: "Hasil akhir yang tercapai dengan metrik kuantitatif atau kualitatif positif.",
              },
            },
            required: ["situation", "task", "action", "result"],
          },
          actionVerb: {
            type: "string",
            description: "Kata kerja tindakan awal (misal: 'Mengembangkan', 'Mengoptimalkan', 'Memimpin').",
          },
          metric: {
            type: "string",
            description: "Highlight metrik kuantitatif (misal: '+35% Engagement', '40% Lebih Cepat', '0 Error').",
          },
        },
        required: ["bulletText", "starFramework", "actionVerb", "metric"],
      },
    },
    linkedInPost: {
      type: "object",
      properties: {
        headlineHook: {
          type: "string",
          description:
            "Kalimat hook pembuka 1-2 baris yang memikat perhatian audiens profesional di feed LinkedIn.",
        },
        fullText: {
          type: "string",
          description:
            "Naskah postingan LinkedIn lengkap dengan format storytelling profesional: Hook -> Latar Belakang & Tantangan -> Aksi & Pembelajaran Bermakna -> Capaian Nyata -> Apresiasi Mentor/Tim -> Call to Action & Hashtags.",
        },
        hashtags: {
          type: "array",
          items: { type: "string" },
          description: "5-6 tagar populer dan relevan di LinkedIn Indonesia.",
        },
      },
      required: ["headlineHook", "fullText", "hashtags"],
    },
    topSkills: {
      type: "array",
      description: "Daftar 5 skill unggulan (kombinasi Hard & Soft Skills) untuk ditambahkan pada profil LinkedIn.",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nama kompetensi spesifik (misal: 'Project Timeline Management', 'Data Validation & Excel', 'Stakeholder Communication').",
          },
          category: {
            type: "string",
            description: "Kategori skill ('Hard Skill', 'Soft Skill', atau 'Tools & Teknologi').",
          },
          relevance: {
            type: "string",
            description: "Konteks penerapan skill ini berdasarkan bukti aktivitas nyata mahasiswa.",
          },
        },
        required: ["name", "category", "relevance"],
      },
    },
  },
  required: ["targetRole", "resumeBullets", "linkedInPost", "topSkills"],
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

    const body = (await request.json()) as Partial<ResumeGeneratorPayload>;
    const tipeKegiatan = body.tipeKegiatan?.trim().slice(0, 50) || "Magang MBKM";
    const peran = body.peran?.trim().slice(0, 100) || "Intern Professional";
    const targetPosisi = body.targetPosisi?.trim().slice(0, 100) || peran;
    const riwayatKegiatan = body.riwayatKegiatan?.trim().slice(0, 50000) || "";

    if (!riwayatKegiatan) {
      return NextResponse.json(
        {
          error:
            "Mohon sertakan ringkasan aktivitas atau riwayat logbook kegiatan untuk dianalisis menjadi CV ATS & LinkedIn.",
        },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const systemInstruction = `Anda adalah Senior Career Coach & Executive Tech Recruiter spesialis format Harvard CV / ATS Resume dan Personal Branding LinkedIn untuk talenta muda Indonesia.

Tugas Anda adalah mentransformasikan riwayat pengalaman magang/KKN mahasiswa (${tipeKegiatan} sebagai ${peran}) menjadi aset karier bernilai tinggi:
1. CV Bullets Standar ATS / Harvard Format:
   - Gunakan STAR Method (Situation, Task, Action, Result).
   - Awali dengan action verb kuat (misal: Merancang, Mengoptimalkan, Menginisiasi, Mengintegrasikan).
   - Selipkan metrik hasil kuantitatif yang realistis dan terukur (% efisiensi, volume data/aset, kepuasan pengguna).
2. Draf Postingan LinkedIn Storytelling:
   - Pola: Catchy Hook -> The Conflict/Challenge -> What I Did -> Tangible Impact -> Meaningful Reflection & Gratitude -> Call to Action & Hashtags.
   - Menggunakan Bahasa Indonesia profesional yang hangat, menginspirasi, dan tidak terdengar arogan.
3. Rekomendasi 5 Top Skills (Hard Skills, Soft Skills, Tools) yang terbukti dari bukti aktivitas logbook untuk dipajang di profil LinkedIn.`;

    const userPrompt = `Tolong transformasikan pengalaman kegiatan mahasiswa berikut menjadi Bullet Points ATS Resume, Draf LinkedIn Storytelling, dan Top 5 Skills:
- Program: ${tipeKegiatan}
- Peran Asal: ${peran}
- Target Karier Masa Depan: ${targetPosisi}
- Riwayat Aktivitas & Logbook:
${riwayatKegiatan}

Kembalikan seluruh hasil dalam format JSON sesuai skema resmi.`;

    const interaction = await client.interactions.create({
      model: "gemini-3.8-flash",
      system_instruction: systemInstruction,
      input: userPrompt,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: RESUME_GENERATOR_SCHEMA,
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

    const parsed: ResumeGeneratorResponse = JSON.parse(rawText);

    return NextResponse.json({
      data: parsed,
      meta: {
        model: "gemini-3.8-flash",
        tipeKegiatan,
        peran,
        targetPosisi,
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/generate-resume Error]:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server saat menyusun resume ATS & LinkedIn.";

    return NextResponse.json(
      {
        error: `Gagal menghasilkan CV ATS & LinkedIn: ${message}`,
      },
      { status: 500 }
    );
  }
}
