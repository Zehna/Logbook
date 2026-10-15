"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  FileText,
  Award,
  Download,
  Building,
  UserCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Briefcase,
  Sliders,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { StudentProfile } from "@/src/lib/exporters/types";
import {
  MentorAdminData,
  DEFAULT_EVALUATION_SCORES,
  MentorEvaluationScore,
  exportLembarPenilaianMentor,
  exportSuratKeteranganSelesaiMagang,
  exportSuratRekomendasiKerja,
} from "@/src/lib/exporters/exportAdminDocs";

interface AdminDocsTabProps {
  profile: StudentProfile;
  initialData?: MentorAdminData | null;
  onUpdateProfile?: (profile: StudentProfile) => void;
  onUpdateMentorData?: (data: MentorAdminData) => void;
}

export const AdminDocsTab: React.FC<AdminDocsTabProps> = ({
  profile,
  initialData,
  onUpdateProfile,
  onUpdateMentorData,
}) => {
  const [adminData, setAdminData] = useState<MentorAdminData>(() => {
    if (initialData && initialData.scores && initialData.scores.length > 0) {
      return initialData;
    }
    return {
      namaMentor: profile.namaPembimbing || "Ir. Budi Santoso, M.Kom.",
      jabatanMentor: "Engineering Manager / Lead Mentor",
      divisi: "Digital Technology & Product Division",
      nomorSurat: `SKSM/${profile.namaMitra ? profile.namaMitra.slice(0, 3).toUpperCase() : "MIT"}/${new Date().getFullYear()}/042`,
      tanggalSurat: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      scores: [...DEFAULT_EVALUATION_SCORES],
      catatanEvaluasi:
        "Mahasiswa menunjukkan dedikasi, inisiatif, dan etos kerja yang luar biasa. Mampu menyelesaikan target pekerjaan tepat waktu dengan kualitas industri serta proaktif berkolaborasi dalam tim.",
      predikat: "Sangat Memuaskan (A)",
    };
  });

  const updateAdminDataState = (newData: MentorAdminData) => {
    setAdminData(newData);
    if (onUpdateMentorData) {
      onUpdateMentorData(newData);
    }
  };

  const [downloading, setDownloading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hitung Nilai Akhir Terbobot
  const totalWeightedScore = Math.round(
    adminData.scores.reduce((acc, curr) => acc + (curr.nilai * curr.bobot) / 100, 0) * 10
  ) / 10;

  const getPredikat = (score: number) => {
    if (score >= 85) return "Sangat Memuaskan (A)";
    if (score >= 75) return "Memuaskan (B)";
    if (score >= 60) return "Cukup (C)";
    return "Kurang (D)";
  };

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...adminData.scores];
    updated[index] = { ...updated[index], nilai: Math.min(100, Math.max(0, newScore)) };
    const newTotal =
      Math.round(
        updated.reduce((acc, curr) => acc + (curr.nilai * curr.bobot) / 100, 0) * 10
      ) / 10;
    updateAdminDataState({
      ...adminData,
      scores: updated,
      predikat: getPredikat(newTotal),
    });
  };

  const handleKeteranganChange = (index: number, newKet: string) => {
    const updated = [...adminData.scores];
    updated[index] = { ...updated[index], keterangan: newKet };
    updateAdminDataState({ ...adminData, scores: updated });
  };

  const notifySuccess = (title: string) => {
    setSuccessMsg(title);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleExportNilai = async () => {
    try {
      setDownloading("nilai");
      await exportLembarPenilaianMentor(profile, adminData);
      notifySuccess("Lembar Penilaian Kinerja Mentor (.docx) berhasil diunduh!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh dokumen penilaian.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportSKSM = async () => {
    try {
      setDownloading("sksm");
      await exportSuratKeteranganSelesaiMagang(profile, adminData);
      notifySuccess("Surat Keterangan Selesai Magang (.docx) berhasil diunduh!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh SKSM.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExportRekomendasi = async () => {
    try {
      setDownloading("rekomendasi");
      await exportSuratRekomendasiKerja(profile, adminData);
      notifySuccess("Surat Rekomendasi Kerja (.docx) berhasil diunduh!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh Surat Rekomendasi.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Modul Administrasi & Evaluasi Kampus Merdeka</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Generator Berkas Administrasi & Penilaian Mentor
            </h2>
            <p className="mt-2 text-sm md:text-base text-emerald-100/90 leading-relaxed">
              Generate dokumen resmi pengesahan akhir magang langsung dalam format Word (.docx) siap cetak dan tandatangan: Lembar Penilaian Kinerja, Surat Keterangan Selesai Magang (SKSM), dan Surat Rekomendasi Kerja Industri.
            </p>
          </div>

          {/* Quick Score Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 flex flex-col items-center justify-center min-w-[200px] shadow-inner text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Skor Terbobot Mentor
            </span>
            <div className="text-4xl font-black mt-1 text-white flex items-baseline gap-1">
              {totalWeightedScore}
              <span className="text-lg font-medium text-emerald-200/80">/100</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
              <Award className="w-3.5 h-3.5" />
              {getPredikat(totalWeightedScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl animate-slideDown shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Three Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Lembar Penilaian */}
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Lembar Evaluasi Kinerja (.docx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Format rubrik resmi penilaian 5 aspek kerja (kedisiplinan, kerjasama, teknis, problem solving, logbook), nilai terbobot, dan catatan mentor.
            </p>
          </div>
          <button
            onClick={handleExportNilai}
            disabled={downloading !== null}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading === "nilai" ? "Menyiapkan Docx..." : "Unduh Lembar Penilaian (.docx)"}
          </button>
        </div>

        {/* Card 2: SKSM */}
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Surat Keterangan Selesai Magang (.docx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Surat keterangan formal berkop instansi mitra dengan nomor surat resmi sebagai syarat yudisium dan konversi 20 SKS MBKM.
            </p>
          </div>
          <button
            onClick={handleExportSKSM}
            disabled={downloading !== null}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading === "sksm" ? "Menyiapkan Docx..." : "Unduh SKSM Resmi (.docx)"}
          </button>
        </div>

        {/* Card 3: Rekomendasi Kerja */}
        <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Surat Rekomendasi Kerja Industri (.docx)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Letter of Recommendation profesional dari atasan/mentor lapangan untuk melamar posisi full-time pasca lulus kuliah.
            </p>
          </div>
          <button
            onClick={handleExportRekomendasi}
            disabled={downloading !== null}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading === "rekomendasi" ? "Menyiapkan Docx..." : "Unduh Rekomendasi (.docx)"}
          </button>
        </div>
      </div>

      {/* Editor Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info Pembimbing & Surat (1 col) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Identitas Penilai & Mitra
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Mentor / Pimpinan
              </label>
              <input
                type="text"
                value={adminData.namaMentor}
                onChange={(e) => updateAdminDataState({ ...adminData, namaMentor: e.target.value })}
                placeholder="e.g. Ir. Budi Santoso, M.Kom."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jabatan Mentor di Perusahaan
              </label>
              <input
                type="text"
                value={adminData.jabatanMentor}
                onChange={(e) => updateAdminDataState({ ...adminData, jabatanMentor: e.target.value })}
                placeholder="e.g. Lead Software Engineer / Head of HR"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Divisi / Departemen
              </label>
              <input
                type="text"
                value={adminData.divisi}
                onChange={(e) => updateAdminDataState({ ...adminData, divisi: e.target.value })}
                placeholder="e.g. Technology & Product Development"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Surat Resmi (SKSM)
              </label>
              <input
                type="text"
                value={adminData.nomorSurat}
                onChange={(e) => updateAdminDataState({ ...adminData, nomorSurat: e.target.value })}
                placeholder="e.g. SKSM/HRD/2026/089"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Penetapan Surat
              </label>
              <input
                type="text"
                value={adminData.tanggalSurat}
                onChange={(e) => updateAdminDataState({ ...adminData, tanggalSurat: e.target.value })}
                placeholder="e.g. 14 Oktober 2026"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              💡 Nama mahasiswa ({profile.namaMahasiswa}), NIM ({profile.nim}), dan mitra ({profile.namaMitra}) diambil otomatis dari Profil Mahasiswa.
            </div>
          </div>

          {/* Qualitative Note Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Catatan & Ulasan Kualitatif Mentor
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ulasan naratif yang akan dicetak di bagian bawah lembar penilaian kinerja:
            </p>
            <textarea
              rows={4}
              value={adminData.catatanEvaluasi}
              onChange={(e) => updateAdminDataState({ ...adminData, catatanEvaluasi: e.target.value })}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: 5 Rubrik Penilaian Slider & Input (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                Rubrik Penilaian Kinerja Magang (5 Aspek)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sesuaikan skor per aspek (skala 0 - 100). Total nilai akan dihitung secara proporsional sesuai bobot.
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Nilai Akhir:
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {totalWeightedScore} / 100 ({getPredikat(totalWeightedScore)})
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {adminData.scores.map((scoreItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                      {scoreItem.aspek}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      Bobot {scoreItem.bobot}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={scoreItem.nilai}
                      onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                      className="w-16 text-center text-xs font-bold py-1 px-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={scoreItem.nilai}
                  onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                {/* Deskripsi Aspek */}
                <input
                  type="text"
                  value={scoreItem.keterangan}
                  onChange={(e) => handleKeteranganChange(idx, e.target.value)}
                  placeholder="Catatan kualitatif singkat untuk aspek ini..."
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 italic"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
