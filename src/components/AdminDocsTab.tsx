"use client";

import React, { useState, useMemo } from "react";
import {
  ClipboardCheck,
  FileText,
  Award,
  Download,
  Building2,
  UserCheck,
  Sparkles,
  CheckCircle2,
  FileCheck2,
  Briefcase,
  Sliders,
  UploadCloud,
  Trash2,
  BookOpenCheck,
  GraduationCap,
  Plus,
  Copy,
  Check,
  FileSpreadsheet,
  PenTool,
  RefreshCw,
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

interface ConsultationSession {
  id: string;
  pertemuanKe: number;
  tanggal: string;
  topikBab: string;
  catatanRevisi: string;
  pembimbing: "DPL Kampus" | "Mentor Mitra";
  statusParaf: "Disetujui & Diparaf" | "Revisi Minor" | "Menunggu";
}

interface AdminDocsTabProps {
  profile: StudentProfile;
  initialData?: MentorAdminData | null;
  onUpdateProfile?: (profile: StudentProfile) => void;
  onUpdateMentorData?: (data: MentorAdminData) => void;
}

const DEFAULT_CONSULTATION_SESSIONS: ConsultationSession[] = [
  {
    id: "bimb-1",
    pertemuanKe: 1,
    tanggal: "2025-02-10",
    topikBab: "Orientasi Lapangan & Pengajuan Kerangka Kerja (TOR)",
    catatanRevisi: "Fokuskan ruang lingkup masalah pada efisiensi proses bisnis inti di unit kerja mitra.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-2",
    pertemuanKe: 2,
    tanggal: "2025-02-24",
    topikBab: "Bab I: Pendahuluan, Rumusan Masalah & Tujuan Magang/KKN",
    catatanRevisi: "Perjelas indikator ketercapaian luaran (deliverables) agar terukur secara kuantitatif.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-3",
    pertemuanKe: 3,
    tanggal: "2025-03-10",
    topikBab: "Bab II: Profil Organisasi Mitra & Tinjauan Pustaka",
    catatanRevisi: "Tambahkan struktur organisasi divisi terkait dan alur SOP eksisting.",
    pembimbing: "Mentor Mitra",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-4",
    pertemuanKe: 4,
    tanggal: "2025-03-25",
    topikBab: "Bab III: Metodologi Pelaksanaan & Rencana Implementasi",
    catatanRevisi: "Sudah sesuai dengan timeline sprint proyek di departemen teknis.",
    pembimbing: "Mentor Mitra",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-5",
    pertemuanKe: 5,
    tanggal: "2025-04-14",
    topikBab: "Monitoring & Evaluasi Tengah Semester (Monev Kemajuan 50%)",
    catatanRevisi: "Logbook mingguan tertib. Lanjutkan pengambilan data pengujian hasil implementasi.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-6",
    pertemuanKe: 6,
    tanggal: "2025-05-05",
    topikBab: "Bab IV: Hasil Pelaksanaan Proyek, Analisis & Pembahasan",
    catatanRevisi: "Lengkapi tabel perbandingan efisiensi sebelum dan sesudah implementasi sistem/program.",
    pembimbing: "Mentor Mitra",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-7",
    pertemuanKe: 7,
    tanggal: "2025-05-20",
    topikBab: "Bab V: Kesimpulan, Rekomendasi Mitra & Draf Artikel Ilmiah",
    catatanRevisi: "Abstrak artikel ilmiah disesuaikan dengan format template jurnal SINTA.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-8",
    pertemuanKe: 8,
    tanggal: "2025-06-02",
    topikBab: "Validasi Draf Final Laporan Akhir & Persetujuan Sidang (ACC)",
    catatanRevisi: "Seluruh berkas laporan akhir dan luaran wajib lengkap. Disetujui untuk maju seminar/sidang.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
];

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
          namaInstansi: profile.namaMitra || "PT Inovasi Teknologi Indonesia",
          alamatKantor:
            "Gedung Cyber 2 Lantai 18, Jl. H.R. Rasuna Said Blok X-5 Kav. 13, Jakarta Selatan 12950",
          kontakWebsiteEmail:
            "Website: https://mitra.co.id | Email: hr@mitra.co.id | Telp: (021) 5299-1000",
          logoMitraBase64: "",
        },
      };
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
      kopSurat: {
        namaInstansi: profile.namaMitra || "PT Inovasi Teknologi Indonesia",
        alamatKantor:
          "Gedung Cyber 2 Lantai 18, Jl. H.R. Rasuna Said Blok X-5 Kav. 13, Jakarta Selatan 12950",
        kontakWebsiteEmail:
          "Website: https://mitra.co.id | Email: hr@mitra.co.id | Telp: (021) 5299-1000",
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
  const totalWeightedScore =
    Math.round(
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
  const imradManuscript = useMemo(() => {
    const namaMhs = profile.namaMahasiswa || "Nama Mahasiswa";
    const nimMhs = profile.nim || "NIM";
    const prodi = profile.programStudi || "Program Studi Teknik Informatika";
    const univ = profile.perguruanTinggi || "Universitas";
    const dpl = profile.namaPembimbing || "Dosen Pembimbing Lapangan, M.Kom.";
    const mitra = profile.namaMitra || adminData.kopSurat?.namaInstansi || "Instansi Mitra";
    const divisi = adminData.divisi || "Divisi Operasional & Teknologi";

    return `================================================================================
DRAF MANUSKRIP ARTIKEL ILMIAH (${skemaJurnal === "pengabdian" ? "JURNAL PENGABDIAN MASYARAKAT - STANDAR SINTA" : "JURNAL RISET TERAPAN / KERJA PRAKTIK"})
Format Struktur: IMRAD (Introduction, Methods, Results, and Discussion)
================================================================================

JUDUL ARTIKEL:
${judulJurnal.toUpperCase()}

PENULIS & AFILIASI:
1. ${namaMhs} (${nimMhs}) — ${prodi}, ${univ}
2. ${dpl} — ${prodi}, ${univ} (Corresponding Author)
3. ${adminData.namaMentor} — ${divisi}, ${mitra}

--------------------------------------------------------------------------------
ABSTRAK (BAHASA INDONESIA)
--------------------------------------------------------------------------------
Kegiatan ${skemaJurnal === "pengabdian" ? "pengabdian kepada masyarakat dan kemitraan institusi" : "magang industri dan riset terapan"} pada ${mitra} bertujuan untuk menjawab permasalahan mitra terkait: ${masalahMitra} Metode pelaksanaan yang diterapkan meliputi tahapan observasi kebutuhan lapangan, perancangan solusi sistematis, implementasi bertahap pada ${divisi}, serta evaluasi kinerja berbasis indikator terukur. Solusi utama yang dihadirkan berupa: ${solusiInovasi} Hasil evaluasi pelaksanaan menunjukkan capaian signifikan, yaitu: ${capaianKuantitatif} Selain itu, evaluasi kompetensi dan kinerja pelaksanaan oleh pihak mitra memperoleh skor akhir terbobot sebesar ${totalWeightedScore}/100 dengan predikat "${getPredikat(totalWeightedScore)}". Luaran kegiatan ini diharapkan dapat menjadi rujukan tata kelola berkelanjutan bagi ${mitra}.

Kata Kunci: ${kataKunci}

--------------------------------------------------------------------------------
ABSTRACT (ENGLISH)
--------------------------------------------------------------------------------
This ${skemaJurnal === "pengabdian" ? "community engagement and institutional partnership" : "industrial internship and applied research"} program conducted at ${mitra} aims to address operational challenges within ${divisi}. The primary methodology encompasses field observation, structured solution engineering, iterative deployment, and quantitative performance evaluation. By implementing standardized digital workflows and operational procedures, the program achieved measurable improvements: ${capaianKuantitatif} Furthermore, the official partner evaluation recorded a weighted performance score of ${totalWeightedScore}/100 (${getPredikat(totalWeightedScore)}). These findings demonstrate that structured academic-industry collaboration effectively accelerates operational excellence at ${mitra}.

Keywords: ${kataKunci}

================================================================================
1. PENDAHULUAN (INTRODUCTION)
================================================================================
1.1 Analisis Situasi & Latar Belakang
Sinergi antara perguruan tinggi (${univ}) dengan dunia industri dan instansi mitra (${mitra}) merupakan instrumen krusial dalam mengakselerasi hilirisasi keilmuan ${prodi}. Berdasarkan observasi awal yang dilaksanakan pada ${divisi} di ${mitra}, teridentifikasi sejumlah tantangan operasional yang memerlukan intervensi teknis dan manajerial.

1.2 Permasalahan Mitra
Secara spesifik, permasalahan prioritas yang dihadapi oleh mitra meliputi:
${masalahMitra}

1.3 Tujuan dan Manfaat Kegiatan
Tujuan dari pelaksanaan kegiatan ini adalah merancang, mengimplementasikan, dan mengevaluasi solusi terukur guna meningkatkan efektivitas proses kerja pada ${mitra}, sekaligus memberikan dampak nyata yang terverifikasi secara kuantitatif.

================================================================================
2. METODE PELAKSANAAN (METHODS)
================================================================================
Pelaksanaan kegiatan di ${mitra} menggunakan pendekatan siklus PDCA (Plan-Do-Check-Act) yang terbagi ke dalam 4 (empat) tahapan sistematis:
1. Tahap Observasi & Analisis Kebutuhan (Requirement Gathering): Pemetaan alur kerja eksisting dan wawancara mendalam bersama ${adminData.namaMentor} (${adminData.jabatanMentor}).
2. Tahap Perancangan Solusi (Design & Prototyping): ${solusiInovasi}
3. Tahap Implementasi & Pendampingan (Deployment & Socialization): Penerapan langsung pada lingkungan operasional ${divisi} disertai uji coba pengguna.
4. Tahap Evaluasi & Keberlanjutan (Evaluation): Pengukuran indikator efisiensi dan penilaian kinerja berbasis rubrik 5 aspek standar industri.

================================================================================
3. HASIL DAN PEMBAHASAN (RESULTS AND DISCUSSION)
================================================================================
3.1 Ketercapaian Solusi dan Dampak Kuantitatif
Implementasi program pada ${mitra} berjalan sesuai kerangka acuan kerja yang telah disepakati. Berdasarkan pengukuran data sebelum dan sesudah program berjalan, diperoleh hasil utama sebagai berikut:
${capaianKuantitatif}

3.2 Evaluasi Kinerja Pelaksanaan oleh Instansi Mitra
Sebagai bentuk validasi objektif dari pihak industri/mitra, dilakukan pengukuran terhadap 5 (lima) aspek penilaian utama dengan rincian capaian sebagai berikut:
${adminData.scores
  .map(
    (s, i) =>
      `   ${i + 1}. ${s.aspek} (Bobot ${s.bobot}%): Skor ${s.nilai}/100 — ${s.keterangan}`
  )
  .join("\n")}

   -> SKOR AKHIR TERBOBOT : ${totalWeightedScore} / 100
   -> PREDIKAT KELULUSAN  : ${getPredikat(totalWeightedScore)}
   -> CATATAN EVALUATOR   : "${adminData.catatanEvaluasi}"

================================================================================
4. KESIMPULAN DAN SARAN (CONCLUSION)
================================================================================
4.1 Kesimpulan
Program kolaborasi dan implementasi pada ${mitra} telah berhasil menyelesaikan permasalahan mitra melalui ${solusiInovasi.toLowerCase()} Capaian kuantitatif serta skor evaluasi kinerja sebesar ${totalWeightedScore}/100 membuktikan bahwa solusi yang diterapkan relevan dengan kebutuhan riil organisasi.

4.2 Ucapan Terima Kasih (Acknowledgments)
Penulis menyampaikan terima kasih kepada Program Studi ${prodi}, ${univ}, Dosen Pembimbing Lapangan (${dpl}), serta jajaran pimpinan dan tim ${divisi} pada ${mitra} atas dukungan fasilitas dan pendampingan selama kegiatan berlangsung.

================================================================================
DAFTAR PUSTAKA (REFERENCES)
================================================================================
[1] Direktorat Jenderal Pendidikan Tinggi, Riset, dan Teknologi. (2024). Buku Panduan Merdeka Belajar - Kampus Merdeka (MBKM). Jakarta: Kemendikbudristek.
[2] Tim Penyusun Pedoman Akademik. (2025). Pedoman Penulisan Laporan Kerja Praktik, Magang Industri, dan Publikasi Ilmiah Mahasiswa. ${univ}.
[3] Dokumen Prosedur Operasional Standar (SOP) & Laporan Tahunan ${mitra} (${new Date().getFullYear()}).
================================================================================`;
  }, [
    profile,
    adminData,
    skemaJurnal,
    judulJurnal,
    kataKunci,
    masalahMitra,
    solusiInovasi,
    capaianKuantitatif,
    totalWeightedScore,
  ]);

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
      {activeSubTab === "berkas" && (
        <div className="space-y-8">
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
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
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
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
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
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
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
              {/* Card: Kop Surat Mitra & Logo Resmi */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Kop Surat Resmi Mitra
                  </h4>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Garis Ganda + QR Stamp
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Perusahaan / Instansi Mitra
                  </label>
                  <input
                    type="text"
                    value={adminData.kopSurat?.namaInstansi ?? ""}
                    onChange={(e) =>
                      updateAdminDataState({
                        ...adminData,
                        kopSurat: {
                          ...(adminData.kopSurat || {}),
                          namaInstansi: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. PT Telekomunikasi Indonesia Tbk."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Kantor Resmi Mitra
                  </label>
                  <input
                    type="text"
                    value={adminData.kopSurat?.alamatKantor ?? ""}
                    onChange={(e) =>
                      updateAdminDataState({
                        ...adminData,
                        kopSurat: {
                          ...(adminData.kopSurat || {}),
                          alamatKantor: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Telkom Landmark Tower Lt. 38, Jakarta 12710"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kontak, Email & Website Resmi
                  </label>
                  <input
                    type="text"
                    value={adminData.kopSurat?.kontakWebsiteEmail ?? ""}
                    onChange={(e) =>
                      updateAdminDataState({
                        ...adminData,
                        kopSurat: {
                          ...(adminData.kopSurat || {}),
                          kontakWebsiteEmail: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. www.mitra.co.id | hr@mitra.co.id"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Upload Logo Perusahaan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Logo Perusahaan Mitra (PNG / JPG)
                  </label>
                  {adminData.kopSurat?.logoMitraBase64 ? (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-14 h-14 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={adminData.kopSurat.logoMitraBase64}
                          alt="Logo Mitra"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          Logo Terpasang di Kop Surat
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Format PNG/JPG siap dicetak
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                        title="Hapus Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-indigo-500 cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30">
                      <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Unggah Logo Perusahaan
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG transparan atau JPG (Maks. 2MB)
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Dicetak otomatis sebagai kepala surat resmi bergaris ganda dan dilengkapi stempel QR keabsahan dokumen.
                </p>
              </div>

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
                    onChange={(e) =>
                      updateAdminDataState({ ...adminData, namaMentor: e.target.value })
                    }
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
                    onChange={(e) =>
                      updateAdminDataState({ ...adminData, jabatanMentor: e.target.value })
                    }
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
                    onChange={(e) =>
                      updateAdminDataState({ ...adminData, nomorSurat: e.target.value })
                    }
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
                    onChange={(e) =>
                      updateAdminDataState({ ...adminData, tanggalSurat: e.target.value })
                    }
                    placeholder="e.g. 14 Oktober 2026"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  Nama mahasiswa ({profile.namaMahasiswa}), NIM ({profile.nim}), dan mitra (
                  {profile.namaMitra}) diambil otomatis dari Profil Mahasiswa.
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
                  onChange={(e) =>
                    updateAdminDataState({ ...adminData, catatanEvaluasi: e.target.value })
                  }
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
                  <span className="text-base font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
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
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 tabular-nums">
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
                          className="w-16 text-center text-xs font-bold tabular-nums py-1 px-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: KARTU KENDALI BIMBINGAN DPL / MENTOR                     */}
      {/* =================================================================== */}
      {activeSubTab === "bimbingan" && (
        <div className="space-y-6">
          {/* Top Summary & Action Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Kartu Kendali Bimbingan DPL & Mentor Lapangan
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Bukti wajib pemenuhan syarat minimal 8 kali asistensi/konsultasi penyusunan laporan sebelum pengajuan Seminar/Sidang KP, MBKM, atau KKN.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyBimbingan}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                >
                  {copiedBimbingan ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedBimbingan ? "Tersalin" : "Salin Teks Kartu"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBimbinganCsv}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Kartu Kendali (.csv)</span>
                </button>
              </div>
            </div>

            {/* Progress Bar 8x Bimbingan */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Progres Pemenuhan Syarat Sidang (Min. {minimumTargetSessions} Sesi Disetujui)
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {approvedSessionsCount} / {minimumTargetSessions} Sesi ({bimbinganProgressPct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${bimbinganProgressPct}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                    Status Kelayakan Sidang
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {approvedSessionsCount >= minimumTargetSessions
                      ? "Memenuhi Syarat ACC Sidang"
                      : `Kurang ${minimumTargetSessions - approvedSessionsCount} Sesi Bimbingan`}
                  </span>
                </div>
                <CheckCircle2
                  className={`w-6 h-6 shrink-0 ${
                    approvedSessionsCount >= minimumTargetSessions
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Add New Session Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              Tambah Catatan Sesi Konsultasi / Bimbingan Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={newTanggal}
                  onChange={(e) => setNewTanggal(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Pembimbing
                </label>
                <select
                  value={newPembimbing}
                  onChange={(e) =>
                    setNewPembimbing(e.target.value as "DPL Kampus" | "Mentor Mitra")
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="DPL Kampus">DPL Kampus</option>
                  <option value="Mentor Mitra">Mentor Mitra</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Bab / Topik Bimbingan
                </label>
                <input
                  type="text"
                  value={newTopik}
                  onChange={(e) => setNewTopik(e.target.value)}
                  placeholder="Misal: Revisi Bab IV & Lampiran Teknis"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Catatan Revisi / Arahan Dosen
                </label>
                <input
                  type="text"
                  value={newCatatan}
                  onChange={(e) => setNewCatatan(e.target.value)}
                  placeholder="Misal: Perbaiki grafik efisiensi waktu"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Sesi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Consultation Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-3.5 px-4 text-center w-14">Sesi</th>
                    <th className="py-3.5 px-4 w-32">Tanggal</th>
                    <th className="py-3.5 px-4 w-32">Pembimbing</th>
                    <th className="py-3.5 px-4">Bab / Topik Bimbingan</th>
                    <th className="py-3.5 px-4">Catatan Revisi & Arahan</th>
                    <th className="py-3.5 px-4 w-44 text-center">Status E-Paraf</th>
                    <th className="py-3.5 px-4 w-14 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {sessions.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 text-center font-bold tabular-nums text-slate-900 dark:text-white">
                        #{item.pertemuanKe}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                        {item.tanggal}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.pembimbing === "DPL Kampus"
                              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                              : "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
                          }`}
                        >
                          {item.pembimbing}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {item.topikBab}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.catatanRevisi}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSessionStatus(item.id)}
                          title="Klik untuk mengubah status paraf"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            item.statusParaf === "Disetujui & Diparaf"
                              ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : item.statusParaf === "Revisi Minor"
                              ? "bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <PenTool className="w-3 h-3" />
                          <span>{item.statusParaf}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Hapus Sesi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 3: GENERATOR DRAF ARTIKEL ILMIAH (IMRAD & SINTA)            */}
      {/* =================================================================== */}
      {activeSubTab === "jurnal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Parameter Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Parameter Naskah Publikasi IMRAD
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sesuaikan parameter riset/pengabdian di bawah ini. Naskah lengkap (Abstrak ID/EN, Pendahuluan, Metode, Hasil, Kesimpulan) disusun otomatis.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Skema Template Jurnal Sasaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSkemaJurnal("terapan")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    skemaJurnal === "terapan"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Jurnal Riset Terapan / KP
                </button>
                <button
                  type="button"
                  onClick={() => setSkemaJurnal("pengabdian")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    skemaJurnal === "pengabdian"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Jurnal Pengabdian (PKM SINTA)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Artikel Ilmiah
              </label>
              <textarea
                rows={2}
                value={judulJurnal}
                onChange={(e) => setJudulJurnal(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Kunci (Keywords — pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permasalahan Utama Mitra / Objek Studi
              </label>
              <textarea
                rows={3}
                value={masalahMitra}
                onChange={(e) => setMasalahMitra(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metode Solusi / Inovasi yang Diterapkan
              </label>
              <textarea
                rows={3}
                value={solusiInovasi}
                onChange={(e) => setSolusiInovasi(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hasil & Capaian Kuantitatif (Before-After)
              </label>
              <textarea
                rows={3}
                value={capaianKuantitatif}
                onChange={(e) => setCapaianKuantitatif(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Right Live IMRAD Manuscript Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Pratinjau Manuskrip IMRAD (Siap Submit OJS / SINTA)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Terintegrasi otomatis dengan skor evaluasi mitra ({totalWeightedScore}/100) dan identitas DPL.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJurnal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                >
                  {copiedJurnal ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedJurnal ? "Tersalin" : "Salin Naskah"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJurnalTxt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Draf (.txt)</span>
                </button>
              </div>
            </div>

            <pre className="w-full h-[540px] overflow-y-auto p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-800">
              {imradManuscript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
