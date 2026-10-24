"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Share2,
  FileText,
  Printer,
  Download,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { ResumeGeneratorResponse, ResumeBulletItem } from "@/src/lib/types/modules";
import { StudentProfile } from "@/src/lib/exporters/types";
import {
  exportAtsResumeToDocx,
  AtsResumeData,
} from "@/src/lib/exporters/exportAtsResumeDocx";
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

      {/* Input Configuration */}
      <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Peran Asal Magang / KKN:
            </label>
            <input
              type="text"
              readOnly
              value={`${peran} (${tipeKegiatan})`}
              className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Posisi Karier Impian:
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="misal: Junior Product Manager, Frontend Developer..."
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Riwayat Logbook / Catatan Kerja yang Dianalisis:
          </label>
          <textarea
            rows={4}
            value={activityContext}
            onChange={(e) => setActivityContext(e.target.value)}
            placeholder="Ketik atau biarkan terisi dari riwayat logbook aplikasi..."
            className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
          />
          <p className="text-xs text-slate-500 mt-1">
            💡 AI akan mengekstrak metrik keberhasilan, instrumen kerja, dan solusi yang pernah Anda terapkan menjadi data resume konkret.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Mentransformasi Logbook ke Standar ATS & LinkedIn...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>🚀 Generate ATS Resume & LinkedIn Story</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* View Mode Toggle & Export Toolbar */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveView("analysis")}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeView === "analysis"
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
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
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
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
            <div className="space-y-6">
              {/* ATS Bullets */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      HARVARD CV FORMAT (STAR METHOD)
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      Bullet Points Pengalaman Kerja ({result.targetRole})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAllBullets}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedSection === "all-bullets" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Tersalin Semua!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-300" />
                        <span>Salin Semua Bullets</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {result.resumeBullets.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                          • {b.bulletText}
                        </p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`• ${b.bulletText}`, `bullet-${idx}`)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shrink-0 cursor-pointer"
                          title="Salin bullet ini"
                        >
                          {copiedSection === `bullet-${idx}` ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block">S (Situation):</span>
                          <span className="text-slate-700">{b.starFramework.situation}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block">T (Task):</span>
                          <span className="text-slate-700">{b.starFramework.task}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="font-bold text-slate-500 block">A (Action):</span>
                          <span className="text-slate-700">{b.starFramework.action}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                          <span className="font-bold text-emerald-700 block">R (Result & Metric):</span>
                          <span className="text-emerald-900 font-semibold">{b.metric}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LinkedIn Storytelling */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                      LINKEDIN STORYTELLING
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      Draf Postingan Reflektif & Personal Branding
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyLinkedIn}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedSection === "linkedin" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Salin Naskah LinkedIn</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                  {result.linkedInPost.fullText}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {result.linkedInPost.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Skills */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Top 5 Skills untuk Profil LinkedIn
                    </h3>
                    <p className="text-xs text-slate-500">
                      Diverifikasi langsung berdasarkan rekaman aktivitas logbook Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySkills}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copiedSection === "skills" ? (
                      <span className="text-emerald-600 font-bold">Tersalin!</span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Daftar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.topSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{sk.name}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {sk.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {sk.relevance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: LIVE EDITABLE HARVARD ATS RESUME PREVIEW (A4 SHEET) */}
          {activeView === "preview" && (
            <div className="space-y-4">
              <div className="no-print p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>Mode Live Editing Aktif:</strong> Anda dapat mengedit langsung nama, kontak, ringkasan, dan poin peluru (bullet) di lembar kertas di bawah ini sebelum mengunduh.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddBullet}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Poin STAR</span>
                </button>
              </div>

              {/* LEMBAR KERTAS A4 HARVARD CV */}
              <div
                id="harvard-cv-print-area"
                className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-slate-300 text-slate-900 font-serif leading-normal transition-all"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                {/* 1. Header Identitas */}
                <div className="text-center pb-3 border-b-2 border-slate-900">
                  <input
                    type="text"
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="w-full text-center text-2xl sm:text-3xl font-extrabold uppercase tracking-wide bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-700 mt-2 font-sans">
                    <input
                      type="text"
                      value={editableLocation}
                      onChange={(e) => setEditableLocation(e.target.value)}
                      className="text-center w-36 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                    />
                    <span>•</span>
                    <input
                      type="text"
                      value={editablePhone}
                      onChange={(e) => setEditablePhone(e.target.value)}
                      className="text-center w-36 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                    />
                    <span>•</span>
                    <input
                      type="text"
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      className="text-center w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                    />
                    <span>•</span>
                    <input
                      type="text"
                      value={editableLinkedIn}
                      onChange={(e) => setEditableLinkedIn(e.target.value)}
                      className="text-center w-48 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-blue-700"
                    />
                  </div>
                </div>

                {/* 2. Professional Summary */}
                <div className="mt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
                    Professional Summary
                  </h4>
                  <textarea
                    rows={3}
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="w-full text-xs sm:text-sm leading-relaxed text-justify bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded p-1 focus:outline-none"
                  />
                </div>

                {/* 3. Work Experience */}
                <div className="mt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
                    Professional Work Experience
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm font-bold text-slate-900">
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-1/2"
                      />
                      <span>—</span>
                      <input
                        type="text"
                        value={editableMitra}
                        onChange={(e) => setEditableMitra(e.target.value)}
                        className="italic font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-1/2"
                      />
                    </div>
                    <input
                      type="text"
                      value={editablePeriode}
                      onChange={(e) => setEditablePeriode(e.target.value)}
                      className="text-right sm:w-44 font-normal text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none mt-1 sm:mt-0"
                    />
                  </div>

                  {/* Bullet Points List */}
                  <div className="mt-2.5 space-y-2">
                    {editableBullets.map((bullet, idx) => (
                      <div key={idx} className="group relative flex items-start gap-2">
                        <span className="text-slate-800 font-bold mt-1 select-none">•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => handleUpdateBullet(idx, e.target.value)}
                          className="w-full text-xs sm:text-sm text-justify leading-relaxed bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded p-1 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBullet(idx)}
                          className="no-print opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition shrink-0 cursor-pointer"
                          title="Hapus bullet ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Skills & Competencies */}
                <div className="mt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
                    Technical & Core Competencies
                  </h4>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-start gap-1">
                      <span className="font-bold shrink-0">• Hard Skills:</span>
                      <input
                        type="text"
                        value={editableHardSkills}
                        onChange={(e) => setEditableHardSkills(e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-bold shrink-0">• Tools & Technologies:</span>
                      <input
                        type="text"
                        value={editableTools}
                        onChange={(e) => setEditableTools(e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-bold shrink-0">• Soft Skills:</span>
                      <input
                        type="text"
                        value={editableSoftSkills}
                        onChange={(e) => setEditableSoftSkills(e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Education */}
                <div className="mt-5">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-800 pb-0.5 mb-2">
                    Education
                  </h4>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
                    <input
                      type="text"
                      value={editableUniv}
                      onChange={(e) => setEditableUniv(e.target.value)}
                      className="font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-full sm:w-2/3"
                    />
                    <input
                      type="text"
                      value={editableTahun}
                      onChange={(e) => setEditableTahun(e.target.value)}
                      className="text-left sm:text-right font-normal text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none w-full sm:w-1/3"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 mt-1">
                    <span>Bachelor Degree in</span>
                    <input
                      type="text"
                      value={editableProdi}
                      onChange={(e) => setEditableProdi(e.target.value)}
                      className="font-medium bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none flex-1"
                    />
                    <span>(IPK:</span>
                    <input
                      type="text"
                      value={editableIpk}
                      onChange={(e) => setEditableIpk(e.target.value)}
                      className="font-bold text-center w-24 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                    />
                    <span>)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
