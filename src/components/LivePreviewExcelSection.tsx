import React from "react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
} from "lucide-react";
import {
  LogbookEntry,
  StudentProfile,
} from "@/src/lib/exporters/types";

interface LivePreviewExcelSectionProps {
  entries: LogbookEntry[];
  isAnyExporting: boolean;
  onExportExcel: () => void;
  studentProfile: StudentProfile;
}

export function LivePreviewExcelSection({ entries, isAnyExporting, onExportExcel, studentProfile }: LivePreviewExcelSectionProps) {
  return (
              <div className="bg-white rounded-lg shadow-md border border-zinc-300 overflow-hidden text-xs font-sans">
                {/* Excel Ribbon Top Bar */}
                <div className="px-4 py-2.5 bg-emerald-700 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span className="font-semibold text-xs tracking-wide">
                      Rekapitulasi_Logbook_{studentProfile.namaMahasiswa.replace(/\s+/g, "_")}.xlsx
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-[11px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-mono">
                      {entries.length} Baris Entri Aktif • 8 Jam/Entri
                    </span>
                    <button
                      type="button"
                      onClick={onExportExcel}
                      disabled={isAnyExporting || entries.length === 0}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* Spreadsheet Table View */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-950 border-b border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                        <th className="p-2.5 border-r border-emerald-200 text-center w-10">No</th>
                        <th className="p-2.5 border-r border-emerald-200 w-28">Tanggal</th>
                        <th className="p-2.5 border-r border-emerald-200 w-32">Peran / Posisi</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[200px]">Deskripsi Aktivitas</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[160px]">Kompetensi</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[140px]">Kendala</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[150px]">Solusi</th>
                        <th className="p-2.5 border-r border-emerald-200 min-w-[150px]">Refleksi</th>
                        <th className="p-2.5 border-r border-emerald-200 text-center w-20">Foto</th>
                        <th className="p-2.5 text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {entries.map((entry, idx) => (
                        <tr
                          key={entry.id || idx}
                          className={`hover:bg-zinc-50 transition-colors ${
                            idx % 2 === 1 ? "bg-zinc-50/50" : "bg-white"
                          }`}
                        >
                          <td className="p-2.5 border-r border-zinc-200 text-center font-mono text-zinc-500">
                            {idx + 1}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 font-semibold text-zinc-900 whitespace-nowrap">
                            {entry.tanggal}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700">
                            {entry.peran}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-800 leading-relaxed">
                            {entry.deskripsiKegiatan}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.kompetensiDikembangkan}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.kendalaDihadapi}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.solusiTindakan}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-zinc-700 leading-relaxed">
                            {entry.refleksiPembelajaran}
                          </td>
                          <td className="p-2.5 border-r border-zinc-200 text-center">
                            {entry.fotoBase64 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Ada
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-400">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                              Valid MBKM
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Excel Summary Footer */}
                <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600">
                  <div className="flex items-center gap-3">
                    <span>
                      Total Akumulasi: <strong>{entries.length * 8} Jam Kerja</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Target 900 Jam: <strong>{Math.min(100, Math.round(((entries.length * 8) / 900) * 100))}%</strong>
                    </span>
                  </div>
                  <div className="text-zinc-500 font-mono">
                    Preset Rumus: SUM(Hours), VLOOKUP(Student_ID)
                  </div>
                </div>
              </div>
  );
}
