"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Sparkles,
  Loader2,
  FileText,
  Printer,
  Download,
} from "lucide-react";
import { ResumeGeneratorResponse, ResumeBulletItem } from "@/src/lib/types/modules";
import { StudentProfile } from "@/src/lib/exporters/types";
import {
  exportAtsResumeToDocx,
  AtsResumeData,
} from "@/src/lib/exporters/exportAtsResumeDocx";
import { AtsResumeInputConfig } from "./AtsResumeInputConfig";
import { AtsResumeAnalysisView } from "./AtsResumeAnalysisView";
import { AtsResumePreview } from "./AtsResumePreview";
import { getIdbItem, setIdbItem, IDB_KEYS } from "@/src/lib/storage/indexedDbStore";

interface AtsResumeTabProps {
  tipeKegiatan: string;
  peran: string;
  riwayatLogbookText: string;
  studentProfile?: Partial<StudentProfile>;
}

export const AtsResumeTab: React.FC<AtsResumeTabProps> = ({
  tipeKegiatan,
  peran,
  riwayatLogbookText,
  studentProfile,
}) => {
  const [targetRole, setTargetRole] = useState(peran);
  const [activityContext, setActivityContext] = useState(riwayatLogbookText);
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeGeneratorResponse | null>(null);

  const [activeView, setActiveView] = useState<"analysis" | "preview">("analysis");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // State untuk Live Editable Harvard Resume A4
  const [editableName, setEditableName] = useState(
    studentProfile?.namaMahasiswa || "NAMA LENGKAP MAHASISWA"
  );
  const [editableEmail, setEditableEmail] = useState("mahasiswa@alumni.ac.id");
  const [editablePhone, setEditablePhone] = useState("+62 812-3456-7890");
  const [editableLocation, setEditableLocation] = useState("Jakarta, Indonesia");
  const [editableLinkedIn, setEditableLinkedIn] = useState("linkedin.com/in/profil-mahasiswa");
  const [editableSummary, setEditableSummary] = useState("");
  const [editableMitra, setEditableMitra] = useState(
    studentProfile?.namaMitra || "PT Mitra Inovasi Industri"
  );
  const [editablePeriode, setEditablePeriode] = useState(
    studentProfile?.periodeKegiatan || "Semester Genap 2026"
  );
  const [editableBullets, setEditableBullets] = useState<string[]>([]);
  const [editableHardSkills, setEditableHardSkills] = useState(
    "Data Analysis, Project Coordination, Technical Documentation, Quality Assurance"
  );
  const [editableTools, setEditableTools] = useState(
    "Microsoft Excel, Google Workspace, Git, Figma, SQL, Notion"
  );
  const [editableSoftSkills, setEditableSoftSkills] = useState(
    "Problem Solving, Cross-functional Communication, Critical Thinking, Time Management"
  );
  const [editableUniv, setEditableUniv] = useState(
    studentProfile?.perguruanTinggi || "Universitas Terkemuka Indonesia"
  );
  const [editableProdi, setEditableProdi] = useState(
    studentProfile?.programStudi || "S1 Ilmu Komputer / Teknik"
  );
  const [editableTahun, setEditableTahun] = useState("2022 - 2026 (Expected)");
  const [editableIpk, setEditableIpk] = useState("3.85 / 4.00");

  useEffect(() => {
    if (!activityContext && riwayatLogbookText) {
      setActivityContext(riwayatLogbookText);
    }
  }, [riwayatLogbookText, activityContext]);

  // Muat data CV tersimpan dari IndexedDB
  useEffect(() => {
    getIdbItem<ResumeGeneratorResponse>(IDB_KEYS.ATS_RESUME).then((saved) => {
      if (saved) {
        setResult(saved);
        syncFromGeneratorResult(saved);
      }
    });
  }, []);

  const syncFromGeneratorResult = (res: ResumeGeneratorResponse) => {
    const bullets = res.resumeBullets.map((b) => b.bulletText);
    setEditableBullets(bullets);

    // Otomatis susun summary awal berbasis target role & mitra
    setEditableSummary(
      `Results-driven ${res.targetRole} with hands-on experience executing operational milestones and data-driven initiatives during ${tipeKegiatan} at ${
        studentProfile?.namaMitra || "Partner Company"
      }. Proficient in problem solving, structured documentation, and cross-functional team collaboration.`
    );

    // Kategorikan skills
    const hard = res.topSkills
      .filter((s) => s.category === "Hard Skill")
      .map((s) => s.name);
    const tools = res.topSkills
      .filter((s) => s.category === "Tools & Teknologi")
      .map((s) => s.name);
    const soft = res.topSkills
      .filter((s) => s.category === "Soft Skill")
      .map((s) => s.name);

    if (hard.length > 0) setEditableHardSkills(hard.join(", "));
    if (tools.length > 0) setEditableTools(tools.join(", "));
    if (soft.length > 0) setEditableSoftSkills(soft.join(", "));
  };

  const handleFillSampleActivity = () => {
    setActivityContext(
      "1. Memimpin tim 4 developer dalam pengembangan modul autentikasi dan otorisasi multi-role untuk platform web enterprise, mengurangi waktu response login sebesar 35%.\n2. Mengintegrasikan Payment Gateway pihak ketiga dengan webhook otomatis, memproses lebih dari 1.200 transaksi pengujian tanpa kendala fatal.\n3. Melakukan refaktorisasi 15 komponen UI kompleks ke format reusable design system berbasis Tailwind CSS dan React, meningkatkan konsistensi UX produk.\n4. Menyusun 25+ test case end-to-end dan unit test dengan coverage 85% untuk mencegah regresi sistem pada rilis produksi mingguan."
    );
  };

  const handleGenerate = async () => {
    if (!activityContext.trim()) {
      setErrorMsg("Mohon sertakan riwayat aktivitas atau logbook kegiatan Anda.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipeKegiatan,
          peran,
          targetPosisi: targetRole,
          riwayatKegiatan: activityContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan resume ATS & LinkedIn.");
      }

      setResult(data.data);
      syncFromGeneratorResult(data.data);
      await setIdbItem(IDB_KEYS.ATS_RESUME, data.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAllBullets = () => {
    if (!result) return;
    const bulletsText = (editableBullets.length > 0 ? editableBullets : result.resumeBullets.map(b => b.bulletText))
      .map((b) => `• ${b}`)
      .join("\n\n");
    copyToClipboard(bulletsText, "all-bullets");
  };

  const handleCopyLinkedIn = () => {
    if (!result) return;
    copyToClipboard(result.linkedInPost.fullText, "linkedin");
  };

  const handleCopySkills = () => {
    if (!result) return;
    const skillsText = result.topSkills
      .map((s) => `${s.name} (${s.category}) - ${s.relevance}`)
      .join("\n");
    copyToClipboard(skillsText, "skills");
  };

  // Handler Unduh Word ATS (.docx)
  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const resumeData: AtsResumeData = {
        namaMahasiswa: editableName,
        email: editableEmail,
        telepon: editablePhone,
        lokasi: editableLocation,
        linkedInUrl: editableLinkedIn,
        targetRole: targetRole || peran,
        summary: editableSummary,
        mitraPerusahaan: editableMitra,
        periodeKerja: editablePeriode,
        bulletPoints: editableBullets,
        skillsByCategory: {
          hardSkills: editableHardSkills.split(",").map((s) => s.trim()).filter(Boolean),
          toolsAndTech: editableTools.split(",").map((s) => s.trim()).filter(Boolean),
          softSkills: editableSoftSkills.split(",").map((s) => s.trim()).filter(Boolean),
        },
        pendidikan: {
          perguruanTinggi: editableUniv,
          programStudi: editableProdi,
          tahun: editableTahun,
          ipk: editableIpk,
        },
      };

      await exportAtsResumeToDocx(resumeData);
      toast.success("CV ATS-Friendly (.docx) berhasil diunduh!");
    } catch (err) {
      console.error("Gagal ekspor CV Word ATS:", err);
      toast.error("Gagal mengunduh dokumen CV ATS Word. Silakan coba lagi.");
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Handler Cetak / Simpan PDF
  const handlePrintPdf = () => {
    window.print();
  };

  const handleAddBullet = () => {
    setEditableBullets((prev) => [
      ...prev,
      "Spearheaded daily operational workflows, enhancing process efficiency by 25% through methodical problem-solving and collaboration.",
    ]);
  };

  const handleRemoveBullet = (index: number) => {
    setEditableBullets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBullet = (index: number, val: string) => {
    setEditableBullets((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Print CSS Injector */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #harvard-cv-print-area,
          #harvard-cv-print-area * {
            visibility: visible !important;
          }
          #harvard-cv-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Banner Header */}
      <div className="no-print bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Briefcase className="w-60 h-60" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Harvard Format STAR Method & Live Editable ATS CV</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Logbook to CV ATS & Personal Branding
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Ubah catatan magang Anda menjadi bullet points resume berstandar Harvard dengan metrik kuantitatif terukur. Lengkap dengan pratinjau lembar A4 live-editable yang siap diunduh ke Word (.docx) atau dicetak ke PDF!
          </p>
        </div>
      </div>

      <AtsResumeInputConfig
        peran={peran}
        tipeKegiatan={tipeKegiatan}
        targetRole={targetRole}
        onTargetRoleChange={setTargetRole}
        activityContext={activityContext}
        onActivityContextChange={setActivityContext}
        isLoading={isLoading}
        errorMsg={errorMsg}
        onFillSample={handleFillSampleActivity}
        onGenerate={handleGenerate}
      />

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* View Mode Toggle & Export Toolbar */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveView("analysis")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeView === "analysis"
                    ? "bg-white dark:bg-zinc-700 text-blue-700 dark:text-blue-300 shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisis STAR & LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeView === "preview"
                    ? "bg-white dark:bg-zinc-700 text-indigo-700 dark:text-indigo-300 shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>📄 Pratinjau Lembar Harvard ATS (A4)</span>
              </button>
            </div>

            {/* Tombol Aksi Ekspor */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleExportDocx}
                disabled={isExportingDocx}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-60"
              >
                {isExportingDocx ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>Unduh Word (.docx)</span>
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: BREAKDOWN STAR METHOD & LINKEDIN STORYTELLING */}
          {activeView === "analysis" && (
            <AtsResumeAnalysisView
              result={result}
              targetRole={targetRole}
              copiedSection={copiedSection}
              onCopySection={copyToClipboard}
              onCopyAllBullets={handleCopyAllBullets}
              onCopyLinkedIn={handleCopyLinkedIn}
              onCopySkills={handleCopySkills}
            />
          )}

          {/* VIEW 2: LIVE EDITABLE HARVARD ATS RESUME PREVIEW (A4 SHEET) */}
          {activeView === "preview" && (
            <AtsResumePreview
              data={{
                name: editableName,
                email: editableEmail,
                phone: editablePhone,
                location: editableLocation,
                linkedIn: editableLinkedIn,
                summary: editableSummary,
                mitra: editableMitra,
                periode: editablePeriode,
                bullets: editableBullets,
                hardSkills: editableHardSkills,
                tools: editableTools,
                softSkills: editableSoftSkills,
                univ: editableUniv,
                prodi: editableProdi,
                tahun: editableTahun,
                ipk: editableIpk,
              }}
              onDataChange={(patch) => {
                if (patch.name !== undefined) setEditableName(patch.name);
                if (patch.email !== undefined) setEditableEmail(patch.email);
                if (patch.phone !== undefined) setEditablePhone(patch.phone);
                if (patch.location !== undefined) setEditableLocation(patch.location);
                if (patch.linkedIn !== undefined) setEditableLinkedIn(patch.linkedIn);
                if (patch.summary !== undefined) setEditableSummary(patch.summary);
                if (patch.mitra !== undefined) setEditableMitra(patch.mitra);
                if (patch.periode !== undefined) setEditablePeriode(patch.periode);
                if (patch.bullets !== undefined) setEditableBullets(patch.bullets);
                if (patch.hardSkills !== undefined) setEditableHardSkills(patch.hardSkills);
                if (patch.tools !== undefined) setEditableTools(patch.tools);
                if (patch.softSkills !== undefined) setEditableSoftSkills(patch.softSkills);
                if (patch.univ !== undefined) setEditableUniv(patch.univ);
                if (patch.prodi !== undefined) setEditableProdi(patch.prodi);
                if (patch.tahun !== undefined) setEditableTahun(patch.tahun);
                if (patch.ipk !== undefined) setEditableIpk(patch.ipk);
              }}
              targetRole={targetRole}
              onTargetRoleChange={setTargetRole}
              onAddBullet={handleAddBullet}
              onRemoveBullet={handleRemoveBullet}
              onUpdateBullet={handleUpdateBullet}
            />
          )}
        </div>
      )}
    </div>
  );
};
