"use client";

import React, { useState, useRef } from "react";
import {
  GitBranch,
  Calendar,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
  X,
  Upload,
  Clock,
  FileSpreadsheet,
  Download,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { LogbookEntry, TipeKegiatan } from "@/src/lib/exporters/types";

interface SmartIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNote: (note: string, suggestedRole?: string) => void;
  onImportBatchEntries?: (entries: LogbookEntry[]) => void;
  currentPeran?: string;
  currentTipeKegiatan?: TipeKegiatan | string;
}

interface CommitItem {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
}

interface ParsedCsvRow {
  tanggal: string;
  peran: string;
  aktivitas: string;
  kompetensi: string;
  kendala: string;
  solusi: string;
}

const SAMPLE_CSV_TEMPLATE = `Tanggal,Peran,Aktivitas,Kompetensi,Kendala,Solusi
2026-10-19,Software Engineer Intern,Melakukan analisis kebutuhan API autentikasi OAuth2 dan menyusun skema database pengguna bersama mentor teknis,Backend Architecture & REST API Design,Dokumentasi endpoint lama belum sinkron dengan spesifikasi terbaru,Melakukan penyelarasan kontrak OpenAPI bersama tim backend
2026-10-20,Software Engineer Intern,Mengimplementasikan modul validasi token JWT dan menguji unit test pada layanan autentikasi utama,Security Hardening & Automated Testing,Terdapat race condition pada saat refresh token dieksekusi bersamaan,Menambahkan mekanisme mutex lock dan antrean request pada interceptor
2026-10-21,Software Engineer Intern,Mempresentasikan hasil sprint review ke supervisor lapangan dan melakukan perbaikan performa query dashboard,Technical Communication & SQL Query Optimization,Waktu muat agregasi laporan bulanan masih di atas 800ms,Menambahkan composite index pada kolom tanggal dan user_id`;

export function SmartIngestionModal({
  isOpen,
  onClose,
  onApplyNote,
  onImportBatchEntries,
  currentPeran = "Software Engineer Intern",
  currentTipeKegiatan = "Magang MBKM",
}: SmartIngestionModalProps) {
  const [activeTab, setActiveTab] = useState<"github" | "calendar" | "csv">("github");

  // GitHub State
  const [repoInput, setRepoInput] = useState<string>("");
  const [branchInput, setBranchInput] = useState<string>("main");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 10));
  const [rawGitLog, setRawGitLog] = useState<string>("");
  const [isRawMode, setIsRawMode] = useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState<boolean>(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [fetchedCommits, setFetchedCommits] = useState<CommitItem[]>([]);
  const [generatedDraftNote, setGeneratedDraftNote] = useState<string>("");
  const [suggestedRole, setSuggestedRole] = useState<string>("");

  // Calendar State
  const [agendaText, setAgendaText] = useState<string>("");
  const [isCalendarLoading, setIsCalendarLoading] = useState<boolean>(false);
  const fileIcsInputRef = useRef<HTMLInputElement>(null);

  // CSV Timesheet Batch State
  const [csvRawText, setCsvRawText] = useState<string>("");
  const [parsedCsvRows, setParsedCsvRows] = useState<ParsedCsvRow[]>([]);
  const fileCsvInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle GitHub Sync
  const handleFetchGitHub = async () => {
    setGithubError(null);
    setIsGitHubLoading(true);

    try {
      const payload: Record<string, string> = {
        peran: currentPeran,
        tipeKegiatan: String(currentTipeKegiatan),
      };

      if (isRawMode) {
        if (!rawGitLog.trim()) {
          setGithubError("Silakan tempelkan riwayat git log terlebih dahulu.");
          setIsGitHubLoading(false);
          return;
        }
        payload.rawGitLog = rawGitLog.trim();
      } else {
        if (!repoInput.trim()) {
          setGithubError("Silakan masukkan nama repositori GitHub (contoh: facebook/react atau URL).");
          setIsGitHubLoading(false);
          return;
        }
        payload.repoUrlOrOwnerRepo = repoInput.trim();
        if (branchInput.trim()) payload.branch = branchInput.trim();
        if (usernameInput.trim()) payload.username = usernameInput.trim();
        if (dateInput.trim()) payload.date = dateInput.trim();
      }

      const res = await fetch("/api/sync-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyinkronkan data commit dari GitHub.");
      }

      setFetchedCommits(data.commits || []);
      setGeneratedDraftNote(data.draftDailyNote || "");
      if (data.suggestedRole) {
        setSuggestedRole(data.suggestedRole);
      }
    } catch (err: unknown) {
      setGithubError(err instanceof Error ? err.message : "Terjadi kesalahan saat sinkronisasi GitHub.");
    } finally {
      setIsGitHubLoading(false);
    }
  };

  // Handle ICS File Parsing
  const handleIcsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
      const matches = Array.from(content.matchAll(eventRegex));

      const parsedEvents: string[] = [];
      matches.forEach((m, idx) => {
        const body = m[1];
        const summaryMatch = body.match(/SUMMARY:(.+)/);
        const dtstartMatch = body.match(/DTSTART(?:;[^:]+)?:(\d{8}T\d{4})/);

        const summary = summaryMatch ? summaryMatch[1].trim() : `Agenda #${idx + 1}`;
        const time = dtstartMatch ? dtstartMatch[1].slice(9, 11) + ":" + dtstartMatch[1].slice(11, 13) : "";

        parsedEvents.push(time ? `${time} - ${summary}` : summary);
      });

      if (parsedEvents.length > 0) {
        setAgendaText(
          `Jadwal Agenda Hari Ini:\n` + parsedEvents.map((ev) => `- ${ev}`).join("\n")
        );
      } else {
        setAgendaText(content.slice(0, 500));
      }
    };
    reader.readAsText(file);
  };

  // Convert raw agenda to coherent daily note
  const handleProcessAgenda = () => {
    if (!agendaText.trim()) return;
    setIsCalendarLoading(true);

    setTimeout(() => {
      const lines = agendaText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l && !l.toLowerCase().startsWith("jadwal agenda"));

      const cleanSummary = lines
        .map((l) => l.replace(/^[-*•\d.:]+\s*/, "").trim())
        .filter(Boolean)
        .join(", ");

      const result = `Hari ini saya berpartisipasi dan menyelesaikan serangkaian agenda operasional: ${cleanSummary}, serta berkoordinasi dengan mentor terkait tindak lanjut hasil pembahasan.`;

      onApplyNote(result);
      setIsCalendarLoading(false);
      onClose();
    }, 400);
  };

  // Parse CSV Text into Structured Rows
  const parseCsvContent = (raw: string) => {
    setCsvRawText(raw);
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setParsedCsvRows([]);
      return;
    }

    // Detect if first line is header
    const firstLower = lines[0].toLowerCase();
    const startIdx =
      firstLower.includes("tanggal") || firstLower.includes("date") || firstLower.includes("aktivitas")
        ? 1
        : 0;

    const rows: ParsedCsvRow[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const delimiter = lines[i].includes("\t") ? "\t" : lines[i].includes(";") ? ";" : ",";
      const parts = lines[i].split(delimiter).map((p) => p.replace(/^"|"$/g, "").trim());
      if (parts.length >= 2) {
        rows.push({
          tanggal: parts[0] || new Date().toISOString().slice(0, 10),
          peran: parts[1] || currentPeran || "Peserta Magang",
          aktivitas: parts[2] || parts[1] || "Pelaksanaan agenda operasional harian bersama tim mitra.",
          kompetensi:
            parts[3] ||
            "Implementasi Teknis, Analisis Sistem & Komunikasi Kolaboratif",
          kendala:
            parts[4] ||
            "Penyesuaian spesifikasi teknis dan sinkronisasi jadwal antar bagian.",
          solusi:
            parts[5] ||
            "Melakukan koordinasi intensif bersama mentor lapangan serta verifikasi dokumentasi.",
        });
      }
    }
    setParsedCsvRows(rows);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        parseCsvContent(content);
        toast.success(`Berkas CSV "${file.name}" berhasil dibaca.`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([SAMPLE_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Template_Timesheet_LogMagang.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatIsoToIndonesianDate = (dateStr: string): string => {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return dateStr;
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleImportAllCsvRows = () => {
    if (parsedCsvRows.length === 0) return;

    if (onImportBatchEntries) {
      const entries: LogbookEntry[] = parsedCsvRows.map((row, idx) => ({
        id: `csv-import-${Date.now()}-${idx}`,
        tanggal: formatIsoToIndonesianDate(row.tanggal),
        tipeKegiatan: currentTipeKegiatan,
        peran: row.peran || currentPeran,
        catatanAsli: `[CSV Timesheet Import] ${row.aktivitas}`,
        deskripsiKegiatan: `Melaksanakan dan mengimplementasikan kegiatan operasional harian: ${row.aktivitas}. Pelaksanaan tugas dilakukan secara sistematis sesuai standar prosedur mitra kerja serta dikoordinasikan bersama pembimbing lapangan untuk memastikan ketercapaian target kinerja harian.`,
        kompetensiDikembangkan: `Mengembangkan kompetensi profesional pada bidang ${row.kompetensi}, meliputi ketelitian eksekusi teknis, manajemen waktu operasional, serta kolaborasi lintas fungsi di lingkungan kerja mitra.`,
        kendalaDihadapi: `Menghadapi tantangan teknis dan koordinasi berupa: ${row.kendala}.`,
        solusiTindakan: `Merumuskan langkah penyelesaian konkret dengan cara: ${row.solusi}, sehingga proses kerja tetap berjalan efektif dan sesuai jadwal.`,
        refleksiPembelajaran: `Memperoleh pemahaman praktis mengenai pentingnya perencanaan kerja yang terukur, komunikasi proaktif bersama mentor, serta evaluasi berkelanjutan terhadap kualitas hasil kerja harian.`,
        qualityScore: 94,
      }));

      onImportBatchEntries(entries);
      toast.success(
        `${entries.length} entri logbook dari CSV Timesheet berhasil diimpor (+${entries.length * 8} Jam MBKM)!`
      );
      onClose();
    } else {
      // Fallback: apply first row to note
      const first = parsedCsvRows[0];
      onApplyNote(`${first.aktivitas} (Kendala: ${first.kendala}; Solusi: ${first.solusi})`, first.peran);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base">
                Smart Ingestion &amp; Batch CSV Timesheet
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Impor aktivitas dari GitHub Commits, Agenda Kalender (.ics), atau Tabel Timesheet CSV/Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "github"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>GitHub Commit Sync</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "calendar"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Kalender (.ics)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("csv")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "csv"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-zinc-400"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import CSV Timesheet (Batch)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "github" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400 font-medium">Metode Masukan:</span>
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-zinc-700 p-0.5 bg-slate-100 dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsRawMode(false)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      !isRawMode
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    API Repositori
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRawMode(true)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isRawMode
                        ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-zinc-400"
                    }`}
                  >
                    Tempel git log
                  </button>
                </div>
              </div>

              {!isRawMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Nama Repositori GitHub / URL:
                    </label>
                    <input
                      type="text"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      placeholder="contoh: facebook/react atau https://github.com/username/project"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                        Branch (Opsional):
                      </label>
                      <input
                        type="text"
                        value={branchInput}
                        onChange={(e) => setBranchInput(e.target.value)}
                        placeholder="main / master"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                        Filter Tanggal:
                      </label>
                      <input
                        type="date"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                        Author / Username:
                      </label>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="contoh: octocat"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Tempel Output Terminal <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600">git log --oneline -n 10</code>:
                  </label>
                  <textarea
                    rows={5}
                    value={rawGitLog}
                    onChange={(e) => setRawGitLog(e.target.value)}
                    placeholder="73743e9 feat: complete LogMagang OS ecosystem&#10;5a12b4e fix: handle responsive table layout&#10;3d4e5f6 refactor: optimize document exporter"
                    className="w-full p-3 text-xs font-mono border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {githubError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{githubError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleFetchGitHub}
                disabled={isGitHubLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isGitHubLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengambil &amp; Menganalisis Commit via AI...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    <span>Tarik Commit &amp; Konversi ke Logbook</span>
                  </>
                )}
              </button>

              {generatedDraftNote && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/70 border border-indigo-100 dark:border-zinc-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 dark:text-zinc-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Hasil Rangkuman Draf Aktivitas Harian:
                    </span>
                    {suggestedRole && (
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold">
                        Saran Peran: {suggestedRole}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-zinc-200 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                    {generatedDraftNote}
                  </p>

                  {fetchedCommits.length > 0 && (
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">
                        Commit terdeteksi ({fetchedCommits.length}):
                      </span>{" "}
                      {fetchedCommits.map((c) => c.shortSha).join(", ")}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onApplyNote(generatedDraftNote, suggestedRole);
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Gunakan Sebagai Catatan Harian &amp; Tutup</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Tempelkan Agenda Rapat / Catatan Standup Harian:
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => fileIcsInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File .ics</span>
                  </button>
                  <input
                    ref={fileIcsInputRef}
                    type="file"
                    accept=".ics,.ical"
                    className="hidden"
                    onChange={handleIcsUpload}
                  />
                </div>
              </div>

              <textarea
                rows={6}
                value={agendaText}
                onChange={(e) => setAgendaText(e.target.value)}
                placeholder="Contoh:&#10;09:00 - 10:00 Daily Standup Sprint 3&#10;10:00 - 12:00 Riset integrasi payment gateway&#10;13:30 - 15:00 Rapat Koordinasi dengan Supervisor Lapangan&#10;15:30 - 17:00 Pengerjaan modul validasi lisensi QRIS"
                className="w-full p-3.5 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
              />

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/70 text-[11px] text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Sistem akan otomatis merapikan jadwal atau berkas kalender menjadi kalimat narasi kegiatan terpadu yang siap di-generate ke Taksonomi Bloom.
                </span>
              </div>

              <button
                type="button"
                onClick={handleProcessAgenda}
                disabled={!agendaText.trim() || isCalendarLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isCalendarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Agenda...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Format &amp; Masukkan ke Form Catatan Harian</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: BATCH CSV / EXCEL TIMESHEET IMPORTER */}
          {activeTab === "csv" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Impor Massal Timesheet CSV / Tabel Aktivitas Harian
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Format Kolom: <code className="font-mono">Tanggal,Peran,Aktivitas,Kompetensi,Kendala,Solusi</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => parseCsvContent(SAMPLE_CSV_TEMPLATE)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    Muat Contoh Data
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template .csv</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileCsvInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih File .CSV</span>
                  </button>
                  <input
                    ref={fileCsvInputRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    className="hidden"
                    onChange={handleCsvFileUpload}
                  />
                </div>
              </div>

              <textarea
                rows={4}
                value={csvRawText}
                onChange={(e) => parseCsvContent(e.target.value)}
                placeholder="Tempelkan baris CSV atau TSV dari Excel / Google Sheets di sini, atau klik 'Muat Contoh Data'..."
                className="w-full p-3 text-xs font-mono border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              {parsedCsvRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-zinc-200">
                      Pratinjau Data Terbaca ({parsedCsvRows.length} Baris = +{parsedCsvRows.length * 8} Jam MBKM)
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                          <th className="p-2">Tanggal</th>
                          <th className="p-2">Peran</th>
                          <th className="p-2">Aktivitas Utama</th>
                          <th className="p-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {parsedCsvRows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                            <td className="p-2 font-mono whitespace-nowrap text-slate-700 dark:text-zinc-300">
                              {r.tanggal}
                            </td>
                            <td className="p-2 text-slate-600 dark:text-zinc-400">
                              {r.peran}
                            </td>
                            <td className="p-2 text-slate-800 dark:text-zinc-200 line-clamp-1">
                              {r.aktivitas}
                            </td>
                            <td className="p-2 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  onApplyNote(
                                    `${r.aktivitas}. Kompetensi: ${r.kompetensi}. Kendala: ${r.kendala}. Solusi: ${r.solusi}.`,
                                    r.peran
                                  );
                                  onClose();
                                }}
                                className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                              >
                                Isi ke Form
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleImportAllCsvRows}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>
                      Impor Semua ke Riwayat Logbook ({parsedCsvRows.length} Entri • +{parsedCsvRows.length * 8} Jam)
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
