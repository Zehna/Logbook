"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Mic,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";
import {
  DplSimulatorResponse,
  DefenseQuestionItem,
  DefenseEvaluationResult,
} from "@/src/lib/types/modules";
import { DplSimulatorInputConfig } from "./DplSimulatorInputConfig";
import { DplQuestionCard } from "./DplQuestionCard";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";
import {
  getStoredDefenseEvaluations,
  saveStoredDefenseEvaluations,
} from "@/src/lib/storage/indexedDbStore";

interface DplSimulatorTabProps {
  tipeKegiatan: string;
  peran: string;
  riwayatLogbookText: string;
  konteksMatkulSks?: string;
}

export const DplSimulatorTab: React.FC<DplSimulatorTabProps> = ({
  tipeKegiatan,
  peran,
  riwayatLogbookText,
  konteksMatkulSks,
}) => {
  const [judulLaporan, setJudulLaporan] = useState(
    `Laporan Akhir Pelaksanaan ${tipeKegiatan}: Kontribusi Operasional dan Peningkatan Kinerja`
  );
  const [mitraPerusahaan, setMitraPerusahaan] = useState("PT Mitra Industri / Desa Binaan");
  const [activityContext, setActivityContext] = useState(riwayatLogbookText);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<DplSimulatorResponse | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedIdealId, setCopiedIdealId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Two-Way Interactive Defense State
  const [speakingQuestionId, setSpeakingQuestionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<Record<number, DefenseEvaluationResult>>({});
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);

  const handleFillSampleActivity = () => {
    setActivityContext(
      "1. Bertanggung jawab atas migrasi infrastruktur database dari on-premise ke Cloud Managed Service, mengatasi kendala downtime saat jam sibuk operasional.\n2. Mengoptimalkan indeks query SQL yang mempercepat pemrosesan data analitik dari 14 detik menjadi 1,2 detik.\n3. Berkoordinasi dengan Dosen Pembimbing dan Mentor Industri terkait kesesuaian metodologi SDLC Agile Scrum yang diterapkan di perusahaan.\n4. Menghadapi kendala inkonsistensi skema data antar microservice dan mengatasinya dengan merancang schema registry terpusat."
    );
  };

  useEffect(() => {
    if (!activityContext && riwayatLogbookText) {
      setActivityContext(riwayatLogbookText);
    }
  }, [riwayatLogbookText, activityContext]);

  // Muat riwayat evaluasi dari IndexedDB saat pertama kali dibuka
  useEffect(() => {
    getStoredDefenseEvaluations().then((stored) => {
      if (stored && Object.keys(stored).length > 0) {
        setEvaluations(stored);
      }
    });
  }, []);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakQuestion = (id: number, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (speakingQuestionId === id) {
      window.speechSynthesis.cancel();
      setSpeakingQuestionId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingQuestionId(null);
    utterance.onerror = () => setSpeakingQuestionId(null);
    setSpeakingQuestionId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleRunSimulator = async () => {
    if (!activityContext.trim()) {
      setErrorMsg("Mohon sertakan riwayat logbook kegiatan untuk diuji oleh DPL.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/simulator-dpl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipeKegiatan,
          peran,
          judulLaporan,
          mitraPerusahaan,
          riwayatKegiatan: activityContext,
          konteksMatkulSks: konteksMatkulSks || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menjalankan simulasi sidang DPL.");
      }

      setResult(data.data);
      if (data.data?.pertanyaanSidang?.length > 0) {
        setExpandedId(data.data.pertanyaanSidang[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateAnswer = async (q: DefenseQuestionItem) => {
    const studentAnswer = answers[q.id]?.trim();
    if (!studentAnswer) {
      toast.error("Silakan ketik atau gunakan tombol Dikte Suara untuk menjawab pertanyaan ini terlebih dahulu.");
      return;
    }

    setEvaluatingId(q.id);
    try {
      const res = await fetch("/api/evaluate-defense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pertanyaan: q.pertanyaan,
          jawabanMahasiswa: studentAnswer,
          kategori: q.kategori,
          alasanPenguji: q.alasanPenguji,
          tipeKegiatan,
          peran,
          riwayatKegiatan: activityContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengevaluasi jawaban sidang.");
      }

      const updated = { ...evaluations, [q.id]: data.data };
      setEvaluations(updated);
      await saveStoredDefenseEvaluations(updated);
      toast.success("Jawaban latihan sidang berhasil dievaluasi!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan evaluasi.";
      toast.error(msg);
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleCopySingle = (q: DefenseQuestionItem) => {
    const text = `PERTANYAAN SIDANG DPL (${q.kategori}):
"${q.pertanyaan}"

MENGAPA DOSEN MENANYAKAN INI:
${q.alasanPenguji}

TIPS TAKTIS:
${q.tipsTaktis}

CONTOH JAWABAN LISAN:
"${q.contohJawabanLisan}"`;

    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyIdeal = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdealId(id);
    setTimeout(() => setCopiedIdealId(null), 2000);
  };

  const handleCopyAll = () => {
    if (!result) return;
    const text =
      `=== BANK PERTANYAAN & JAWABAN SIMULASI SIDANG DPL ===\n` +
      `Status Kesiapan: ${result.evaluasiKesiapanSidang.tingkatKesiapan} (Skor: ${result.evaluasiKesiapanSidang.skorPrediksi}/100)\n` +
      `Catatan Penguji: ${result.evaluasiKesiapanSidang.catatanUtama}\n\n` +
      result.pertanyaanSidang
        .map(
          (q) => `[Soal #${q.id}] Kategori: ${q.kategori}
Pertanyaan DPL: "${q.pertanyaan}"
Alasan Penguji: ${q.alasanPenguji}
Tips Menjawab: ${q.tipsTaktis}
Draf Jawaban Lisan:
"${q.contohJawabanLisan}"
----------------------------------------`
        )
        .join("\n\n");

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-pink-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Mic className="w-60 h-60" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Skeptical Examiner & Two-Way Interactive Defense Simulator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Simulasi Sidang DPL Interaktif (Dua Arah)
          </h2>
          <p className="mt-2 text-sm sm:text-base text-rose-100 leading-relaxed">
            Hadapi Dosen Pembimbing Lapangan (DPL) yang paling skeptis sebelum hari-H sidang sesungguhnya! Dengarkan suara pertanyaan dosen dengan Web Speech, ucapkan atau ketik jawaban Anda, lalu biarkan AI menguji dan memberi skor kelayakan secara objektif.
          </p>
        </div>
      </div>

      <DplSimulatorInputConfig
        judulLaporan={judulLaporan}
        onJudulLaporanChange={setJudulLaporan}
        mitraPerusahaan={mitraPerusahaan}
        onMitraPerusahaanChange={setMitraPerusahaan}
        activityContext={activityContext}
        onActivityContextChange={setActivityContext}
        konteksMatkulSks={konteksMatkulSks}
        isLoading={isLoading}
        errorMsg={errorMsg}
        onFillSample={handleFillSampleActivity}
        onRunSimulator={handleRunSimulator}
      />

      {/* Simulator Results */}
      {result && (
        <div className="space-y-6">
          {/* Readiness Score Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-rose-400">
                  {result.evaluasiKesiapanSidang.skorPrediksi}
                </span>
                <span className="text-[10px] text-slate-300">/ 100</span>
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  PREDIKSI KESIAPAN SIDANG
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {result.evaluasiKesiapanSidang.tingkatKesiapan}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {result.evaluasiKesiapanSidang.catatanUtama}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyAll}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Tersalin Semua!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Semua Bank Soal</span>
                </>
              )}
            </button>
          </div>

          {/* Defense Questions Accordion */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <span>5 Pertanyaan Ujian Sidang Paling Kritis:</span>
            </h3>

            {result.pertanyaanSidang.map((q) => (
              <DplQuestionCard
                key={q.id}
                q={q}
                isOpen={expandedId === q.id}
                isSpeaking={speakingQuestionId === q.id}
                currentAnswer={answers[q.id] || ""}
                currentEval={evaluations[q.id]}
                isEvaluating={evaluatingId === q.id}
                copiedId={copiedId}
                copiedIdealId={copiedIdealId}
                onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
                onSpeak={handleSpeakQuestion}
                onAnswerChange={(id, value) =>
                  setAnswers((prev) => ({ ...prev, [id]: value }))
                }
                onEvaluate={handleEvaluateAnswer}
                onCopySingle={handleCopySingle}
                onCopyIdeal={handleCopyIdeal}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
