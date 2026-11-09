import React from "react";
import {
  Plus,
  Trash2,
  Layers,
  FileText,
  Folder,
} from "lucide-react";
import { KknProkerItem, KknTeamData } from "@/src/lib/types/modules";

interface KknProkerSectionProps {
  handleAddProker: () => void;
  handleDeleteProker: (id: string) => void;
  newProker: Partial<KknProkerItem>;
  setNewProker: React.Dispatch<React.SetStateAction<Partial<KknProkerItem>>>;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
  showAddForm: boolean;
  teamData: KknTeamData;
  onConvertToDailyLogbook?: (proker: KknProkerItem, villageInfo: { namaDesa: string; unit: string }) => void;
}

export function KknProkerSection({ handleAddProker, handleDeleteProker, newProker, setNewProker, setShowAddForm, showAddForm, teamData, onConvertToDailyLogbook }: KknProkerSectionProps) {
  return (
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

          {/* List Card Proker / Clean Empty State */}
          {teamData.daftarProker.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3 bg-slate-50/50 dark:bg-zinc-800/20">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
                <Folder className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                  Belum ada program kerja yang ditambahkan.
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Klik tombol &apos;+ Tambah Proker Baru&apos; untuk mencatat kegiatan tim KKN desa.
                </p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
  );
}
