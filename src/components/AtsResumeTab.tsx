"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Share2,
  FileText,
  Award,
  TrendingUp,
  Tag,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { ResumeGeneratorResponse } from "@/src/lib/types/modules";

interface AtsResumeTabProps {
  tipeKegiatan: string;
  peran: string;
  riwayatLogbookText: string;
}

export const AtsResumeTab: React.FC<AtsResumeTabProps> = ({
  tipeKegiatan,
  peran,
  riwayatLogbookText,
}) => {
  const [targetRole, setTargetRole] = useState(peran);
  const [activityContext, setActivityContext] = useState(riwayatLogbookText);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ResumeGeneratorResponse | null>(null);

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  React.useEffect(() => {
    if (!activityContext && riwayatLogbookText) {
      setActivityContext(riwayatLogbookText);
    }
  }, [riwayatLogbookText, activityContext]);

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
    const bulletsText = result.resumeBullets
      .map((b) => `• ${b.bulletText}`)
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

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Briefcase className="w-60 h-60" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Harvard Format STAR Method & LinkedIn Storytelling</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Logbook to CV ATS & Personal Branding
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100 leading-relaxed">
            Jangan biarkan catatan magang Anda mengendap sia-sia! Ubah riwayat kerja harian menjadi bullet points resume berstandar Harvard dengan metrik kuantitatif dan postingan LinkedIn yang memikat para recruiter.
          </p>
        </div>
      </div>

      {/* Input Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
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
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
          {/* Section 1: ATS Bullets */}
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
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
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
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

          {/* Section 2: LinkedIn Storytelling */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  LINKEDIN STORYTELLING
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Draf Postingan Viral & Reflektif
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyLinkedIn}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
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

          {/* Section 3: Top Skills */}
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
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
    </div>
  );
};
