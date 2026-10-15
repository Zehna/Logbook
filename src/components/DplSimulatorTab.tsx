"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  Sparkles,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  ShieldAlert,
  Send,
  Award,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import {
  DplSimulatorResponse,
  DefenseQuestionItem,
  DefenseEvaluationResult,
} from "@/src/lib/types/modules";
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
      alert("Browser Anda belum mendukung Web Speech Synthesis API.");
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
      alert("Silakan ketik atau gunakan tombol Dikte Suara untuk menjawab pertanyaan ini terlebih dahulu.");
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan evaluasi.";
      alert(msg);
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

      {/* Input Parameters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Draf Laporan Akhir:
            </label>
            <input
              type="text"
              value={judulLaporan}
              onChange={(e) => setJudulLaporan(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Mitra / Perusahaan / Desa:
            </label>
            <input
              type="text"
              value={mitraPerusahaan}
              onChange={(e) => setMitraPerusahaan(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {konteksMatkulSks && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Konteks Konversi 20 SKS Terintegrasi:</span> Dosen penguji akan secara otomatis menguji kesesuaian logbook kerja dengan capaian mata kuliah yang Anda ajukan.
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Riwayat Logbook yang Akan Dicecar Dosen:
          </label>
          <textarea
            rows={4}
            value={activityContext}
            onChange={(e) => setActivityContext(e.target.value)}
            placeholder="Masukkan rangkuman kegiatan harian/mingguan yang sudah Anda buat..."
            className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-slate-50/50"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleRunSimulator}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>DPL AI Sedang Membedah Celah Logbook & Menyiapkan Pertanyaan...</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>🎙️ Mulai Uji Sidang DPL Sekarang</span>
            </>
          )}
        </button>
      </div>

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
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>5 Pertanyaan Ujian Sidang Paling Kritis:</span>
            </h3>

            {result.pertanyaanSidang.map((q) => {
              const isOpen = expandedId === q.id;
              const isSpeaking = speakingQuestionId === q.id;
              const currentAnswer = answers[q.id] || "";
              const currentEval = evaluations[q.id];
              const isEvaluating = evaluatingId === q.id;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all"
                >
                  {/* Header / Clickable */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : q.id)}
                      className="space-y-1.5 flex-1 text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {q.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {q.kategori}
                        </span>
                        {currentEval && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              currentEval.skorJawaban >= 85
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : currentEval.skorJawaban >= 70
                                ? "bg-blue-100 text-blue-800 border border-blue-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            Skor Evaluasi: {currentEval.skorJawaban}/100
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        "{q.pertanyaan}"
                      </p>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Audio Button */}
                      <button
                        type="button"
                        onClick={() => handleSpeakQuestion(q.id, q.pertanyaan)}
                        title={isSpeaking ? "Hentikan Suara Dosen" : "Dengarkan Pertanyaan Dosen (id-ID)"}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          isSpeaking
                            ? "bg-rose-600 text-white border-rose-600 shadow-md animate-pulse"
                            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-rose-600" />
                        )}
                      </button>

                      {/* Expand Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : q.id)}
                        className="text-slate-400 p-1 hover:text-slate-600 cursor-pointer"
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
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      {/* Why Examiner asks this */}
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-800">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Motif Penguji / Mengapa Dosen Menanyakan Ini:</span>
                        </div>
                        <p className="leading-relaxed pl-5.5">{q.alasanPenguji}</p>
                      </div>

                      {/* Tactical Tips */}
                      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-blue-800">
                          <Lightbulb className="w-4 h-4 text-blue-600" />
                          <span>Tips Taktis Cara Menjawab:</span>
                        </div>
                        <p className="leading-relaxed pl-5.5">{q.tipsTaktis}</p>
                      </div>

                      {/* INTERACTIVE MODE: Mahasiswa Menjawab & Evaluasi Dua Arah */}
                      <div className="p-4 rounded-xl bg-white border-2 border-dashed border-rose-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <Mic className="w-4 h-4 text-rose-600" />
                            <span>Latihan Jawab Mandiri (Mode Uji Dua Arah):</span>
                          </div>
                          <VoiceDictationButton
                            onTranscript={(text) => {
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: prev[q.id]?.trim()
                                  ? `${prev[q.id].trim()} ${text}`
                                  : text,
                              }));
                            }}
                            tooltipText="Diktekan jawaban lisan Anda"
                          />
                        </div>

                        <textarea
                          rows={3}
                          value={currentAnswer}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Ketik atau diktekan suara jawaban Anda terhadap pertanyaan dosen di atas..."
                          className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
                        />

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] text-slate-500">
                            💡 Gunakan teknik STAR dan sebutkan data metrik nyata dari logbook Anda.
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEvaluateAnswer(q)}
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
                                    handleCopyIdeal(q.id, currentEval.jawabanRevisiIdeal)
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
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                            <Volume2 className="w-4 h-4 text-emerald-700" />
                            <span>Contoh Jawaban Lisan Berbobot Akademis (Siap Ucap):</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopySingle(q)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-md bg-white border border-emerald-300 shadow-xs cursor-pointer"
                          >
                            {copiedId === q.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Salin Jawaban</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="leading-relaxed italic pl-5.5 font-serif text-slate-800 text-[13px]">
                          "{q.contohJawabanLisan}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
