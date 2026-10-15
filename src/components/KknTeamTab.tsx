"use client";

import React, { useState } from "react";
import {
  Users,
  Tent,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  AlertCircle,
  Clock,
  Layers,
  MapPin,
  FileText,
} from "lucide-react";
import { KknProkerItem, KknTeamData } from "@/src/lib/types/modules";

const INITIAL_PROKERS: KknProkerItem[] = [
  {
    id: "p1",
    namaProker: "Sosialisasi Sanitasi & Pemilahan Sampah Rumah Tangga",
    divisi: "Kesehatan & Sanitasi",
    sasaranWarga: "60 Ibu-Ibu PKK & Kader Posyandu RW 03",
    status: "Selesai 100%",
    capaianDanOutput: "Pemasangan 10 unit tempat sampah pilah organik-anorganik dan booklet edukasi pencegahan DBD.",
    penanggungJawab: "Ahmad & Siti",
  },
  {
    id: "p2",
    namaProker: "Bimbel Ceria & Pojok Baca Digital Anak Desa",
    divisi: "Pendidikan & Literasi",
    sasaranWarga: "45 Siswa SDN 01 Sukamaju (Kelas 4-6)",
    status: "Selesai 100%",
    capaianDanOutput: "Pengadaan 120 buku bacaan hibah, 8 sesi pendampingan calistung, dan pelatihan dasar komputer.",
    penanggungJawab: "Nadia & Rizky",
  },
  {
    id: "p3",
    namaProker: "Digitalisasi Pemasaran & Foto Produk UMKM Keripik Singkong",
    divisi: "Ekonomi Kreatif & UMKM",
    sasaranWarga: "8 Pelaku UMKM Makanan Olahan Dusun 2",
    status: "Sedang Berjalan 75%",
    capaianDanOutput: "Pembuatan akun Google Maps Business, desain label stiker kemasan baru, dan onboarding Shopee/Tokopedia.",
    penanggungJawab: "Budi & Maya",
  },
  {
    id: "p4",
    namaProker: "Pemasangan Plang Petunjuk Arah & Lampu Penerangan Jalan",
    divisi: "Infrastruktur & Lingkungan",
    sasaranWarga: "Masyarakat Umum Dusun 1 & Dusun 3",
    status: "Sedang Berjalan 75%",
    capaianDanOutput: "Terpasang 14 plang penunjuk jalan reflektif dan pembersihan saluran drainase sepanjang 300 meter.",
    penanggungJawab: "Dimas & Tim",
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

  const handleAddProker = () => {
    if (!newProker.namaProker?.trim()) return;

    const item: KknProkerItem = {
      id: `p-${Date.now()}`,
      namaProker: newProker.namaProker.trim(),
      divisi: newProker.divisi || "Kesehatan & Sanitasi",
      sasaranWarga: newProker.sasaranWarga?.trim() || "Warga Desa",
      status: (newProker.status as any) || "Sedang Berjalan 75%",
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
  };

  const handleDeleteProker = (id: string) => {
    setTeamData((prev) => ({
      ...prev,
      daftarProker: prev.daftarProker.filter((p) => p.id !== id),
    }));
  };

  const handleGenerateCollectiveReport = () => {
    const total = teamData.daftarProker.length;
    const selesai = teamData.daftarProker.filter((p) => p.status === "Selesai 100%").length;
    const persentase = total > 0 ? Math.round((selesai / total) * 100) : 0;

    const report = `# BUKU LAPORAN KOLEKTIF PROGRAM KERJA KKN
**Lokasi Pengabdian:** ${teamData.namaDesa}
**Nama Unit/Kelompok:** ${teamData.namaUnit}
**Dosen Pembimbing Lapangan (DPL):** ${teamData.dplNama}
**Ketua Kelompok:** ${teamData.ketuaKelompok}
**Tingkat Keberhasilan Program:** ${selesai}/${total} Proker Tuntas (${persentase}%)

---

### BAB I: GAMBARAN UMUM LOKASI & FOKUS PENGABDIAN
Pelaksanaan Kuliah Kerja Nyata (KKN) oleh ${teamData.namaUnit} bertempat di ${teamData.namaDesa}. Program kerja dirancang secara partisipatif bersama perangkat desa dan tokoh masyarakat setempat, dengan menitikberatkan pada aspek kesehatan lingkungan, peningkatan literasi generasi muda, infrastruktur penunjang, dan pemberdayaan ekonomi lokal.

---

### BAB II: STRUKTUR PROGRAM & PEMBAGIAN DIVISI
Kelompok kerja dibagi menjadi beberapa divisi multidisipliner untuk memastikan implementasi yang efektif dan akuntabel di bawah koordinasi ${teamData.ketuaKelompok} dan bimbingan ${teamData.dplNama}.

---

### BAB III: MATRIKS REKAPITULASI CAPAIAN PROGRAM KERJA
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

### BAB IV: EVALUASI HAMBATAN LAPANGAN & MITIGASI
1. **Faktor Cuaca & Mobilitas:** Koordinasi kegiatan luar ruang dialihkan ke balai warga saat hujan deras terjadi.
2. **Penyesuaian Jadwal Warga:** Sosialisasi dan edukasi diselenggarakan pada sore hari selepas jam kerja tani/kebun warga agar partisipasi optimal.
3. **Penerimaan Masyarakat:** Pendekatan persuasif melalui silaturahmi dengan RT/RW dan tokoh agama setempat berhasil meningkatkan antusiasme warga.

---

### BAB V: REKOMENDASI RENCANA KEBERLANJUTAN (POST-KKN)
1. Penyerahan modul operasional dan panduan pengelolaan bank sampah kepada pengurus Karang Taruna Desa.
2. Koordinasi dengan pihak sekolah dasar untuk melanjutkan jadwal piket Pojok Baca secara mandiri.
3. Pendampingan berkala melalui grup komunikasi digital bagi pelaku UMKM desa binaan.`;

    setReportResult(report);
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
    link.setAttribute("download", `Laporan_Kolektif_KKN_${teamData.namaUnit.replace(/\s+/g, "_")}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Tent className="w-60 h-60" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Manajemen Program Kerja Tim KKN & Laporan Kolektif</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Kolaborasi Tim KKN Desa
          </h2>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 leading-relaxed">
            Kelola seluruh program kerja (proker) kelompok desa Anda di satu tempat. Rekap status capaian tiap divisi dan susun draf resmi "Buku Laporan Kolektif KKN" untuk diserahkan ke DPL dan Kepala Desa dalam 1 klik!
          </p>
        </div>
      </div>

      {/* Profil Tim & Lokasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Profil Lokasi & Kepengurusan Tim KKN</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Desa & Lokasi:
            </label>
            <input
              type="text"
              value={teamData.namaDesa}
              onChange={(e) => setTeamData({ ...teamData, namaDesa: e.target.value })}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nama Unit / Kelompok:
            </label>
            <input
              type="text"
              value={teamData.namaUnit}
              onChange={(e) => setTeamData({ ...teamData, namaUnit: e.target.value })}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Dosen Pembimbing Lapangan (DPL):
            </label>
            <input
              type="text"
              value={teamData.dplNama}
              onChange={(e) => setTeamData({ ...teamData, dplNama: e.target.value })}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Daftar Program Kerja */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Daftar Program Kerja Kelompok ({teamData.daftarProker.length} Proker)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pantau progres divisi kesehatan, pendidikan, infrastruktur, dan ekonomi kreatif.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Proker Baru</span>
          </button>
        </div>

        {/* Form Tambah Proker Baru */}
        {showAddForm && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Input Program Kerja Baru
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Program Kerja:
                </label>
                <input
                  type="text"
                  value={newProker.namaProker}
                  onChange={(e) => setNewProker({ ...newProker, namaProker: e.target.value })}
                  placeholder="misal: Pelatihan Pemasaran Digital UMKM Desa"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Divisi / Bidang:
                </label>
                <select
                  value={newProker.divisi}
                  onChange={(e) => setNewProker({ ...newProker, divisi: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Kesehatan & Sanitasi">Kesehatan & Sanitasi</option>
                  <option value="Pendidikan & Literasi">Pendidikan & Literasi</option>
                  <option value="Infrastruktur & Lingkungan">Infrastruktur & Lingkungan</option>
                  <option value="Ekonomi Kreatif & UMKM">Ekonomi Kreatif & UMKM</option>
                  <option value="Teknologi & Informasi">Teknologi & Informasi</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sasaran Warga / Mitra:
                </label>
                <input
                  type="text"
                  value={newProker.sasaranWarga}
                  onChange={(e) => setNewProker({ ...newProker, sasaranWarga: e.target.value })}
                  placeholder="misal: 40 Petani Kopi Dusun 1"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status Capaian:
                </label>
                <select
                  value={newProker.status}
                  onChange={(e) => setNewProker({ ...newProker, status: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Selesai 100%">Selesai 100%</option>
                  <option value="Sedang Berjalan 75%">Sedang Berjalan 75%</option>
                  <option value="Tahap Persiapan 30%">Tahap Persiapan 30%</option>
                  <option value="Terkendala">Terkendala</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deskripsi Capaian & Output Nyata:
                </label>
                <textarea
                  rows={2}
                  value={newProker.capaianDanOutput}
                  onChange={(e) =>
                    setNewProker({ ...newProker, capaianDanOutput: e.target.value })
                  }
                  placeholder="Tuliskan luaran nyata (misal: pengadaan alat, modul panduan, sertifikat pelatihan)..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddProker}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
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
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs text-slate-400">#{idx + 1}</span>
                  <span className="text-xs font-bold text-slate-900">{p.namaProker}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {p.divisi}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.status === "Selesai 100%"
                        ? "bg-emerald-500 text-white"
                        : p.status === "Terkendala"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">Sasaran:</strong> {p.sasaranWarga} |{" "}
                  <strong className="text-slate-700">PJ:</strong> {p.penanggungJawab}
                </p>
                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-200/60">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition shadow-2xs cursor-pointer"
                  title="Jadikan Proker ini sebagai catatan Logbook Harian"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>➕ Jadikan Logbook Harian</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteProker(p.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus proker"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Report Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerateCollectiveReport}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            <span>📘 Susun Draf Buku Laporan Kolektif KKN</span>
          </button>
        </div>
      </div>

      {/* Report Result View */}
      {reportResult && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                DRAF BUKU LAPORAN TIM KKN
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Laporan Pertanggungjawaban Program Kerja Kolektif
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Laporan</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadReportTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Teks</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm leading-relaxed text-slate-800 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {reportResult}
          </div>
        </div>
      )}
    </div>
  );
};
