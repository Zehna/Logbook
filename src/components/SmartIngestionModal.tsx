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
  FileCode,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface SmartIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNote: (note: string, suggestedRole?: string) => void;
  currentPeran?: string;
  currentTipeKegiatan?: string;
}

interface CommitItem {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
}

export function SmartIngestionModal({
  isOpen,
  onClose,
  onApplyNote,
  currentPeran = "Software Engineer Intern",
  currentTipeKegiatan = "Magang MBKM",
}: SmartIngestionModalProps) {
  const [activeTab, setActiveTab] = useState<"github" | "calendar">("github");

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

  if (!isOpen) return null;

  // Handle GitHub Sync
  const handleFetchGitHub = async () => {
    setGithubError(null);
    setIsGitHubLoading(true);

    try {
      const payload: Record<string, string> = {
        peran: currentPeran,
        tipeKegiatan: currentTipeKegiatan,
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

      // Sederhana: ekstrak VEVENT SUMMARY dan DESCRIPTION
      const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
      const matches = Array.from(content.matchAll(eventRegex));

      const parsedEvents: string[] = [];
      matches.forEach((m, idx) => {
        const body = m[1];
        const summaryMatch = body.match(/SUMMARY:(.+)/);
        const descMatch = body.match(/DESCRIPTION:(.+)/);
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
      // Format ringkas dari agenda jadwal
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Smart Ingestion Layer</h3>
              <p className="text-xs text-slate-500">
                Impor aktivitas otomatis dari GitHub Commits atau Jadwal Kalender Rapat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "github"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>GitHub Commit Sync</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "calendar"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Kalender (.ics)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "github" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Metode Masukan:</span>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRawMode(false)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      !isRawMode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    API Repositori
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRawMode(true)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      isRawMode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Tempel git log
                  </button>
                </div>
              </div>

              {!isRawMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Repositori GitHub / URL:
                    </label>
                    <input
                      type="text"
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      placeholder="contoh: facebook/react atau https://github.com/username/project"
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Branch (Opsional):
                      </label>
                      <input
                        type="text"
                        value={branchInput}
                        onChange={(e) => setBranchInput(e.target.value)}
                        placeholder="main / master"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Filter Tanggal:
                      </label>
                      <input
                        type="date"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Author / Username:
                      </label>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="contoh: octocat"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tempel Output Terminal <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">git log --oneline -n 10</code>:
                  </label>
                  <textarea
                    rows={5}
                    value={rawGitLog}
                    onChange={(e) => setRawGitLog(e.target.value)}
                    placeholder="73743e9 feat: complete LogMagang OS ecosystem&#10;5a12b4e fix: handle responsive table layout&#10;3d4e5f6 refactor: optimize document exporter"
                    className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}

              {githubError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{githubError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleFetchGitHub}
                disabled={isGitHubLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {isGitHubLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengambil & Menganalisis Commit via AI...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="w-4 h-4" />
                    <span>Tarik Commit & Konversi ke Logbook</span>
                  </>
                )}
              </button>

              {/* Result Preview */}
              {generatedDraftNote && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Hasil Rangkuman Draf Aktivitas Harian:
                    </span>
                    {suggestedRole && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                        Saran Peran: {suggestedRole}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    {generatedDraftNote}
                  </p>

                  {fetchedCommits.length > 0 && (
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Commit terdeteksi ({fetchedCommits.length}):</span>{" "}
                      {fetchedCommits.map((c) => c.shortSha).join(", ")}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      onApplyNote(generatedDraftNote, suggestedRole);
                      onClose();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Gunakan Sebagai Catatan Harian & Tutup</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Tempelkan Agenda Rapat / Catatan Standup Harian:
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => fileIcsInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
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
                className="w-full p-3.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
              />

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Sistem akan otomatis merapikan jadwal atau berkas kalender menjadi kalimat narasi kegiatan terpadu yang siap di-generate ke Taksonomi Bloom.
                </span>
              </div>

              <button
                type="button"
                onClick={handleProcessAgenda}
                disabled={!agendaText.trim() || isCalendarLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {isCalendarLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Agenda...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Format & Masukkan ke Form Catatan Harian</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
