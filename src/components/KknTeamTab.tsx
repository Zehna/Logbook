"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Tent,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  Copy,
  Check,
  Download,
  Layers,
  MapPin,
  FileText,
  Wallet,
  Award,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { KknProkerItem, KknTeamData } from "@/src/lib/types/modules";

const INITIAL_PROKERS: KknProkerItem[] = [
  {
    id: "p1",
    namaProker: "Sosialisasi Sanitasi & Pemilahan Sampah Rumah Tangga",
    divisi: "Kesehatan & Sanitasi",
    sasaranWarga: "60 Ibu-Ibu PKK & Kader Posyandu RW 03",
    status: "Selesai 100%",
    capaianDanOutput:
      "Pemasangan 10 unit tempat sampah pilah organik-anorganik dan booklet edukasi pencegahan DBD.",
    penanggungJawab: "Ahmad & Siti",
  },
  {
    id: "p2",
    namaProker: "Bimbel Ceria & Pojok Baca Digital Anak Desa",
    divisi: "Pendidikan & Literasi",
    sasaranWarga: "45 Siswa SDN 01 Sukamaju (Kelas 4-6)",
    status: "Selesai 100%",
    capaianDanOutput:
      "Pengadaan 120 buku bacaan hibah, 8 sesi pendampingan calistung, dan pelatihan dasar komputer.",
    penanggungJawab: "Nadia & Rizky",
  },
  {
    id: "p3",
    namaProker: "Digitalisasi Pemasaran & Foto Produk UMKM Keripik Singkong",
    divisi: "Ekonomi Kreatif & UMKM",
    sasaranWarga: "8 Pelaku UMKM Makanan Olahan Dusun 2",
    status: "Sedang Berjalan 75%",
    capaianDanOutput:
      "Pembuatan akun Google Maps Business, desain label stiker kemasan baru, dan onboarding Shopee/Tokopedia.",
    penanggungJawab: "Budi & Maya",
  },
  {
    id: "p4",
    namaProker: "Pemasangan Plang Petunjuk Arah & Lampu Penerangan Jalan",
    divisi: "Infrastruktur & Lingkungan",
    sasaranWarga: "Masyarakat Umum Dusun 1 & Dusun 3",
    status: "Sedang Berjalan 75%",
    capaianDanOutput:
      "Terpasang 14 plang penunjuk jalan reflektif dan pembersihan saluran drainase sepanjang 300 meter.",
    penanggungJawab: "Dimas & Tim",
  },
];

interface KknRabItem {
  id: string;
  prokerTerkait: string;
  uraianPengeluaran: string;
  sumberDana: "LPPM Kampus" | "Swadaya Mahasiswa" | "Dana Desa / Mitra" | "Sponsor";
  anggaranRencana: number;
  realisasiPengeluaran: number;
  nomorBuktiNota: string;
}

const INITIAL_RAB_ITEMS: KknRabItem[] = [
  {
    id: "rab-1",
    prokerTerkait: "Sosialisasi Sanitasi & Pemilahan Sampah Rumah Tangga",
    uraianPengeluaran: "Pengadaan 10 set tong sampah pilah & cetak 60 booklet sanitasi",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 1500000,
    realisasiPengeluaran: 1425000,
    nomorBuktiNota: "KW/KKN/001",
  },
  {
    id: "rab-2",
    prokerTerkait: "Bimbel Ceria & Pojok Baca Digital Anak Desa",
    uraianPengeluaran: "Rak buku kayu, alat tulis edukasi, dan cetak modul calistung",
    sumberDana: "Swadaya Mahasiswa",
    anggaranRencana: 950000,
    realisasiPengeluaran: 910000,
    nomorBuktiNota: "KW/KKN/002",
  },
  {
    id: "rab-3",
    prokerTerkait: "Digitalisasi Pemasaran & Foto Produk UMKM Keripik Singkong",
    uraianPengeluaran: "Cetak 500 stiker kemasan standing pouch & mini studio box foto produk",
    sumberDana: "Dana Desa / Mitra",
    anggaranRencana: 1200000,
    realisasiPengeluaran: 1150000,
    nomorBuktiNota: "KW/KKN/003",
  },
  {
    id: "rab-4",
    prokerTerkait: "Pemasangan Plang Petunjuk Arah & Lampu Penerangan Jalan",
    uraianPengeluaran: "Plat besi reflektif, tiang pipa galvanis, cat besi, dan semen cor",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 1850000,
    realisasiPengeluaran: 1800000,
    nomorBuktiNota: "KW/KKN/004",
  },
];

interface KknLuaranWajibItem {
  id: string;
  kategori: string;
  judulLuaran: string;
  targetSpesifikasi: string;
  status: "Tuntas / Terbit" | "Proses Review DPL" | "Penyusunan Draf" | "Belum Dimulai";
  tautanBukti: string;
}

const INITIAL_LUARAN_WAJIB: KknLuaranWajibItem[] = [
  {
    id: "lw-1",
    kategori: "Buku Saku / Modul Masyarakat",
    judulLuaran: "Buku Saku Panduan Pengelolaan Sampah Rumah Tangga & Katalog Digital UMKM Desa Sukamaju",
    targetSpesifikasi: "PDF Ber-ISBN / HKI Kampus • 32 Halaman Full Color",
    status: "Tuntas / Terbit",
    tautanBukti: "https://drive.google.com/drive/folders/buku-saku-kkn-104",
  },
  {
    id: "lw-2",
    kategori: "Video Dokumenter & Profil Desa",
    judulLuaran: "Dokumenter Sinergi KKN-T 104: Transformasi Literasi & Ekonomi Kreatif Desa Sukamaju",
    targetSpesifikasi: "Resolusi 1080p • Durasi 10–15 Menit • YouTube Resmi",
    status: "Tuntas / Terbit",
    tautanBukti: "https://youtube.com/watch?v=kkn104-sukamaju",
  },
  {
    id: "lw-3",
    kategori: "Publikasi Media Massa Online",
    judulLuaran: "Mahasiswa KKN-T 104 Dorong Digitalisasi 8 UMKM Olahan Singkong Tembus E-Commerce",
    targetSpesifikasi: "Portal Berita Nasional / Daerah Terverifikasi Dewan Pers",
    status: "Tuntas / Terbit",
    tautanBukti: "https://kompasiana.com/kkn104-umkm-sukamaju",
  },
  {
    id: "lw-4",
    kategori: "Artikel Jurnal Pengabdian (SINTA)",
    judulLuaran: "Pemberdayaan Ekonomi Pelaku UMKM Desa Sukamaju Melalui Rebranding Kemasan dan Pemasaran Digital",
    targetSpesifikasi: "Format IMRAD • Target Submit Jurnal Pengabdian SINTA 4",
    status: "Proses Review DPL",
    tautanBukti: "https://jurnal.kampus.ac.id/pengabdian/submission/104",
  },
  {
    id: "lw-5",
    kategori: "Peta Monografi / Infografis Desa",
    judulLuaran: "Peta Spasial Sebaran UMKM & Titik Fasilitas Sanitasi Desa Sukamaju",
    targetSpesifikasi: "Banner Cetak A1 Balai Desa & File Vektor",
    status: "Tuntas / Terbit",
    tautanBukti: "Diserahkan ke Kepala Desa Sukamaju (BAST-04)",
  },
];

interface KknTeamTabProps {
  onConvertToDailyLogbook?: (
    proker: KknProkerItem,
    villageInfo: { namaDesa: string; unit: string }
  ) => void;
}

export const KknTeamTab: React.FC<KknTeamTabProps> = ({
  onConvertToDailyLogbook,
}) => {
  const [subTab, setSubTab] = useState<"proker" | "rab" | "luaran">("proker");

  const [teamData, setTeamData] = useState<KknTeamData>({
    namaDesa: "Desa Sukamaju, Kec. Cisarua, Kab. Bogor",
    kecamatanKabupaten: "Kecamatan Cisarua, Jawa Barat",
    namaUnit: "Unit KKN-T 104 'Sinergi Berkelanjutan'",
    dplNama: "Dr. Ir. Hendra Saputra, M.Si.",
    ketuaKelompok: "Farhan Ardiansyah",
    daftarProker: INITIAL_PROKERS,
  });

  const [newProker, setNewProker] = useState<Partial<KknProkerItem>>({
    namaProker: "",
    divisi: "Kesehatan & Sanitasi",
    sasaranWarga: "",
    status: "Sedang Berjalan 75%",
    capaianDanOutput: "",
    penanggungJawab: "",
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // State RAB & LPJ Keuangan
  const [rabItems, setRabItems] = useState<KknRabItem[]>(INITIAL_RAB_ITEMS);
  const [showAddRab, setShowAddRab] = useState(false);
  const [newRab, setNewRab] = useState<Omit<KknRabItem, "id">>({
    prokerTerkait: INITIAL_PROKERS[0].namaProker,
    uraianPengeluaran: "",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 500000,
    realisasiPengeluaran: 480000,
    nomorBuktiNota: "KW/KKN/005",
  });

  // State Luaran Wajib LPPM
  const [luaranItems, setLuaranItems] = useState<KknLuaranWajibItem[]>(INITIAL_LUARAN_WAJIB);

  // Kalkulasi Ringkasan Keuangan RAB
  const financialSummary = useMemo(() => {
    const totalRencana = rabItems.reduce((acc, r) => acc + (Number(r.anggaranRencana) || 0), 0);
    const totalRealisasi = rabItems.reduce(
      (acc, r) => acc + (Number(r.realisasiPengeluaran) || 0),
      0
    );
    const sisaSaldo = totalRencana - totalRealisasi;
    const serapanPersen =
      totalRencana > 0 ? Math.min(100, Math.round((totalRealisasi / totalRencana) * 100)) : 0;

    return {
      totalRencana,
      totalRealisasi,
      sisaSaldo,
      serapanPersen,
    };
  }, [rabItems]);

  const formatRupiah = (amount: number) => {
    return "Rp " + amount.toLocaleString("id-ID");
  };

  const handleAddProker = () => {
    if (!newProker.namaProker?.trim()) return;

    const item: KknProkerItem = {
      id: `p-${Date.now()}`,
      namaProker: newProker.namaProker.trim(),
      divisi: newProker.divisi || "Kesehatan & Sanitasi",
      sasaranWarga: newProker.sasaranWarga?.trim() || "Warga Desa",
      status: (newProker.status as KknProkerItem["status"]) || "Sedang Berjalan 75%",
      capaianDanOutput: newProker.capaianDanOutput?.trim() || "Dalam tahap implementasi",
      penanggungJawab: newProker.penanggungJawab?.trim() || "Tim Divisi",
    };

    setTeamData((prev) => ({
      ...prev,
      daftarProker: [...prev.daftarProker, item],
    }));

    setNewProker({
      namaProker: "",
      divisi: "Kesehatan & Sanitasi",
      sasaranWarga: "",
      status: "Sedang Berjalan 75%",
      capaianDanOutput: "",
      penanggungJawab: "",
    });
    setShowAddForm(false);
    toast.success("Program kerja baru berhasil ditambahkan.");
  };

  const handleDeleteProker = (id: string) => {
    setTeamData((prev) => ({
      ...prev,
      daftarProker: prev.daftarProker.filter((p) => p.id !== id),
    }));
  };

  const handleAddRabItem = () => {
    if (!newRab.uraianPengeluaran.trim()) {
      toast.error("Mohon isi uraian pengeluaran RAB.");
      return;
    }
    const created: KknRabItem = {
      id: `rab-${Date.now()}`,
      ...newRab,
    };
    setRabItems((prev) => [...prev, created]);
    setNewRab({
      prokerTerkait: teamData.daftarProker[0]?.namaProker || "Program Kerja KKN",
      uraianPengeluaran: "",
      sumberDana: "LPPM Kampus",
      anggaranRencana: 500000,
      realisasiPengeluaran: 450000,
      nomorBuktiNota: `KW/KKN/00${rabItems.length + 2}`,
    });
    setShowAddRab(false);
    toast.success("Baris anggaran RAB & realisasi LPJ berhasil ditambahkan.");
  };

  const handleDeleteRabItem = (id: string) => {
    setRabItems((prev) => prev.filter((r) => r.id !== id));
  };

  const handleExportLpjCsv = () => {
    const header =
      "No,Program Kerja,Uraian Pengeluaran,Sumber Dana,Rencana Anggaran (Rp),Realisasi LPJ (Rp),Selisih/Sisa (Rp),No Bukti Kwitansi";
    const rows = rabItems.map((r, i) => {
      const sisa = r.anggaranRencana - r.realisasiPengeluaran;
      return `${i + 1},"${r.prokerTerkait}","${r.uraianPengeluaran}","${r.sumberDana}",${
        r.anggaranRencana
      },${r.realisasiPengeluaran},${sisa},"${r.nomorBuktiNota}"`;
    });
    const footer = `TOTAL,"Rekapitulasi Akhir LPJ Keuangan KKN","","",${financialSummary.totalRencana},${financialSummary.totalRealisasi},${financialSummary.sisaSaldo},""`;

    const csv = [header, ...rows, footer].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LPJ_Keuangan_KKN_${teamData.namaUnit.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Tabel LPJ Keuangan KKN (.csv) berhasil diunduh!");
  };

  const handleGenerateCollectiveReport = () => {
    const total = teamData.daftarProker.length;
    const selesai = teamData.daftarProker.filter((p) => p.status === "Selesai 100%").length;
    const persentase = total > 0 ? Math.round((selesai / total) * 100) : 0;

    const report = `# BUKU LAPORAN PERTANGGUNGJAWABAN (LPJ) KOLEKTIF PROGRAM KERJA & LUARAN KKN
**Lokasi Pengabdian:** ${teamData.namaDesa}
**Nama Unit/Kelompok:** ${teamData.namaUnit}
**Dosen Pembimbing Lapangan (DPL):** ${teamData.dplNama}
**Ketua Kelompok:** ${teamData.ketuaKelompok}
**Tingkat Keberhasilan Program:** ${selesai}/${total} Proker Tuntas (${persentase}%)
**Serapan Anggaran LPJ Keuangan:** ${formatRupiah(financialSummary.totalRealisasi)} dari ${formatRupiah(financialSummary.totalRencana)} (${financialSummary.serapanPersen}%)

---

### BAB I: GAMBARAN UMUM LOKASI & FOKUS PENGABDIAN
Pelaksanaan Kuliah Kerja Nyata (KKN) oleh ${teamData.namaUnit} bertempat di ${teamData.namaDesa}. Program kerja dirancang secara partisipatif bersama perangkat desa dan tokoh masyarakat setempat, dengan menitikberatkan pada aspek kesehatan lingkungan, peningkatan literasi generasi muda, infrastruktur penunjang, dan pemberdayaan ekonomi lokal.

---

### BAB II: MATRIKS REKAPITULASI CAPAIAN PROGRAM KERJA
${teamData.daftarProker
  .map(
    (p, i) => `#### ${i + 1}. ${p.namaProker}
- **Divisi:** ${p.divisi}
- **Penanggung Jawab:** ${p.penanggungJawab}
- **Sasaran / Penerima Manfaat:** ${p.sasaranWarga}
- **Status Capaian:** ${p.status}
- **Deskripsi Luaran & Capaian Nyata:** ${p.capaianDanOutput}`
  )
  .join("\n\n")}

---

### BAB III: LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN KELOMPOK
- **Total Anggaran Direncanakan (RAB):** ${formatRupiah(financialSummary.totalRencana)}
- **Total Realisasi Pengeluaran:** ${formatRupiah(financialSummary.totalRealisasi)}
- **Sisa Saldo Anggaran:** ${formatRupiah(financialSummary.sisaSaldo)}

Rincian Penggunaan Dana:
${rabItems
  .map(
    (r, i) =>
      `${i + 1}. [${r.nomorBuktiNota}] ${r.uraianPengeluaran} (${r.sumberDana}) — Realisasi: ${formatRupiah(
        r.realisasiPengeluaran
      )}`
  )
  .join("\n")}

---

### BAB IV: REKAPITULASI CAPAIAN LUARAN WAJIB LPPM & PUBLIKASI SINTA
${luaranItems
  .map(
    (lw, i) =>
      `${i + 1}. **${lw.kategori}**: "${lw.judulLuaran}" (${lw.status}) — Bukti: ${lw.tautanBukti}`
  )
  .join("\n")}

---

### BAB V: EVALUASI HAMBATAN LAPANGAN & RENCANA KEBERLANJUTAN
1. Penyerahan modul operasional dan buku saku panduan kepada pengurus Karang Taruna & PKK Desa.
2. Koordinasi dengan pihak sekolah dasar untuk melanjutkan jadwal Pojok Baca secara mandiri.
3. Pendampingan pemasaran digital berkelanjutan bagi pelaku UMKM desa binaan.`;

    setReportResult(report);
    toast.success("Draf Buku Laporan Kolektif KKN (Proker + RAB + Luaran) berhasil disusun!");
  };

  const handleCopyReport = () => {
    if (!reportResult) return;
    navigator.clipboard.writeText(reportResult);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReportTxt = () => {
    if (!reportResult) return;
    const blob = new Blob([reportResult], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Laporan_Kolektif_KKN_${teamData.namaUnit.replace(/\s+/g, "_")}.txt`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedLuaranCount = luaranItems.filter(
    (l) => l.status === "Tuntas / Terbit"
  ).length;

  return (
    <div className="space-y-6">
      {/* Clean Header Card */}
      <div className="bg-zinc-900 dark:bg-zinc-900 text-white rounded-2xl p-6 border border-zinc-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs text-zinc-400 font-medium">
              Manajemen Program Kerja, RAB Keuangan &amp; Luaran Wajib LPPM
            </p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
              Pusat Komando Tim KKN Desa &amp; Laporan LPJ Kolektif
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Kelola daftar program kerja lintas divisi, susun Laporan Pertanggungjawaban (LPJ) Keuangan RAB, dan pantau pemenuhan luaran wajib LPPM (Buku Saku, Video, Media Massa, &amp; Jurnal SINTA).
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0 text-center">
            <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700/80">
              <div className="text-lg font-bold font-mono tabular-nums text-white">
                {teamData.daftarProker.length}
              </div>
              <div className="text-[11px] text-zinc-400">Total Proker</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700/80">
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                {financialSummary.serapanPersen}%
              </div>
              <div className="text-[11px] text-zinc-400">Serapan RAB</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700/80">
              <div className="text-lg font-bold font-mono tabular-nums text-white">
                {completedLuaranCount}/{luaranItems.length}
              </div>
              <div className="text-[11px] text-zinc-400">Luaran Tuntas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Profil Tim & Lokasi */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Identitas Lokasi Desa &amp; Kepengurusan Unit KKN</span>
          </h3>

          {/* Sub-Navigation Switcher */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setSubTab("proker")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                subTab === "proker"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>1. Program Kerja ({teamData.daftarProker.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab("rab")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                subTab === "rab"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>2. RAB &amp; LPJ Keuangan</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab("luaran")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                subTab === "luaran"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>3. Luaran Wajib &amp; SINTA</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Nama Desa &amp; Lokasi:
            </label>
            <input
              type="text"
              value={teamData.namaDesa}
              onChange={(e) => setTeamData({ ...teamData, namaDesa: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Nama Unit / Kelompok:
            </label>
            <input
              type="text"
              value={teamData.namaUnit}
              onChange={(e) => setTeamData({ ...teamData, namaUnit: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
              Dosen Pembimbing Lapangan (DPL):
            </label>
            <input
              type="text"
              value={teamData.dplNama}
              onChange={(e) => setTeamData({ ...teamData, dplNama: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: DAFTAR PROGRAM KERJA */}
      {subTab === "proker" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>Daftar Program Kerja Kelompok ({teamData.daftarProker.length} Proker)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pantau progres divisi kesehatan, pendidikan, infrastruktur, dan ekonomi kreatif.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Proker Baru</span>
            </button>
          </div>

          {showAddForm && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                Input Program Kerja Baru
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Nama Program Kerja:
                  </label>
                  <input
                    type="text"
                    value={newProker.namaProker}
                    onChange={(e) => setNewProker({ ...newProker, namaProker: e.target.value })}
                    placeholder="misal: Pelatihan Pemasaran Digital UMKM Desa"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Divisi / Bidang:
                  </label>
                  <select
                    value={newProker.divisi}
                    onChange={(e) => setNewProker({ ...newProker, divisi: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  >
                    <option value="Kesehatan & Sanitasi">Kesehatan &amp; Sanitasi</option>
                    <option value="Pendidikan & Literasi">Pendidikan &amp; Literasi</option>
                    <option value="Infrastruktur & Lingkungan">Infrastruktur &amp; Lingkungan</option>
                    <option value="Ekonomi Kreatif & UMKM">Ekonomi Kreatif &amp; UMKM</option>
                    <option value="Teknologi & Informasi">Teknologi &amp; Informasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Sasaran Warga / Mitra:
                  </label>
                  <input
                    type="text"
                    value={newProker.sasaranWarga}
                    onChange={(e) => setNewProker({ ...newProker, sasaranWarga: e.target.value })}
                    placeholder="misal: 40 Petani Kopi Dusun 1"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Status Capaian:
                  </label>
                  <select
                    value={newProker.status}
                    onChange={(e) =>
                      setNewProker({
                        ...newProker,
                        status: e.target.value as KknProkerItem["status"],
                      })
                    }
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  >
                    <option value="Selesai 100%">Selesai 100%</option>
                    <option value="Sedang Berjalan 75%">Sedang Berjalan 75%</option>
                    <option value="Tahap Persiapan 30%">Tahap Persiapan 30%</option>
                    <option value="Terkendala">Terkendala</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Deskripsi Capaian &amp; Output Nyata:
                  </label>
                  <textarea
                    rows={2}
                    value={newProker.capaianDanOutput}
                    onChange={(e) =>
                      setNewProker({ ...newProker, capaianDanOutput: e.target.value })
                    }
                    placeholder="Tuliskan luaran nyata (misal: pengadaan alat, modul panduan, sertifikat pelatihan)..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddProker}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
                >
                  Simpan Proker
                </button>
              </div>
            </div>
          )}

          {/* List Card Proker */}
          <div className="space-y-3">
            {teamData.daftarProker.map((p, idx) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold font-mono text-slate-400">#{idx + 1}</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {p.namaProker}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {p.divisi}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span
                      className={`font-semibold ${
                        p.status === "Selesai 100%"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : p.status === "Terkendala"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    <strong className="text-slate-700 dark:text-zinc-300">Sasaran:</strong>{" "}
                    {p.sasaranWarga} ·{" "}
                    <strong className="text-slate-700 dark:text-zinc-300">PJ:</strong>{" "}
                    {p.penanggungJawab}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed pt-1">
                    {p.capaianDanOutput}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onConvertToDailyLogbook) {
                        onConvertToDailyLogbook(p, {
                          namaDesa: teamData.namaDesa,
                          unit: teamData.namaUnit,
                        });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition cursor-pointer"
                    title="Jadikan Proker ini sebagai catatan Logbook Harian"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Jadikan Logbook Harian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteProker(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Hapus proker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: RAB & LPJ KEUANGAN DESA */}
      {subTab === "rab" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Rencana Anggaran Biaya (RAB) &amp; Realisasi LPJ Keuangan Desa</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Catat sumber pendanaan, realisasi pengeluaran per proker, serta nomor bukti kwitansi untuk lampiran LPJ akhir.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportLpjCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Unduh Tabel LPJ (.csv)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddRab(!showAddRab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item RAB</span>
              </button>
            </div>
          </div>

          {/* 3 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Total Anggaran Direncanakan</span>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
                {formatRupiah(financialSummary.totalRencana)}
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Total Realisasi Pengeluaran</span>
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                {formatRupiah(financialSummary.totalRealisasi)} ({financialSummary.serapanPersen}%)
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40">
              <span className="text-xs text-slate-500 dark:text-zinc-400">Sisa Saldo Anggaran</span>
              <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
                {formatRupiah(financialSummary.sisaSaldo)}
              </div>
            </div>
          </div>

          {/* Add RAB Form */}
          {showAddRab && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                Tambah Rincian Anggaran &amp; Kwitansi LPJ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Program Kerja Terkait:
                  </label>
                  <select
                    value={newRab.prokerTerkait}
                    onChange={(e) => setNewRab({ ...newRab, prokerTerkait: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  >
                    {teamData.daftarProker.map((p) => (
                      <option key={p.id} value={p.namaProker}>
                        {p.namaProker}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Sumber Dana:
                  </label>
                  <select
                    value={newRab.sumberDana}
                    onChange={(e) =>
                      setNewRab({
                        ...newRab,
                        sumberDana: e.target.value as KknRabItem["sumberDana"],
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  >
                    <option value="LPPM Kampus">LPPM Kampus</option>
                    <option value="Swadaya Mahasiswa">Swadaya Mahasiswa</option>
                    <option value="Dana Desa / Mitra">Dana Desa / Mitra</option>
                    <option value="Sponsor">Sponsor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Nomor Bukti Nota / Kwitansi:
                  </label>
                  <input
                    type="text"
                    value={newRab.nomorBuktiNota}
                    onChange={(e) => setNewRab({ ...newRab, nomorBuktiNota: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Uraian Kebutuhan / Belanja:
                  </label>
                  <input
                    type="text"
                    value={newRab.uraianPengeluaran}
                    onChange={(e) => setNewRab({ ...newRab, uraianPengeluaran: e.target.value })}
                    placeholder="Contoh: Cetak spanduk & konsumsi penyuluhan"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Rencana Anggaran (Rp):
                  </label>
                  <input
                    type="number"
                    value={newRab.anggaranRencana}
                    onChange={(e) =>
                      setNewRab({ ...newRab, anggaranRencana: Number(e.target.value) })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Realisasi Pengeluaran (Rp):
                  </label>
                  <input
                    type="number"
                    value={newRab.realisasiPengeluaran}
                    onChange={(e) =>
                      setNewRab({ ...newRab, realisasiPengeluaran: Number(e.target.value) })
                    }
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRab(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddRabItem}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  Simpan Item RAB
                </button>
              </div>
            </div>
          )}

          {/* RAB Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/70 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-300">
                  <th className="p-3">No. Nota</th>
                  <th className="p-3">Program Kerja &amp; Uraian</th>
                  <th className="p-3">Sumber Dana</th>
                  <th className="p-3 text-right">Rencana (Rp)</th>
                  <th className="p-3 text-right">Realisasi (Rp)</th>
                  <th className="p-3 text-right">Sisa (Rp)</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {rabItems.map((r) => {
                  const sisa = r.anggaranRencana - r.realisasiPengeluaran;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {r.nomorBuktiNota}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">
                          {r.uraianPengeluaran}
                        </div>
                        <div className="text-[11px] text-slate-500">{r.prokerTerkait}</div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                        {r.sumberDana}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                        {formatRupiah(r.anggaranRencana)}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatRupiah(r.realisasiPengeluaran)}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatRupiah(sisa)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRabItem(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Hapus baris RAB"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CHECKLIST LUARAN WAJIB LPPM & SINTA */}
      {subTab === "luaran" && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Checklist Pemenuhan Luaran Wajib KKN Tematik &amp; Publikasi SINTA</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pastikan seluruh dokumen luaran wajib LPPM (Buku Saku, Video, Media Massa, dan Jurnal Pengabdian) memiliki tautan bukti yang valid.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              {completedLuaranCount} dari {luaranItems.length} Luaran Tuntas
            </span>
          </div>

          <div className="space-y-3">
            {luaranItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400">0{idx + 1}.</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {item.kategori}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-zinc-400">
                        {item.targetSpesifikasi}
                      </span>
                    </div>
                  </div>

                  <select
                    value={item.status}
                    onChange={(e) => {
                      const updated = [...luaranItems];
                      updated[idx] = {
                        ...item,
                        status: e.target.value as KknLuaranWajibItem["status"],
                      };
                      setLuaranItems(updated);
                      toast.success(`Status "${item.kategori}" diperbarui.`);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="Tuntas / Terbit">Tuntas / Terbit</option>
                    <option value="Proses Review DPL">Proses Review DPL</option>
                    <option value="Penyusunan Draf">Penyusunan Draf</option>
                    <option value="Belum Dimulai">Belum Dimulai</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Judul Luaran / Naskah Publikasi:
                    </label>
                    <input
                      type="text"
                      value={item.judulLuaran}
                      onChange={(e) => {
                        const updated = [...luaranItems];
                        updated[idx] = { ...item, judulLuaran: e.target.value };
                        setLuaranItems(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Tautan Repository / URL Bukti Publikasi:
                    </label>
                    <input
                      type="text"
                      value={item.tautanBukti}
                      onChange={(e) => {
                        const updated = [...luaranItems];
                        updated[idx] = { ...item, tautanBukti: e.target.value };
                        setLuaranItems(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-slate-700 dark:text-zinc-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Collective Report Action & Output */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Kompilasi Buku Laporan Pertanggungjawaban (LPJ) Kolektif KKN
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Menggabungkan seluruh Program Kerja, Rekapitulasi RAB Keuangan, dan Checklist Luaran Wajib menjadi satu naskah LPJ utuh.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateCollectiveReport}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-xs transition cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Susun Draf Buku LPJ Kolektif KKN</span>
          </button>
        </div>

        {reportResult && (
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Naskah LPJ Kolektif Siap Disalin / Diunduh
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
                >
                  {copiedReport ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Laporan</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReportTxt}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh (.txt)</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs leading-relaxed text-slate-800 dark:text-zinc-200 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              {reportResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
