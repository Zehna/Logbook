"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Layers,
  MapPin,
  Wallet,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { KknProkerItem, KknTeamData } from "@/src/lib/types/modules";
import {
  DEFAULT_LUARAN_WAJIB_CLEAN,
  SAMPLE_LUARAN_WAJIB,
  SAMPLE_PROKERS,
  SAMPLE_RAB_ITEMS,
  type KknLuaranWajibItem,
  type KknRabItem,
} from "@/src/lib/data/kknSamples";
import {
  computeFinancialSummary,
  formatRupiah,
} from "@/src/lib/utils/kknFinance";
import { KknProkerSection } from "./KknProkerSection";
import { KknRabSection } from "./KknRabSection";
import { KknLuaranSection } from "./KknLuaranSection";

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
    namaDesa: "",
    kecamatanKabupaten: "",
    namaUnit: "",
    dplNama: "",
    ketuaKelompok: "",
    daftarProker: [],
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
  const [rabItems, setRabItems] = useState<KknRabItem[]>([]);
  const [showAddRab, setShowAddRab] = useState(false);
  const [newRab, setNewRab] = useState<Omit<KknRabItem, "id">>({
    prokerTerkait: "Umum / Operasional Unit",
    uraianPengeluaran: "",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 0,
    realisasiPengeluaran: 0,
    nomorBuktiNota: "",
  });

  // State Luaran Wajib LPPM
  const [luaranItems, setLuaranItems] = useState<KknLuaranWajibItem[]>(DEFAULT_LUARAN_WAJIB_CLEAN);

  const handleLoadSampleKknData = () => {
    setTeamData({
      namaDesa: "Desa Sukamaju, Kec. Cisarua, Kab. Bogor",
      kecamatanKabupaten: "Kecamatan Cisarua, Jawa Barat",
      namaUnit: "Unit KKN-T 104 'Sinergi Berkelanjutan'",
      dplNama: "Dr. Ir. Hendra Saputra, M.Si.",
      ketuaKelompok: "Farhan Ardiansyah",
      daftarProker: [...SAMPLE_PROKERS],
    });
    setRabItems([...SAMPLE_RAB_ITEMS]);
    setLuaranItems([...SAMPLE_LUARAN_WAJIB]);
    toast.success("Data percontohan KKN berhasil dimuat!");
  };

  const handleResetKknForm = () => {
    setTeamData({
      namaDesa: "",
      kecamatanKabupaten: "",
      namaUnit: "",
      dplNama: "",
      ketuaKelompok: "",
      daftarProker: [],
    });
    setRabItems([]);
    setLuaranItems(DEFAULT_LUARAN_WAJIB_CLEAN);
    toast.info("Formulir tim KKN telah dikosongkan.");
  };

  // Kalkulasi Ringkasan Keuangan RAB
  const financialSummary = useMemo(
    () => computeFinancialSummary(rabItems),
    [rabItems]
  );

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
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs text-zinc-400 font-medium">
                Manajemen Program Kerja, RAB Keuangan &amp; Luaran Wajib LPPM
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadSampleKknData}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800/90 hover:bg-zinc-700 hover:text-white text-[11px] font-medium text-zinc-300 transition cursor-pointer"
                  title="Muat data percontohan KKN"
                >
                  <span>🧪 Muat Data Contoh KKN</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetKknForm}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800/90 hover:bg-rose-950/40 hover:border-rose-800 hover:text-rose-300 text-[11px] font-medium text-zinc-300 transition cursor-pointer"
                  title="Kosongkan seluruh isian formulir KKN"
                >
                  <span>🗑️ Kosongkan Formulir</span>
                </button>
              </div>
            </div>
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
                {teamData.daftarProker.length} Proker
              </div>
              <div className="text-[11px] text-zinc-400">Total Proker</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700/80">
              <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                {financialSummary.serapanPersen}% Serapan
              </div>
              <div className="text-[11px] text-zinc-400">Serapan RAB</div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/90 border border-zinc-700/80">
              <div className="text-lg font-bold font-mono tabular-nums text-white">
                {completedLuaranCount}/{luaranItems.length} Luaran
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
              placeholder="Contoh: Desa Sumbermulyo, Kec. Bambanglipuro, Kab. Bantul"
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
              placeholder="Contoh: Unit KKN-PPM 04 Sub-Unit 1"
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
              placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: DAFTAR PROGRAM KERJA */}
      {subTab === "proker" && <KknProkerSection handleAddProker={handleAddProker} handleDeleteProker={handleDeleteProker} newProker={newProker} onConvertToDailyLogbook={onConvertToDailyLogbook} setNewProker={setNewProker} setShowAddForm={setShowAddForm} showAddForm={showAddForm} teamData={teamData} />}

      {/* SUB-TAB 2: RAB & LPJ KEUANGAN DESA */}
      {subTab === "rab" && <KknRabSection financialSummary={financialSummary} handleAddRabItem={handleAddRabItem} handleDeleteRabItem={handleDeleteRabItem} handleExportLpjCsv={handleExportLpjCsv} newRab={newRab} rabItems={rabItems} setNewRab={setNewRab} setShowAddRab={setShowAddRab} showAddRab={showAddRab} teamData={teamData} />}

      {/* SUB-TAB 3: CHECKLIST LUARAN WAJIB LPPM & SINTA */}
      {subTab === "luaran" && <KknLuaranSection completedLuaranCount={completedLuaranCount} luaranItems={luaranItems} setLuaranItems={setLuaranItems} />}

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
