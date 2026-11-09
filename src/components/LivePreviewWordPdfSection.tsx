import React from "react";
import {
  FileText,
  Download,
  Image as ImageIcon,
  FileDown,
} from "lucide-react";
import {
  LogbookEntry,
  StudentProfile,
  KampusPreset,
} from "@/src/lib/exporters/types";

interface LivePreviewWordPdfSectionProps {
  currentEntry: LogbookEntry | null;
  currentEntryIndex: number;
  currentPresetInfo: {
    value: KampusPreset;
    label: string;
    badge: string;
    description: string;
  };
  entries: LogbookEntry[];
  handleDownloadPdf: () => Promise<void>;
  isAnyExporting: boolean;
  onExportWord: () => void;
  studentProfile: StudentProfile;
  viewAllEntries: boolean;
  onOpenSignatureModal?: () => void;
  activeFormat: "word" | "pdf" | "excel" | "pptx";
}

export function LivePreviewWordPdfSection({ currentPresetInfo, currentEntry, currentEntryIndex, entries, handleDownloadPdf, isAnyExporting, onExportWord, studentProfile, viewAllEntries, onOpenSignatureModal, activeFormat }: LivePreviewWordPdfSectionProps) {
  return (
              <div className="space-y-6">
                {/* Format Ribbon Bar inside Canvas */}
                <div
                  className={`px-4 py-2 rounded-t-lg flex items-center justify-between text-xs font-sans shadow-xs ${
                    activeFormat === "pdf"
                      ? "bg-rose-700 text-white"
                      : "bg-blue-700 text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {activeFormat === "pdf" ? (
                      <FileDown className="w-4 h-4 text-rose-200" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-200" />
                    )}
                    <span className="font-semibold tracking-wide">
                      {activeFormat === "pdf"
                        ? `Logbook_Resmi_${(studentProfile.namaMahasiswa || "Mahasiswa").replace(/\s+/g, "_")}.pdf`
                        : `Laporan_Logbook_${(studentProfile.namaMahasiswa || "Mahasiswa").replace(/\s+/g, "_")}.docx`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={activeFormat === "pdf" ? handleDownloadPdf : onExportWord}
                    disabled={isAnyExporting || entries.length === 0}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    <span>
                      {activeFormat === "pdf" ? "Unduh PDF (.pdf)" : "Unduh Word (.docx)"}
                    </span>
                  </button>
                </div>

                {(viewAllEntries ? entries : [currentEntry]).map((entry, idx) => {
                  if (!entry) return null;
                  const pageNum = viewAllEntries ? idx + 1 : currentEntryIndex + 1;
                  return (
                    <article
                      key={entry.id || `entry-${idx}`}
                      className="bg-white text-zinc-900 rounded-sm shadow-md border border-zinc-300/80 p-6 sm:p-10 font-serif leading-relaxed text-[13px] sm:text-[14px] min-h-[750px] relative transition-all"
                    >
                      {/* Kop Surat Resmi / Header Dokumen */}
                      <header className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
                        <p className="text-[11px] sm:text-xs font-bold tracking-wider uppercase font-sans text-zinc-700">
                          KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                        </p>
                        <p className="text-[11px] sm:text-xs font-bold tracking-wide uppercase font-sans text-zinc-800">
                          DIREKTORAT JENDERAL PENDIDIKAN TINGGI, RISET, DAN TEKNOLOGI
                        </p>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-zinc-600 font-sans mt-0.5">
                          PROGRAM HAK BELAJAR TIGA SEMESTER DI LUAR PROGRAM STUDI (MBKM / MSIB)
                        </p>
                        <h1 className="text-sm sm:text-base font-extrabold uppercase mt-3 tracking-normal text-zinc-950 font-sans">
                          LEMBAR LOGBOOK AKTIVITAS HARIAN RESMI MAHASISWA
                        </h1>
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                          Format Pedoman: {currentPresetInfo.label} • {currentPresetInfo.badge}
                        </p>
                      </header>

                      {/* Tabel Identitas Mahasiswa & Program */}
                      <section className="mb-6 border border-zinc-300 rounded overflow-hidden font-sans text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
                          <div className="p-3 space-y-1.5 bg-zinc-50/70">
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Nama Mahasiswa</span>
                              <span className="font-semibold text-zinc-900">: {studentProfile.namaMahasiswa || "Mahasiswa Peserta"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">NIM / ID Registrasi</span>
                              <span className="font-mono font-medium text-zinc-900">: {studentProfile.nim || "-"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Program Studi</span>
                              <span className="text-zinc-800">: {studentProfile.programStudi || "-"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Perguruan Tinggi</span>
                              <span className="text-zinc-800">: {studentProfile.perguruanTinggi || "-"}</span>
                            </div>
                          </div>

                          <div className="p-3 space-y-1.5 bg-zinc-50/70">
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Nama Mitra / Instansi</span>
                              <span className="font-semibold text-zinc-900">: {studentProfile.namaMitra || "Mitra Industri"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Mentor / DPL</span>
                              <span className="text-zinc-800">: {studentProfile.namaPembimbing || "Mentor Pembimbing Lapangan"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Tanggal Kegiatan</span>
                              <span className="font-bold text-zinc-950">: {entry.tanggal || "Tanggal Logbook"}</span>
                            </div>
                            <div className="flex">
                              <span className="w-32 text-zinc-500 shrink-0">Peran / Jam Kerja</span>
                              <span className="text-zinc-800">: {entry.peran || "Peserta"} (8 Jam Formal)</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* 5 Bagian Isi Logbook Standar Dikti & OBE */}
                      <div className="space-y-4 mb-8">
                        {/* 1. Deskripsi Pekerjaan */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              1
                            </span>
                            Deskripsi Aktivitas &amp; Pelaksanaan Tugas
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.deskripsiKegiatan || "Tidak ada rincian aktivitas."}
                          </div>
                        </div>

                        {/* 2. Kompetensi Dikembangkan */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              2
                            </span>
                            Kompetensi &amp; Keterampilan yang Dikembangkan
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.kompetensiDikembangkan || "Tidak ada rincian kompetensi."}
                          </div>
                        </div>

                        {/* 3. Kendala Dihadapi */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              3
                            </span>
                            Kendala &amp; Hambatan Lapangan yang Dihadapi
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.kendalaDihadapi || "Tidak ada kendala berarti."}
                          </div>
                        </div>

                        {/* 4. Solusi Tindakan */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              4
                            </span>
                            Solusi Konkret &amp; Langkah Penyelesaian Masalah
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.solusiTindakan || "Tidak ada langkah pemecahan khusus."}
                          </div>
                        </div>

                        {/* 5. Refleksi Pembelajaran */}
                        <div className="space-y-1">
                          <h3 className="font-sans font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-sans">
                              5
                            </span>
                            Refleksi Pembelajaran &amp; Nilai Akademis Mandiri
                          </h3>
                          <div className="pl-6 text-zinc-800 whitespace-pre-line text-justify leading-relaxed">
                            {entry.refleksiPembelajaran || "Tidak ada catatan refleksi."}
                          </div>
                        </div>
                      </div>

                      {/* Bukti Dokumentasi Visual (Multimodal Photo Attachment) */}
                      {entry.fotoBase64 && (
                        <div className="mb-8 p-3 rounded border border-zinc-200 bg-zinc-50/60 font-sans">
                          <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Lampiran Dokumentasi Kegiatan (Bukti Visual Riil)</span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-44 h-32 rounded border border-zinc-300 overflow-hidden shrink-0 bg-white shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={entry.fotoBase64}
                                alt="Dokumentasi Kegiatan"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs text-zinc-600 space-y-1">
                              <p className="font-medium text-zinc-900">
                                Bukti foto kegiatan tanggal {entry.tanggal}
                              </p>
                              <p className="text-[11px] text-zinc-500 leading-normal">
                                Foto ini telah diverifikasi dan disinkronkan ke dalam berkas lampiran resmi dokumen.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lembar Tanda Tangan & Pengesahan Resmi */}
                      <footer className="pt-6 border-t border-zinc-300 font-sans text-xs mt-auto">
                        <div className="grid grid-cols-2 gap-6 text-center">
                          <div className="flex flex-col justify-between min-h-[120px]">
                            <div>
                              <p className="text-zinc-500">Mengetahui &amp; Menyetujui,</p>
                              <p className="font-semibold text-zinc-900">Mentor / Pembimbing Lapangan</p>
                            </div>
                            <div className="my-2 h-14 flex items-center justify-center">
                              {studentProfile.ttdMentorBase64 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={studentProfile.ttdMentorBase64}
                                  alt="E-Paraf Mentor"
                                  className="max-h-14 object-contain"
                                />
                              ) : onOpenSignatureModal ? (
                                <button
                                  type="button"
                                  onClick={onOpenSignatureModal}
                                  className="text-[10px] text-zinc-400 hover:text-zinc-700 border border-dashed border-zinc-300 rounded px-2 py-1 transition cursor-pointer"
                                >
                                  + Bubuhkan E-Paraf Mentor
                                </button>
                              ) : null}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold underline text-zinc-900">
                                ({studentProfile.namaPembimbing || "Nama Mentor / DPL"})
                              </p>
                              <p className="text-[10px] text-zinc-500">NIP / ID Karyawan Mitra</p>
                            </div>
                          </div>

                          <div className="flex flex-col justify-between min-h-[120px]">
                            <div>
                              <p className="text-zinc-500">Kota Kegiatan, {entry.tanggal}</p>
                              <p className="font-semibold text-zinc-900">Mahasiswa Peserta Program</p>
                            </div>
                            <div className="my-2 h-14 flex items-center justify-center">
                              {studentProfile.ttdMahasiswaBase64 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={studentProfile.ttdMahasiswaBase64}
                                  alt="TTD Mahasiswa"
                                  className="max-h-14 object-contain"
                                />
                              ) : onOpenSignatureModal ? (
                                <button
                                  type="button"
                                  onClick={onOpenSignatureModal}
                                  className="text-[10px] text-zinc-400 hover:text-zinc-700 border border-dashed border-zinc-300 rounded px-2 py-1 transition cursor-pointer"
                                >
                                  + Bubuhkan TTD Mahasiswa
                                </button>
                              ) : null}
                            </div>
                            <div className="space-y-0.5">
                              <p className="font-bold underline text-zinc-900">
                                ({studentProfile.namaMahasiswa || "Nama Lengkap Mahasiswa"})
                              </p>
                              <p className="text-[10px] text-zinc-500 font-mono">
                                NIM: {studentProfile.nim || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Page Number Badge */}
                        <div className="text-right text-[10px] text-zinc-400 mt-6 font-mono">
                          Halaman {pageNum} dari {entries.length}
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
  );
}
