"use client";

import React from "react";
import {
  AlertTriangle,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Lightbulb,
  Loader2,
  Mic,
  Volume2,
  VolumeX,
} from "lucide-react";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";
import type {
  DefenseEvaluationResult,
  DefenseQuestionItem,
} from "@/src/lib/types/modules";

export interface DplQuestionCardProps {
  q: DefenseQuestionItem;
  isOpen: boolean;
  isSpeaking: boolean;
  currentAnswer: string;
  currentEval?: DefenseEvaluationResult;
  isEvaluating: boolean;
  copiedId: number | null;
  copiedIdealId: number | null;
  onToggle: (id: number) => void;
  onSpeak: (id: number, text: string) => void;
  onAnswerChange: (id: number, value: string) => void;
  onEvaluate: (q: DefenseQuestionItem) => void;
  onCopySingle: (q: DefenseQuestionItem) => void;
  onCopyIdeal: (id: number, text: string) => void;
}

export const DplQuestionCard: React.FC<DplQuestionCardProps> = ({
  q,
  isOpen,
  isSpeaking,
  currentAnswer,
  currentEval,
  isEvaluating,
  copiedId,
  copiedIdealId,
  onToggle,
  onSpeak,
  onAnswerChange,
  onEvaluate,
  onCopySingle,
  onCopyIdeal,
}) => {
  return (
  <div
      className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-all"
  >
    {/* Header / Clickable */}
    <div className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
      <button
        type="button"
        onClick={() => onToggle(q.id)}
        className="space-y-1.5 flex-1 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center shrink-0">
            {q.id}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
            {q.kategori}
          </span>
          {currentEval && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentEval.skorJawaban >= 85
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  : currentEval.skorJawaban >= 70
                  ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
              }`}
            >
              Skor Evaluasi: {currentEval.skorJawaban}/100
            </span>
          )}
        </div>
        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 leading-snug">
          "{q.pertanyaan}"
        </p>
      </button>

      <div className="flex items-center gap-2 shrink-0">
        {/* Audio Button */}
        <button
          type="button"
          onClick={() => onSpeak(q.id, q.pertanyaan)}
          title={isSpeaking ? "Hentikan Suara Dosen" : "Dengarkan Pertanyaan Dosen (id-ID)"}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            isSpeaking
              ? "bg-rose-600 text-white border-rose-600 shadow-md animate-pulse"
              : "bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700"
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          )}
        </button>

        {/* Expand Toggle */}
        <button
          type="button"
          onClick={() => onToggle(q.id)}
          className="text-slate-400 dark:text-zinc-500 p-1 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
        >
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>

    {/* Expanded Content */}
    {isOpen && (
      <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 space-y-4">
        {/* Why Examiner asks this */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Motif Penguji / Mengapa Dosen Menanyakan Ini:</span>
          </div>
          <p className="leading-relaxed pl-5.5">{q.alasanPenguji}</p>
        </div>

        {/* Tactical Tips */}
        <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
            <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Tips Taktis Cara Menjawab:</span>
          </div>
          <p className="leading-relaxed pl-5.5">{q.tipsTaktis}</p>
        </div>

        {/* INTERACTIVE MODE: Mahasiswa Menjawab & Evaluasi Dua Arah */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border-2 border-dashed border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
              <Mic className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Latihan Jawab Mandiri (Mode Uji Dua Arah):</span>
            </div>
            <VoiceDictationButton
              onTranscript={(text) => {
                onAnswerChange(q.id, currentAnswer.trim() ? `${currentAnswer.trim()} ${text}` : text);
              }}
              tooltipText="Diktekan jawaban lisan Anda"
            />
          </div>

          <textarea
            rows={3}
            value={currentAnswer}
            onChange={(e) =>
              onAnswerChange(q.id, e.target.value)
            }
            placeholder="Ketik atau diktekan suara jawaban Anda terhadap pertanyaan dosen di atas..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 dark:bg-zinc-800/60 text-slate-800 dark:text-zinc-100"
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              💡 Gunakan teknik STAR dan sebutkan data metrik nyata dari logbook Anda.
            </span>
            <button
              type="button"
              onClick={() => onEvaluate(q)}
              disabled={isEvaluating || !currentAnswer.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>DPL Menilai...</span>
                </>
              ) : (
                <>
                  <Award className="w-3.5 h-3.5" />
                  <span>🎯 Uji Kelayakan Jawaban Saya</span>
                </>
              )}
            </button>
          </div>

          {/* HASIL EVALUASI DARI DOSEN AI */}
          {currentEval && (
            <div className="mt-3 p-4 rounded-xl bg-slate-900 text-white space-y-3 border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Hasil Penilaian Dosen Penguji:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">
                    {currentEval.tingkatKualitas}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      currentEval.skorJawaban >= 85
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : currentEval.skorJawaban >= 70
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                    }`}
                  >
                    {currentEval.skorJawaban} / 100
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentEval.umpanBalikDosen}
              </p>

              {/* Poin Yang Terlewat */}
              {currentEval.poinYangTerlewat?.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 space-y-1">
                  <span className="text-[11px] font-bold text-rose-300 block">
                    ⚠️ Poin Penting Yang Terlewat dari Jawaban Anda:
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-rose-200 space-y-0.5">
                    {currentEval.poinYangTerlewat.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rekomendasi Jawaban Sempurna */}
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-300">
                    ✨ Contoh Jawaban Revisi Ideal (Skor A):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onCopyIdeal(q.id, currentEval.jawabanRevisiIdeal)
                    }
                    className="inline-flex items-center gap-1 text-[10px] text-emerald-300 hover:text-white px-2 py-0.5 rounded bg-emerald-800/40 cursor-pointer"
                  >
                    {copiedIdealId === q.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[12px] italic text-emerald-100 font-serif leading-relaxed">
                  "{currentEval.jawabanRevisiIdeal}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Ready-to-speak baseline example answer */}
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-950 dark:text-emerald-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300">
              <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Contoh Jawaban Lisan Berbobot Akademis (Siap Ucap):</span>
            </div>
            <button
              type="button"
              onClick={() => onCopySingle(q)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white px-2.5 py-1 rounded-md bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-800 shadow-xs cursor-pointer"
            >
              {copiedId === q.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Salin Jawaban</span>
                </>
              )}
            </button>
          </div>
          <p className="leading-relaxed italic pl-5.5 font-serif text-slate-800 dark:text-zinc-200 text-[13px]">
            "{q.contohJawabanLisan}"
          </p>
        </div>
      </div>
    )}
  </div>
  );
};
