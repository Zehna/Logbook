import React from "react";
import {
  CheckCircle2,
  Trash2,
  BookOpenCheck,
  Plus,
  Copy,
  Check,
  FileSpreadsheet,
  PenTool,
} from "lucide-react";
import {
  type ConsultationSession,
} from "@/src/lib/data/adminDocsSamples";

interface AdminDocsBimbinganSectionProps {
  approvedSessionsCount: number;
  bimbinganProgressPct: number;
  copiedBimbingan: boolean;
  handleAddSession: () => void;
  handleCopyBimbingan: () => Promise<void>;
  handleDeleteSession: (id: string) => void;
  handleDownloadBimbinganCsv: () => void;
  handleToggleSessionStatus: (id: string) => void;
  minimumTargetSessions: number;
  newCatatan: string;
  newPembimbing: "DPL Kampus" | "Mentor Mitra";
  newTanggal: string;
  newTopik: string;
  sessions: ConsultationSession[];
  setNewCatatan: React.Dispatch<React.SetStateAction<string>>;
  setNewPembimbing: React.Dispatch<React.SetStateAction<"DPL Kampus" | "Mentor Mitra">>;
  setNewTanggal: React.Dispatch<React.SetStateAction<string>>;
  setNewTopik: React.Dispatch<React.SetStateAction<string>>;
}

export function AdminDocsBimbinganSection({ approvedSessionsCount, bimbinganProgressPct, copiedBimbingan, handleAddSession, handleCopyBimbingan, handleDeleteSession, handleDownloadBimbinganCsv, handleToggleSessionStatus, minimumTargetSessions, newCatatan, newPembimbing, newTanggal, newTopik, sessions, setNewCatatan, setNewPembimbing, setNewTanggal, setNewTopik }: AdminDocsBimbinganSectionProps) {
  return (
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
  );
}
