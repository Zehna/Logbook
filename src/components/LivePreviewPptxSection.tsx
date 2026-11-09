import React from "react";
import {
  LogbookEntry,
  StudentProfile,
} from "@/src/lib/exporters/types";

interface LivePreviewPptxSectionProps {
  currentEntry: LogbookEntry | null;
  currentEntryIndex: number;
  entries: LogbookEntry[];
  studentProfile: StudentProfile;
  viewAllEntries: boolean;
}

export function LivePreviewPptxSection({ currentEntry, currentEntryIndex, entries, studentProfile, viewAllEntries }: LivePreviewPptxSectionProps) {
  return (
              <div className="space-y-6">
                {(viewAllEntries ? entries : [currentEntry]).map((entry, idx) => {
                  if (!entry) return null;
                  return (
                    <div
                      key={entry.id || idx}
                      className="bg-zinc-900 text-white rounded-xl shadow-xl border border-zinc-800 p-6 sm:p-8 aspect-16/10 flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Decorative Background Accent */}
                      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-indigo-600/20 to-purple-600/0 rounded-full blur-2xl pointer-events-none" />

                      {/* Slide Header */}
                      <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4 mb-4 z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                              Slide Pertanggungjawaban Magang
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">
                              {entry.tanggal}
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                            {entry.peran || "Aktivitas Harian Mahasiswa"}
                          </h2>
                          <p className="text-xs text-zinc-400">
                            {studentProfile.namaMahasiswa} • {studentProfile.namaMitra}
                          </p>
                        </div>

                        <span className="text-xs font-mono px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Slide #{viewAllEntries ? idx + 1 : currentEntryIndex + 1}
                        </span>
                      </div>

                      {/* Slide Content Grid: 2 Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto z-10 text-xs">
                        {/* Left Column: Core Activities & Photo */}
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 space-y-1.5">
                            <span className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wider block">
                              📌 Pelaksanaan Tugas &amp; Solusi
                            </span>
                            <p className="text-zinc-200 line-clamp-4 leading-relaxed">
                              {entry.deskripsiKegiatan}
                            </p>
                            {entry.solusiTindakan && (
                              <p className="text-[11px] text-zinc-400 pt-1 border-t border-zinc-700/60 line-clamp-2">
                                <strong className="text-zinc-300">Solusi:</strong> {entry.solusiTindakan}
                              </p>
                            )}
                          </div>

                          {entry.fotoBase64 ? (
                            <div className="h-28 rounded-lg overflow-hidden border border-zinc-700 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={entry.fotoBase64}
                                alt="Dokumentasi Slide"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white">
                                Foto Bukti Riil
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-800 text-zinc-400 text-[11px]">
                              Kompetensi Kunci: {entry.kompetensiDikembangkan || "Analytical Thinking & Problem Solving"}
                            </div>
                          )}
                        </div>

                        {/* Right Column: Outcomes & STAR Reflection */}
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-lg bg-zinc-800/80 border border-zinc-700/80 space-y-1.5">
                            <span className="font-semibold text-emerald-300 text-[11px] uppercase tracking-wider block">
                              🎯 Capaian Kompetensi &amp; Refleksi
                            </span>
                            <p className="text-zinc-200 line-clamp-3 leading-relaxed">
                              {entry.kompetensiDikembangkan}
                            </p>
                            <p className="text-[11px] text-zinc-300 italic pt-1 border-t border-zinc-700/60 line-clamp-2">
                              &ldquo;{entry.refleksiPembelajaran}&rdquo;
                            </p>
                          </div>

                          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-[11px] text-indigo-200 flex items-center justify-between">
                            <span>Status Ujian Sidang DPL</span>
                            <span className="font-bold text-emerald-400">Ready for Defense</span>
                          </div>
                        </div>
                      </div>

                      {/* Slide Footer */}
                      <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between items-center z-10 font-mono">
                        <span>LogMagang OS • Academic Slide Generator</span>
                        <span>{studentProfile.perguruanTinggi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
  );
}
