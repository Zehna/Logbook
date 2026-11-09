import React from "react";
import {
  Upload,
  Download,
  PlusCircle,
} from "lucide-react";
import {
  SAMPLE_CSV_TEMPLATE,
  type ParsedCsvRow,
} from "@/src/lib/types/ingestion";

interface IngestionCsvTabProps {
  csvRawText: string;
  fileCsvInputRef: React.RefObject<HTMLInputElement | null>;
  handleCsvFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadSampleCsv: () => void;
  handleImportAllCsvRows: () => void;
  onApplyNote: (note: string, suggestedRole?: string) => void;
  onClose: () => void;
  parseCsvContent: (raw: string) => void;
  parsedCsvRows: ParsedCsvRow[];
}

export function IngestionCsvTab({ csvRawText, fileCsvInputRef, handleCsvFileUpload, handleDownloadSampleCsv, handleImportAllCsvRows, onApplyNote, onClose, parseCsvContent, parsedCsvRows }: IngestionCsvTabProps) {
  return (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Impor Massal Timesheet CSV / Tabel Aktivitas Harian
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Format Kolom: <code className="font-mono">Tanggal,Peran,Aktivitas,Kompetensi,Kendala,Solusi</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => parseCsvContent(SAMPLE_CSV_TEMPLATE)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    Muat Contoh Data
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template .csv</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileCsvInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File .CSV</span>
                  </button>
                  <input
                    ref={fileCsvInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={handleCsvFileUpload}
                  />
                </div>
              </div>

              <textarea
                rows={4}
                value={csvRawText}
                onChange={(e) => parseCsvContent(e.target.value)}
                placeholder="Tempelkan baris CSV atau TSV dari Excel / Google Sheets di sini, atau klik 'Muat Contoh Data'..."
                className="w-full p-3 text-xs font-mono border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              {parsedCsvRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      Pratinjau Data Terbaca ({parsedCsvRows.length} Baris = +{parsedCsvRows.length * 8} Jam MBKM)
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                          <th className="p-2">Tanggal</th>
                          <th className="p-2">Peran</th>
                          <th className="p-2">Aktivitas Utama</th>
                          <th className="p-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {parsedCsvRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                            <td className="p-2 font-mono whitespace-nowrap text-slate-700 dark:text-zinc-300">
                              {r.tanggal}
                            </td>
                            <td className="p-2 text-slate-600 dark:text-zinc-400">
                              {r.peran}
                            </td>
                            <td className="p-2 text-slate-800 dark:text-zinc-200 line-clamp-1">
                              {r.aktivitas}
                            </td>
                            <td className="p-2 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  onApplyNote(
                                    `${r.aktivitas}. Kompetensi: ${r.kompetensi}. Kendala: ${r.kendala}. Solusi: ${r.solusi}.`,
                                    r.peran
                                  );
                                  onClose();
                                }}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                              >
                                Isi ke Form
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportAllCsvRows}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>
                      Impor Semua ke Riwayat Logbook ({parsedCsvRows.length} Entri • +{parsedCsvRows.length * 8} Jam)
                    </span>
                  </button>
                </div>
              )}
            </div>
  );
}
