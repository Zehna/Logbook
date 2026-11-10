"use client";

import React from "react";
import { Check, Copy, Share2 } from "lucide-react";
import type { ResumeGeneratorResponse } from "@/src/lib/types/modules";

export interface AtsResumeAnalysisViewProps {
  result: ResumeGeneratorResponse;
  targetRole: string;
  copiedSection: string | null;
  onCopySection: (text: string, sectionKey: string) => void;
  onCopyAllBullets: () => void;
  onCopyLinkedIn: () => void;
  onCopySkills: () => void;
}

export const AtsResumeAnalysisView: React.FC<AtsResumeAnalysisViewProps> = ({
  result,
  targetRole,
  copiedSection,
  onCopySection,
  onCopyAllBullets,
  onCopyLinkedIn,
  onCopySkills,
}) => {
  return (
  <div className="space-y-6">
    {/* ATS Bullets */}
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
            HARVARD CV FORMAT (STAR METHOD)
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
            Bullet Points Pengalaman Kerja ({result.targetRole})
          </h3>
        </div>
        <button
          type="button"
          onClick={onCopyAllBullets}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          {copiedSection === "all-bullets" ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Tersalin Semua!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-300 dark:text-zinc-600" />
              <span>Salin Semua Bullets</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {result.resumeBullets.map((b, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 hover:bg-white dark:hover:bg-zinc-800/80 hover:shadow-md transition-all space-y-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">
                • {b.bulletText}
              </p>
              <button
                type="button"
                onClick={() => onCopySection(`• ${b.bulletText}`, `bullet-${idx}`)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors shrink-0 cursor-pointer"
                title="Salin bullet ini"
              >
                {copiedSection === `bullet-${idx}` ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-700/60 text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                <span className="font-bold text-slate-500 dark:text-zinc-400 block">S (Situation):</span>
                <span className="text-slate-700 dark:text-zinc-300">{b.starFramework.situation}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                <span className="font-bold text-slate-500 dark:text-zinc-400 block">T (Task):</span>
                <span className="text-slate-700 dark:text-zinc-300">{b.starFramework.task}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                <span className="font-bold text-slate-500 dark:text-zinc-400 block">A (Action):</span>
                <span className="text-slate-700 dark:text-zinc-300">{b.starFramework.action}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block">R (Result & Metric):</span>
                <span className="text-emerald-900 dark:text-emerald-100 font-semibold">{b.metric}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* LinkedIn Storytelling */}
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
            LINKEDIN STORYTELLING
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-1">
            Draf Postingan Reflektif & Personal Branding
          </h3>
        </div>
        <button
          type="button"
          onClick={onCopyLinkedIn}
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

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-sm leading-relaxed text-slate-800 dark:text-zinc-200 whitespace-pre-wrap font-sans">
        {result.linkedInPost.fullText}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {result.linkedInPost.hashtags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-md text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    {/* Top Skills */}
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
            Top 5 Skills untuk Profil LinkedIn
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Diverifikasi langsung berdasarkan rekaman aktivitas logbook Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={onCopySkills}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
        >
          {copiedSection === "skills" ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tersalin!</span>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span>Salin Daftar</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.topSkills.map((sk, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">{sk.name}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                {sk.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed pt-1">
              {sk.relevance}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};
