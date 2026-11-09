"use client";

import React, { useState, useRef } from "react";
import {
  GitBranch,
  Calendar,
  Sparkles,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { LogbookEntry, TipeKegiatan } from "@/src/lib/exporters/types";
import {
  SAMPLE_CSV_TEMPLATE,
  type CommitItem,
  type ParsedCsvRow,
} from "@/src/lib/types/ingestion";
import { IngestionGithubTab } from "./IngestionGithubTab";
import { IngestionCalendarTab } from "./IngestionCalendarTab";
import { IngestionCsvTab } from "./IngestionCsvTab";

interface SmartIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNote: (note: string, suggestedRole?: string) => void;
  onImportBatchEntries?: (entries: LogbookEntry[]) => void;
  currentPeran?: string;
  currentTipeKegiatan?: TipeKegiatan | string;
}

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
          {activeTab === "github" && <IngestionGithubTab branchInput={branchInput} dateInput={dateInput} fetchedCommits={fetchedCommits} generatedDraftNote={generatedDraftNote} githubError={githubError} handleFetchGitHub={handleFetchGitHub} isGitHubLoading={isGitHubLoading} isRawMode={isRawMode} onApplyNote={onApplyNote} onClose={onClose} rawGitLog={rawGitLog} repoInput={repoInput} setBranchInput={setBranchInput} setDateInput={setDateInput} setIsRawMode={setIsRawMode} setRawGitLog={setRawGitLog} setRepoInput={setRepoInput} setUsernameInput={setUsernameInput} suggestedRole={suggestedRole} usernameInput={usernameInput} />}

          {activeTab === "calendar" && <IngestionCalendarTab agendaText={agendaText} fileIcsInputRef={fileIcsInputRef} handleIcsUpload={handleIcsUpload} handleProcessAgenda={handleProcessAgenda} isCalendarLoading={isCalendarLoading} setAgendaText={setAgendaText} />}

          {/* TAB 3: BATCH CSV / EXCEL TIMESHEET IMPORTER */}
          {activeTab === "csv" && <IngestionCsvTab csvRawText={csvRawText} fileCsvInputRef={fileCsvInputRef} handleCsvFileUpload={handleCsvFileUpload} handleDownloadSampleCsv={handleDownloadSampleCsv} handleImportAllCsvRows={handleImportAllCsvRows} onApplyNote={onApplyNote} onClose={onClose} parseCsvContent={parseCsvContent} parsedCsvRows={parsedCsvRows} />}
        </div>
      </div>
    </div>
  );
}
