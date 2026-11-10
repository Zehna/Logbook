"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  Loader2,
} from "lucide-react";
import { SksMappingResponse, MatriksSksItem } from "@/src/lib/types/modules";
import { SksConversionResults } from "./SksConversionResults";
import { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";

interface SksConversionTabProps {
  tipeKegiatan: string;
  peran: string;
  riwayatLogbookText: string;
  mentorAdminData?: MentorAdminData | null;
  onSksMatrixGenerated?: (matriks: MatriksSksItem[], rawCourses: string) => void;
}

const TEMPLATE_MATKUL_PRESETS: { label: string; courses: string }[] = [
  {
    label: "💻 Ilmu Komputer / Informatika (20 SKS)",
    courses: `1. Kerja Praktik / Magang Industri (4 SKS)
2. Pemrograman Web Terapan (3 SKS)
3. Rekayasa Perangkat Lunak Lanjut (3 SKS)
4. Manajemen Proyek TI (3 SKS)
5. Komunikasi & Etika Profesional TI (2 SKS)
6. Kapita Selekta Komputasi (3 SKS)
7. Desain Antarmuka & Pengalaman Pengguna (2 SKS)`,
  },
  {
    label: "📊 Manajemen, Bisnis & Komunikasi (20 SKS)",
    courses: `1. Magang Bisnis & Kewirausahaan (4 SKS)
2. Manajemen Pemasaran Digital (3 SKS)
3. Komunikasi Bisnis & Negosiasi (3 SKS)
4. Manajemen Operasional Terapan (3 SKS)
5. Analisis Perilaku Konsumen (3 SKS)
6. Kepemimpinan & Manajemen Tim (2 SKS)
7. Etika Bisnis & Tata Kelola (2 SKS)`,
  },
  {
    label: "🎨 Desain, Media & Kreatif (20 SKS)",
    courses: `1. Praktik Kerja Profesi Desain (4 SKS)
2. Produksi Konten Kreatif Multimedia (4 SKS)
3. Manajemen Brand & Media Sosial (3 SKS)
4. Storytelling & Copywriting (3 SKS)
5. Portofolio & Proyek Kolaboratif (3 SKS)
6. Hak Kekayaan Intelektual & Etika Kreatif (3 SKS)`,
  },
];

export const SksConversionTab: React.FC<SksConversionTabProps> = ({
  tipeKegiatan,
  peran,
  riwayatLogbookText,
  mentorAdminData,
  onSksMatrixGenerated,
}) => {
  const [coursesText, setCoursesText] = useState("");
  const [activityContext, setActivityContext] = useState(riwayatLogbookText);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SksMappingResponse | null>(null);
  const [copiedState, setCopiedState] = useState(false);

  const handleFillSampleActivity = () => {
    setActivityContext(
      "1. Merancang dan mengimplementasikan arsitektur database relasional serta RESTful API backend menggunakan Node.js dan TypeScript.\n2. Melakukan optimasi query database dan integrasi sistem autentikasi JWT berbasis role permission.\n3. Berkolaborasi dalam tim agile melalui daily standup, sprint planning, code review mingguan, dan pengujian unit test (Jest/Vitest).\n4. Menyusun dokumentasi teknis sistem dan mempresentasikan capaian modul kepada mentor lapangan dan stakeholder."
    );
  };

  // Sync if prop updates and local state is empty
  React.useEffect(() => {
    if (!activityContext && riwayatLogbookText) {
      setActivityContext(riwayatLogbookText);
    }
  }, [riwayatLogbookText, activityContext]);

  const handleGenerate = async () => {
    if (!coursesText.trim()) {
      setErrorMsg("Mohon masukkan daftar mata kuliah yang ingin dikonversi.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      let enrichedActivity = activityContext;
      if (mentorAdminData && mentorAdminData.scores && mentorAdminData.scores.length > 0) {
        const totalWeighted = Math.round(
          mentorAdminData.scores.reduce((acc, curr) => acc + (curr.nilai * curr.bobot) / 100, 0) * 10
        ) / 10;
        enrichedActivity += `\n\n[EVALUASI MENTOR INDUSTRI LAPANGAN]\nNilai Akhir Pembimbing: ${totalWeighted}/100 (${mentorAdminData.predikat})\nCatatan Pembimbing: "${mentorAdminData.catatanEvaluasi}"`;
      }

      const res = await fetch("/api/map-sks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipeKegiatan,
          peran,
          daftarMatkul: coursesText,
          riwayatKegiatan: enrichedActivity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses konversi SKS.");
      }

      setResult(data.data);
      if (onSksMatrixGenerated && data.data?.matriks) {
        onSksMatrixGenerated(data.data.matriks, coursesText);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!result) return;
    const tableHeader = "| No | Mata Kuliah | SKS | Capaian Pembelajaran Lulusan (CPL) | Aktivitas Bukti Logbook | Justifikasi Akademis | Rekomendasi Nilai |\n|---|---|---|---|---|---|---|\n";
    const tableRows = result.matriks
      .map(
        (m, idx) =>
          `| ${idx + 1} | ${m.mataKuliah} | ${m.sks} | ${m.cplTerpenuhi} | ${m.aktivitasLogbook} | ${m.justifikasiAkademis} | ${m.rekomendasiNilai} |`
      )
      .join("\n");

    const fullText = `### MATRIKS JUSTIFIKASI KONVERSI 20 SKS RESMI
**Program:** ${tipeKegiatan} | **Peran:** ${peran}
**Total SKS Diajukan:** ${result.totalSksDiajukan} SKS | **Total SKS Disetujui:** ${result.totalSksDisetujui} SKS

${result.ringkasanJustifikasi}

${tableHeader}${tableRows}

**Rekomendasi Verifikator:**
${result.rekomendasiUntukDosen}`;

    navigator.clipboard.writeText(fullText);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result) return;
    const csvHeader = "No,Mata Kuliah,SKS,CPL Terpenuhi,Aktivitas Logbook,Justifikasi Akademis,Rekomendasi Nilai\n";
    const csvRows = result.matriks
      .map(
        (m, idx) =>
          `"${idx + 1}","${m.mataKuliah.replace(/"/g, '""')}","${m.sks}","${m.cplTerpenuhi.replace(/"/g, '""')}","${m.aktivitasLogbook.replace(/"/g, '""')}","${m.justifikasiAkademis.replace(/"/g, '""')}","${m.rekomendasiNilai.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Matriks_Konversi_20_SKS_${tipeKegiatan.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Curriculum Mapping & Outcome-Based Education (OBE)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Konversi 20 SKS Kampus Merdeka
          </h2>
          <p className="mt-2 text-sm sm:text-base text-amber-100 leading-relaxed">
            Takut SKS magang dipangkas Dosen Pembimbing? Petakan seluruh aktivitas riil logbook Anda ke Capaian Pembelajaran Lulusan (CPL) dan CPMK mata kuliah untuk menghasilkan justifikasi resmi yang lolos verifikasi 20 SKS penuh!
          </p>
        </div>
      </div>

      {/* Integrated Mentor Evaluation Badge */}
      {mentorAdminData && mentorAdminData.scores && mentorAdminData.scores.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-950 dark:text-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-black shrink-0">
              🏅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                  Evaluasi Kinerja Mentor Terintegrasi
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                  {mentorAdminData.predikat}
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Skor Akhir: <strong>{Math.round(mentorAdminData.scores.reduce((a, c) => a + (c.nilai * c.bobot) / 100, 0) * 10) / 10}/100</strong> oleh {mentorAdminData.namaMentor} ({mentorAdminData.jabatanMentor}). Nilai ini otomatis memperkuat rekomendasi nilai dan justifikasi CPL akademis Anda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">
            1. Template Cepat Daftar Mata Kuliah (Pilih Prodi Anda):
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TEMPLATE_MATKUL_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCoursesText(p.courses)}
                className="text-xs px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-medium transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            rows={6}
            value={coursesText}
            onChange={(e) => setCoursesText(e.target.value)}
            placeholder="Tuliskan nama mata kuliah dan bobot SKS-nya..."
            className="w-full text-sm font-mono p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100"
          />
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            💡 Tulis 1 mata kuliah per baris lengkap dengan bobot SKS dalam kurung. Total ideal adalah 20 SKS.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-bold text-slate-800 dark:text-zinc-200">
              2. Bukti Aktivitas / Riwayat Logbook Terkini:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillSampleActivity}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Isi Contoh Bukti
              </button>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Sinkron dengan Data Logbook Anda
              </span>
            </div>
          </div>
          <textarea
            rows={4}
            value={activityContext}
            onChange={(e) => setActivityContext(e.target.value)}
            placeholder="Masukkan rangkuman apa saja yang Anda kerjakan selama magang/KKN..."
            className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50 dark:bg-zinc-800/60 text-slate-900 dark:text-zinc-100"
          />
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Semakin detail aktivitas yang disertakan, semakin kuat justifikasi ilmiah Taksonomi Bloom yang dihasilkan AI.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Membedah CPL & Menyusun Justifikasi 20 SKS...</span>
            </>
          ) : (
            <>
              <GraduationCap className="w-5 h-5" />
              <span>🚀 Petakan Matriks Konversi 20 SKS Sekarang</span>
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {result && (
        <SksConversionResults
          result={result}
          copiedState={copiedState}
          onCopyMarkdown={handleCopyMarkdown}
          onDownloadCsv={handleDownloadCsv}
        />
      )}
    </div>
  );
};
