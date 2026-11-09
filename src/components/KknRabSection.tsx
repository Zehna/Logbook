import React from "react";
import {
  Plus,
  Trash2,
  Wallet,
  FileSpreadsheet,
} from "lucide-react";
import {
  type KknRabItem,
} from "@/src/lib/data/kknSamples";
import {
  formatRupiah,
  type KknFinancialSummary,
} from "@/src/lib/utils/kknFinance";
import {
  KknTeamData,
} from "@/src/lib/types/modules";

interface KknRabSectionProps {
  financialSummary: KknFinancialSummary;
  handleAddRabItem: () => void;
  handleDeleteRabItem: (id: string) => void;
  handleExportLpjCsv: () => void;
  newRab: Omit<KknRabItem, "id">;
  rabItems: KknRabItem[];
  setNewRab: React.Dispatch<React.SetStateAction<Omit<KknRabItem, "id">>>;
  setShowAddRab: React.Dispatch<React.SetStateAction<boolean>>;
  showAddRab: boolean;
  teamData: KknTeamData;
}

export function KknRabSection({ financialSummary, handleAddRabItem, handleDeleteRabItem, handleExportLpjCsv, newRab, rabItems, setNewRab, setShowAddRab, showAddRab, teamData }: KknRabSectionProps) {
  return (
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
                    {teamData.daftarProker.length > 0 ? (
                      teamData.daftarProker.map((p) => (
                        <option key={p.id} value={p.namaProker}>
                          {p.namaProker}
                        </option>
                      ))
                    ) : (
                      <option value="Umum / Operasional Unit">Umum / Operasional Unit</option>
                    )}
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
                {rabItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                      Belum ada rincian RAB pengeluaran. Klik tombol &quot;+ Tambah Item RAB&quot; untuk mencatat keuangan kelompok.
                    </td>
                  </tr>
                ) : (
                  rabItems.map((r) => {
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
                }))}
              </tbody>
            </table>
          </div>
        </div>
  );
}
