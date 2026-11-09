import React from "react";
import {
  ClipboardCheck,
  Download,
  Building2,
  UserCheck,
  Sparkles,
  FileCheck2,
  Briefcase,
  Sliders,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { StudentProfile } from "@/src/lib/exporters/types";
import {
  MentorAdminData,
} from "@/src/lib/exporters/exportAdminDocs";

interface AdminDocsBerkasSectionProps {
  adminData: MentorAdminData;
  downloading: string | null;
  handleExportNilai: () => Promise<void>;
  handleExportRekomendasi: () => Promise<void>;
  handleExportSKSM: () => Promise<void>;
  handleKeteranganChange: (index: number, newKet: string) => void;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveLogo: () => void;
  handleScoreChange: (index: number, newScore: number) => void;
  totalWeightedScore: number;
  updateAdminDataState: (newData: MentorAdminData) => void;
  getPredikat: (score: number) => string;
  profile: StudentProfile;
}

export function AdminDocsBerkasSection({ adminData, downloading, handleExportNilai, handleExportRekomendasi, handleExportSKSM, handleKeteranganChange, handleLogoUpload, handleRemoveLogo, handleScoreChange, totalWeightedScore, updateAdminDataState, getPredikat, profile }: AdminDocsBerkasSectionProps) {
  return (
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
                    placeholder="Nama Pembimbing Lapangan / Atasan Langsung"
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
                    placeholder="Contoh: Project Manager / Koordinator Lapangan"
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
                    placeholder="Contoh: Divisi Operasional & Logistik"
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
                    placeholder="Contoh: SKSM/HRD/XI/2026/042"
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
                    placeholder="Contoh: 14 Oktober 2026"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  Nama mahasiswa ({profile.namaMahasiswa || "—"}), NIM ({profile.nim || "—"}), dan mitra (
                  {profile.namaMitra || "—"}) diambil otomatis dari Profil Mahasiswa.
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
                  placeholder="Tuliskan catatan kualitatif, evaluasi kinerja, etos kerja, dan rekomendasi mentor pembimbing..."
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
  );
}
