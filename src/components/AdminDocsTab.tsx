"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardCheck,
  Award,
  CheckCircle2,
  FileCheck2,
  BookOpenCheck,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { StudentProfile } from "@/src/lib/exporters/types";
import {
  MentorAdminData,
  DEFAULT_EVALUATION_SCORES,
  exportLembarPenilaianMentor,
  exportSuratKeteranganSelesaiMagang,
  exportSuratRekomendasiKerja,
} from "@/src/lib/exporters/exportAdminDocs";
import {
  buildImradManuscript,
  computeTotalWeightedScore,
} from "@/src/lib/utils/imradManuscript";
import {
  DEFAULT_CONSULTATION_SESSIONS,
  type ConsultationSession,
} from "@/src/lib/data/adminDocsSamples";
import { AdminDocsBerkasSection } from "./AdminDocsBerkasSection";
import { AdminDocsBimbinganSection } from "./AdminDocsBimbinganSection";
import { AdminDocsJurnalSection } from "./AdminDocsJurnalSection";

interface AdminDocsTabProps {
  profile: StudentProfile;
  initialData?: MentorAdminData | null;
  onUpdateProfile?: (profile: StudentProfile) => void;
  onUpdateMentorData?: (data: MentorAdminData) => void;
}

export const AdminDocsTab: React.FC<AdminDocsTabProps> = ({
  profile,
  initialData,
  onUpdateMentorData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"berkas" | "bimbingan" | "jurnal">("berkas");

  const [adminData, setAdminData] = useState<MentorAdminData>(() => {
    if (initialData && initialData.scores && initialData.scores.length > 0) {
      return {
        ...initialData,
        kopSurat: initialData.kopSurat || {
          namaInstansi: profile.namaMitra || "",
          alamatKantor: "",
          kontakWebsiteEmail: "",
          logoMitraBase64: "",
        },
      };
    }
    return {
      namaMentor: profile.namaPembimbing || "",
      jabatanMentor: "",
      divisi: "",
      nomorSurat: "",
      tanggalSurat: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      scores: [...DEFAULT_EVALUATION_SCORES],
      catatanEvaluasi: "",
      predikat: "Sangat Memuaskan (A)",
      kopSurat: {
        namaInstansi: profile.namaMitra || "",
        alamatKantor: "",
        kontakWebsiteEmail: "",
        logoMitraBase64: "",
      },
    };
  });

  // State Kartu Kendali Bimbingan
  const [sessions, setSessions] = useState<ConsultationSession[]>(DEFAULT_CONSULTATION_SESSIONS);
  const [newTanggal, setNewTanggal] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [newTopik, setNewTopik] = useState<string>("");
  const [newCatatan, setNewCatatan] = useState<string>("");
  const [newPembimbing, setNewPembimbing] = useState<"DPL Kampus" | "Mentor Mitra">("DPL Kampus");
  const [copiedBimbingan, setCopiedBimbingan] = useState(false);

  // State Generator Artikel Ilmiah IMRAD / SINTA
  const [skemaJurnal, setSkemaJurnal] = useState<"pengabdian" | "terapan">("terapan");
  const [judulJurnal, setJudulJurnal] = useState<string>(
    `Optimalisasi Proses Kerja dan Transformasi Digital pada ${profile.namaMitra || "Instansi Mitra"} Melalui Program Magang Industri Terstruktur`
  );
  const [kataKunci, setKataKunci] = useState<string>(
    "Transformasi Digital, Efisiensi Operasional, Magang Industri, Sistem Informasi, Evaluasi Kinerja"
  );
  const [masalahMitra, setMasalahMitra] = useState<string>(
    "Proses dokumentasi operasional, pelaporan lintas divisi, dan pemantauan indikator kinerja harian masih dilakukan secara semi-manual sehingga membutuhkan waktu koordinasi yang panjang."
  );
  const [solusiInovasi, setSolusiInovasi] = useState<string>(
    "Perancangan dan implementasi sistem kerja terstandarisasi berbasis modul digital serta penyusunan SOP alur pelaporan terintegrasi bersama tim teknis mitra."
  );
  const [capaianKuantitatif, setCapaianKuantitatif] = useState<string>(
    "Peningkatan efisiensi waktu pelaporan hingga 42%, penurunan tingkat kesalahan input data sebesar 35%, dan skor kepuasan evaluasi pengguna internal mencapai 88,5/100."
  );
  const [copiedJurnal, setCopiedJurnal] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (PNG/JPG/WebP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      updateAdminDataState({
        ...adminData,
        kopSurat: {
          ...(adminData.kopSurat || {}),
          logoMitraBase64: base64,
        },
      });
      toast.success("Logo perusahaan mitra berhasil dipasang ke Kop Surat.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateAdminDataState({
      ...adminData,
      kopSurat: {
        ...(adminData.kopSurat || {}),
        logoMitraBase64: "",
      },
    });
  };

  const updateAdminDataState = (newData: MentorAdminData) => {
    setAdminData(newData);
    if (onUpdateMentorData) {
      onUpdateMentorData(newData);
    }
  };

  const [downloading, setDownloading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hitung Nilai Akhir Terbobot
  const totalWeightedScore = computeTotalWeightedScore(adminData.scores);

  const getPredikat = (score: number) => {
    if (score >= 85) return "Sangat Memuaskan (A)";
    if (score >= 75) return "Memuaskan (B)";
    if (score >= 60) return "Cukup (C)";
    return "Kurang (D)";
  };

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...adminData.scores];
    updated[index] = { ...updated[index], nilai: Math.min(100, Math.max(0, newScore)) };
    const newTotal = computeTotalWeightedScore(updated);
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
    toast.success(title);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleExportNilai = async () => {
    try {
      setDownloading("nilai");
      await exportLembarPenilaianMentor(profile, adminData);
      notifySuccess("Lembar Penilaian Kinerja Mentor (.docx) berhasil diunduh!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh dokumen penilaian.");
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
      toast.error("Gagal mengunduh SKSM.");
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
      toast.error("Gagal mengunduh Surat Rekomendasi.");
    } finally {
      setDownloading(null);
    }
  };

  // Handlers Kartu Kendali Bimbingan
  const approvedSessionsCount = sessions.filter(
    (s) => s.statusParaf === "Disetujui & Diparaf"
  ).length;
  const minimumTargetSessions = 8;
  const bimbinganProgressPct = Math.min(
    100,
    Math.round((approvedSessionsCount / minimumTargetSessions) * 100)
  );

  const handleAddSession = () => {
    if (!newTopik.trim()) {
      toast.error("Mohon isi Topik / Bab Bimbingan terlebih dahulu.");
      return;
    }
    const nextNum = sessions.length + 1;
    const item: ConsultationSession = {
      id: `bimb-${Date.now()}`,
      pertemuanKe: nextNum,
      tanggal: newTanggal,
      topikBab: newTopik.trim(),
      catatanRevisi:
        newCatatan.trim() || "Telah dikonsultasikan dan disetujui untuk tahap berikutnya.",
      pembimbing: newPembimbing,
      statusParaf: "Disetujui & Diparaf",
    };
    setSessions([...sessions, item]);
    setNewTopik("");
    setNewCatatan("");
    toast.success(`Sesi Bimbingan Ke-${nextNum} berhasil ditambahkan.`);
  };

  const handleToggleSessionStatus = (id: string) => {
    const order: ConsultationSession["statusParaf"][] = [
      "Disetujui & Diparaf",
      "Revisi Minor",
      "Menunggu",
    ];
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextIdx = (order.indexOf(s.statusParaf) + 1) % order.length;
        return { ...s, statusParaf: order[nextIdx] };
      })
    );
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, pertemuanKe: idx + 1 }))
    );
    toast.success("Baris bimbingan dihapus.");
  };

  const handleDownloadBimbinganCsv = () => {
    const headers = [
      "Pertemuan Ke",
      "Tanggal",
      "Pembimbing",
      "Bab / Topik Konsultasi",
      "Catatan Revisi & Arahan",
      "Status Paraf",
    ];
    const rows = sessions.map((s) => [
      s.pertemuanKe,
      s.tanggal,
      `"${s.pembimbing}"`,
      `"${s.topikBab.replace(/"/g, '""')}"`,
      `"${s.catatanRevisi.replace(/"/g, '""')}"`,
      `"${s.statusParaf}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Kartu_Kendali_Bimbingan_${(profile.namaMahasiswa || "Mahasiswa").replace(/\s+/g, "_")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Kartu Kendali Bimbingan (.csv) berhasil diunduh.");
  };

  const generateKartuBimbinganText = () => {
    const lines = [
      "==========================================================================",
      "           KARTU KENDALI BIMBINGAN LAPORAN MAGANG / KKN / KP              ",
      "==========================================================================",
      `Nama Mahasiswa      : ${profile.namaMahasiswa || "-"}`,
      `NIM / NPM           : ${profile.nim || "-"}`,
      `Program Studi       : ${profile.programStudi || "-"} - ${profile.perguruanTinggi || "-"}`,
      `Instansi Mitra      : ${profile.namaMitra || adminData.kopSurat?.namaInstansi || "-"}`,
      `Dosen Pembimbing    : ${profile.namaPembimbing || "-"}`,
      `Pembimbing Lapangan : ${adminData.namaMentor || profile.namaPembimbing || "-"}`,
      `Status Kelayakan    : ${approvedSessionsCount >= minimumTargetSessions ? "LAYAK SIDANG / SEMINAR (Memenuhi Syarat Minimal 8x Bimbingan)" : `Dalam Proses (${approvedSessionsCount}/${minimumTargetSessions} Sesi)`}`,
      "--------------------------------------------------------------------------",
      "",
      ...sessions.map(
        (s) =>
          `[Pertemuan Ke-${s.pertemuanKe}] Tanggal: ${s.tanggal} | ${s.pembimbing}\n` +
          `Topik/Bab   : ${s.topikBab}\n` +
          `Catatan     : ${s.catatanRevisi}\n` +
          `Status Paraf: [${s.statusParaf.toUpperCase()}]\n`
      ),
      "--------------------------------------------------------------------------",
      `Disahkan pada: ${adminData.tanggalSurat}`,
      `Verifikasi Sistem Akademik: #KARTU-BIMB-${(profile.nim || "2025").slice(-4)}`,
      "==========================================================================",
    ];
    return lines.join("\n");
  };

  const handleCopyBimbingan = async () => {
    try {
      await navigator.clipboard.writeText(generateKartuBimbinganText());
      setCopiedBimbingan(true);
      toast.success("Kartu Kendali Bimbingan berhasil disalin ke clipboard.");
      setTimeout(() => setCopiedBimbingan(false), 2500);
    } catch {
      toast.error("Gagal menyalin teks.");
    }
  };

  // Naskah Artikel Ilmiah IMRAD Otomatis
  const imradManuscript = useMemo(
    () =>
      buildImradManuscript({
        profile,
        adminData,
        skemaJurnal,
        judulJurnal,
        kataKunci,
        masalahMitra,
        solusiInovasi,
        capaianKuantitatif,
        totalWeightedScore,
      }),
    [
      profile,
      adminData,
      skemaJurnal,
      judulJurnal,
      kataKunci,
      masalahMitra,
      solusiInovasi,
      capaianKuantitatif,
      totalWeightedScore,
    ]
  );

  const handleCopyJurnal = async () => {
    try {
      await navigator.clipboard.writeText(imradManuscript);
      setCopiedJurnal(true);
      toast.success("Naskah Artikel Ilmiah IMRAD berhasil disalin ke clipboard!");
      setTimeout(() => setCopiedJurnal(false), 2500);
    } catch {
      toast.error("Gagal menyalin naskah artikel.");
    }
  };

  const handleDownloadJurnalTxt = () => {
    const blob = new Blob([imradManuscript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Draf_Jurnal_IMRAD_${(profile.namaMahasiswa || "Mahasiswa").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Draf Artikel Ilmiah (.txt) berhasil diunduh.");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
              <ClipboardCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Pusat Berkas Administrasi, Kartu Bimbingan & Publikasi Ilmiah</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Administrasi Mitra, Kendali Bimbingan DPL & Draf Jurnal SINTA
            </h2>
            <p className="mt-2 text-sm md:text-base text-emerald-100/90 leading-relaxed">
              Kelola berkas pengesahan akhir magang (.docx), pantau Kartu Kendali Bimbingan DPL/Mentor (minimal 8x konsultasi), dan konversi laporan menjadi draf artikel ilmiah berstruktur IMRAD.
            </p>
          </div>

          {/* Quick Score Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 flex flex-col items-center justify-center min-w-[210px] shadow-inner text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              Skor Terbobot Mentor
            </span>
            <div className="text-4xl font-black mt-1 text-white flex items-baseline gap-1 tabular-nums">
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

      {/* Sub-Navigation Switcher */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab("berkas")}
          className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "berkas"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileCheck2 className="w-4 h-4 shrink-0" />
          <span>1. Berkas Penilaian & SKSM (.docx)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("bimbingan")}
          className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "bimbingan"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpenCheck className="w-4 h-4 shrink-0" />
          <span>2. Kartu Kendali Bimbingan DPL</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums ${
              activeSubTab === "bimbingan"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {approvedSessionsCount}/{minimumTargetSessions}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("jurnal")}
          className={`flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "jurnal"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>3. Generator Draf Jurnal (IMRAD / SINTA)</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl animate-slideDown shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 1: BERKAS PENILAIAN & SKSM MITRA (.DOCX)                    */}
      {/* =================================================================== */}
      {activeSubTab === "berkas" && <AdminDocsBerkasSection adminData={adminData} downloading={downloading} getPredikat={getPredikat} handleExportNilai={handleExportNilai} handleExportRekomendasi={handleExportRekomendasi} handleExportSKSM={handleExportSKSM} handleKeteranganChange={handleKeteranganChange} handleLogoUpload={handleLogoUpload} handleRemoveLogo={handleRemoveLogo} handleScoreChange={handleScoreChange} profile={profile} totalWeightedScore={totalWeightedScore} updateAdminDataState={updateAdminDataState} />}

      {/* =================================================================== */}
      {/* SUB-TAB 2: KARTU KENDALI BIMBINGAN DPL / MENTOR                     */}
      {/* =================================================================== */}
      {activeSubTab === "bimbingan" && <AdminDocsBimbinganSection approvedSessionsCount={approvedSessionsCount} bimbinganProgressPct={bimbinganProgressPct} copiedBimbingan={copiedBimbingan} handleAddSession={handleAddSession} handleCopyBimbingan={handleCopyBimbingan} handleDeleteSession={handleDeleteSession} handleDownloadBimbinganCsv={handleDownloadBimbinganCsv} handleToggleSessionStatus={handleToggleSessionStatus} minimumTargetSessions={minimumTargetSessions} newCatatan={newCatatan} newPembimbing={newPembimbing} newTanggal={newTanggal} newTopik={newTopik} sessions={sessions} setNewCatatan={setNewCatatan} setNewPembimbing={setNewPembimbing} setNewTanggal={setNewTanggal} setNewTopik={setNewTopik} />}

      {/* =================================================================== */}
      {/* SUB-TAB 3: GENERATOR DRAF ARTIKEL ILMIAH (IMRAD & SINTA)            */}
      {/* =================================================================== */}
      {activeSubTab === "jurnal" && <AdminDocsJurnalSection skemaJurnal={skemaJurnal} capaianKuantitatif={capaianKuantitatif} copiedJurnal={copiedJurnal} handleCopyJurnal={handleCopyJurnal} handleDownloadJurnalTxt={handleDownloadJurnalTxt} imradManuscript={imradManuscript} judulJurnal={judulJurnal} kataKunci={kataKunci} masalahMitra={masalahMitra} setCapaianKuantitatif={setCapaianKuantitatif} setJudulJurnal={setJudulJurnal} setKataKunci={setKataKunci} setMasalahMitra={setMasalahMitra} setSkemaJurnal={setSkemaJurnal} setSolusiInovasi={setSolusiInovasi} solusiInovasi={solusiInovasi} totalWeightedScore={totalWeightedScore} />}
    </div>
  );
};
