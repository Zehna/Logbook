import React from "react";
import {
  FileText,
  Download,
  GraduationCap,
  Copy,
  Check,
} from "lucide-react";

interface AdminDocsJurnalSectionProps {
  capaianKuantitatif: string;
  copiedJurnal: boolean;
  handleCopyJurnal: () => Promise<void>;
  handleDownloadJurnalTxt: () => void;
  imradManuscript: string;
  judulJurnal: string;
  kataKunci: string;
  masalahMitra: string;
  setCapaianKuantitatif: React.Dispatch<React.SetStateAction<string>>;
  setJudulJurnal: React.Dispatch<React.SetStateAction<string>>;
  setKataKunci: React.Dispatch<React.SetStateAction<string>>;
  setMasalahMitra: React.Dispatch<React.SetStateAction<string>>;
  setSkemaJurnal: React.Dispatch<React.SetStateAction<"pengabdian" | "terapan">>;
  setSolusiInovasi: React.Dispatch<React.SetStateAction<string>>;
  skemaJurnal: "pengabdian" | "terapan";
  solusiInovasi: string;
  totalWeightedScore: number;
}

export function AdminDocsJurnalSection({ capaianKuantitatif, copiedJurnal, handleCopyJurnal, handleDownloadJurnalTxt, imradManuscript, judulJurnal, kataKunci, masalahMitra, setCapaianKuantitatif, setJudulJurnal, setKataKunci, setMasalahMitra, setSkemaJurnal, setSolusiInovasi, skemaJurnal, solusiInovasi, totalWeightedScore }: AdminDocsJurnalSectionProps) {
  return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Parameter Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Parameter Naskah Publikasi IMRAD
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sesuaikan parameter riset/pengabdian di bawah ini. Naskah lengkap (Abstrak ID/EN, Pendahuluan, Metode, Hasil, Kesimpulan) disusun otomatis.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Skema Template Jurnal Sasaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSkemaJurnal("terapan")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    skemaJurnal === "terapan"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Jurnal Riset Terapan / KP
                </button>
                <button
                  type="button"
                  onClick={() => setSkemaJurnal("pengabdian")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    skemaJurnal === "pengabdian"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  Jurnal Pengabdian (PKM SINTA)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Artikel Ilmiah
              </label>
              <textarea
                rows={2}
                value={judulJurnal}
                onChange={(e) => setJudulJurnal(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Kunci (Keywords — pisahkan dengan koma)
              </label>
              <input
                type="text"
                value={kataKunci}
                onChange={(e) => setKataKunci(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Permasalahan Utama Mitra / Objek Studi
              </label>
              <textarea
                rows={3}
                value={masalahMitra}
                onChange={(e) => setMasalahMitra(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Metode Solusi / Inovasi yang Diterapkan
              </label>
              <textarea
                rows={3}
                value={solusiInovasi}
                onChange={(e) => setSolusiInovasi(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hasil & Capaian Kuantitatif (Before-After)
              </label>
              <textarea
                rows={3}
                value={capaianKuantitatif}
                onChange={(e) => setCapaianKuantitatif(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Right Live IMRAD Manuscript Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Pratinjau Manuskrip IMRAD (Siap Submit OJS / SINTA)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Terintegrasi otomatis dengan skor evaluasi mitra ({totalWeightedScore}/100) dan identitas DPL.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJurnal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
                >
                  {copiedJurnal ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{copiedJurnal ? "Tersalin" : "Salin Naskah"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJurnalTxt}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Draf (.txt)</span>
                </button>
              </div>
            </div>

            <pre className="w-full h-[540px] overflow-y-auto p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-800">
              {imradManuscript}
            </pre>
          </div>
        </div>
  );
}
