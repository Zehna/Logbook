import React from "react";
import {
  StudentProfile,
} from "@/src/lib/exporters/types";
import type { CompetencyAnalytics } from "@/src/lib/utils/calendarData";

interface CompetencyTabSectionProps {
  competencyAnalytics: CompetencyAnalytics;
  studentProfile: StudentProfile;
}

export function CompetencyTabSection({ competencyAnalytics, studentProfile }: CompetencyTabSectionProps) {
  return (
            <div className="space-y-5">
              {/* Top Metric Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">Total Entri Dianalisis</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {competencyAnalytics.totalEntries} Entri
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">C3–C4 (Eksekusi &amp; Analisis)</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {competencyAnalytics.bloomCounts.c3 + competencyAnalytics.bloomCounts.c4} Kali
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">C5–C6 (Evaluasi &amp; Sintesis)</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {competencyAnalytics.bloomCounts.c5 + competencyAnalytics.bloomCounts.c6} Kali
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">Status E-Paraf Dokumen</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                    {studentProfile.ttdMahasiswaBase64 && studentProfile.ttdMentorBase64
                      ? "Lengkap (2/2 Aktif)"
                      : studentProfile.ttdMahasiswaBase64 || studentProfile.ttdMentorBase64
                      ? "Sebagian (1/2 Aktif)"
                      : "Belum Diatur"}
                  </p>
                </div>
              </div>

              {/* Competency Distribution Bars */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 bg-white dark:bg-zinc-900/50 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Matriks Distribusi Kompetensi Capaian Pembelajaran (OBE &amp; Kampus Merdeka)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Diekstraksi secara otomatis dari deskripsi kegiatan, kompetensi, kendala, dan solusi pada riwayat logbook Anda.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {competencyAnalytics.domainScores.map((dom) => (
                    <div key={dom.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {dom.label}
                        </span>
                        <span className="font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                          {dom.count} entri ({dom.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, dom.percentage)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {dom.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {competencyAnalytics.weakestDomain && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Rekomendasi Peningkatan Laporan Akhir:{" "}
                      </span>
                      Perbanyak narasi pada aspek{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {competencyAnalytics.weakestDomain.label}
                      </strong>{" "}
                      agar matriks konversi 20 SKS Anda lebih seimbang.
                    </div>
                  </div>
                )}
              </div>
            </div>
  );
}
