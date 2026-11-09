import type { RefObject } from "react";
import { AlertTriangle, Award, Calendar, Check, CheckCircle2, Copy, Download, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MonthlyReportOutput } from "@/src/lib/types/monthlyReport";
import type { StudentProfile } from "@/src/lib/exporters/types";

interface MonthlyResultsSectionProps {
  monthlyResult: MonthlyReportOutput;
  tipeKegiatan: string;
  peran: string;
  studentProfile: StudentProfile;
  copiedMonthlyField: string | null;
  setCopiedMonthlyField: React.Dispatch<React.SetStateAction<string | null>>;
  isExportingMonthlyDocx: boolean;
  onExportMonthlyDocx: () => void;
  resultRef: RefObject<HTMLDivElement | null>;
}

/** Hasil laporan bulanan Monev. Dipindah verbatim dari app/page.tsx. */
export function MonthlyResultsSection({
  monthlyResult,
  tipeKegiatan,
  peran,
  studentProfile,
  copiedMonthlyField,
  setCopiedMonthlyField,
  isExportingMonthlyDocx,
  onExportMonthlyDocx,
  resultRef,
}: MonthlyResultsSectionProps) {
  return (
<section
  ref={resultRef}
  className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5 scroll-mt-16"
>
  {/* Header Hasil Bulanan + Actions */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>{monthlyResult.periodeBulan}</span>
        </span>
        <span className="text-xs text-zinc-500">
          {tipeKegiatan} • {peran.trim() || "Mahasiswa"}
        </span>
      </div>
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
        Hasil Sintesis Laporan Kemajuan Bulanan (Monev)
      </h2>
    </div>

    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={async () => {
          const fullText = [
            `# ${monthlyResult.periodeBulan}`,
            `**Nama Mahasiswa**: ${studentProfile.namaMahasiswa} (${studentProfile.nim})`,
            `**Mitra**: ${studentProfile.namaMitra} | **Program**: ${tipeKegiatan}`,
            `**Peran**: ${peran.trim() || "Peserta"}`,
            "",
            "## 1. Ringkasan Pencapaian IKU (Capaian Pembelajaran)",
            monthlyResult.ringkasanPencapaianIKU,
            "",
            "## 2. Milestone & Progres Proyek Utama",
            monthlyResult.milestoneProyekUtama,
            "",
            "## 3. Evaluasi Hambatan & Solusi Mitigasi",
            monthlyResult.evaluasiHambatanDanSolusi,
            "",
            "## 4. Rencana Kerja Strategis 4 Pekan ke Depan",
            monthlyResult.rencanaEmpatPekanKedepan,
            "",
            "## 5. Refleksi Pembelajaran Bermakna & Saran Kolaborasi",
            monthlyResult.rekomendasiDanRefleksi,
          ].join("\n");
          try {
            await navigator.clipboard.writeText(fullText);
            setCopiedMonthlyField("all");
            setTimeout(() => setCopiedMonthlyField(null), 2000);
            toast.success("Seluruh naskah laporan bulanan tersalin!");
          } catch {
            // ignore
          }
        }}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs"
      >
        {copiedMonthlyField === "all" ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Semua Tersalin!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Salin Semua (MD)</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onExportMonthlyDocx}
        disabled={isExportingMonthlyDocx}
        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs disabled:opacity-50"
      >
        {isExportingMonthlyDocx ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Mengekspor Word...</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Dokumen (.docx)</span>
          </>
        )}
      </button>
    </div>
  </div>

  {/* 5 Kartu Bagian Laporan Bulanan */}
  <div className="space-y-4">
    {[
      {
        id: "iku",
        title: "Ringkasan Pencapaian IKU & Capaian Pembelajaran",
        badge: "Indikator Kinerja Utama (IKU MBKM / CPL Kurikulum OBE)",
        icon: Award,
        content: monthlyResult.ringkasanPencapaianIKU,
      },
      {
        id: "milestone",
        title: "Milestone & Progres Proyek Utama",
        badge: "Deliverables & Progres Kerja Industri",
        icon: CheckCircle2,
        content: monthlyResult.milestoneProyekUtama,
      },
      {
        id: "evaluasi",
        title: "Evaluasi Hambatan, Tantangan, & Solusi Mitigasi",
        badge: "Problem Solving & Kendala Teratasi",
        icon: AlertTriangle,
        content: monthlyResult.evaluasiHambatanDanSolusi,
      },
      {
        id: "rencana",
        title: "Rencana Kerja Strategis & Target 4 Pekan ke Depan",
        badge: "Action Plan & Timeline Kerja Lanjutan",
        icon: Calendar,
        content: monthlyResult.rencanaEmpatPekanKedepan,
      },
      {
        id: "refleksi",
        title: "Refleksi Pembelajaran Bermakna & Evaluasi",
        badge: "Pengembangan Diri & Rekomendasi Sinergi Mitra",
        icon: Lightbulb,
        content: monthlyResult.rekomendasiDanRefleksi,
      },
    ].map((section, idx) => {
      const IconComponent = section.icon;
      const isCopied = copiedMonthlyField === section.id;

      return (
        <div
          key={section.id}
          className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 transition hover:border-zinc-300 dark:hover:border-zinc-700"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200">
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {idx + 1}. {section.title}
                </h3>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                  {section.badge}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(section.content);
                  setCopiedMonthlyField(section.id);
                  setTimeout(() => setCopiedMonthlyField(null), 2000);
                  toast.success(`Bagian ${idx + 1} berhasil disalin!`);
                } catch {
                  // ignore
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer shrink-0"
              title="Salin teks bagian ini"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pl-0 sm:pl-9.5">
            {section.content}
          </p>
        </div>
      );
    })}
  </div>
</section>
  );
}
