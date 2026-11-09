import React from "react";
import {
  GitBranch,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  type CommitItem,
} from "@/src/lib/types/ingestion";

interface IngestionGithubTabProps {
  branchInput: string;
  dateInput: string;
  fetchedCommits: CommitItem[];
  generatedDraftNote: string;
  githubError: string | null;
  handleFetchGitHub: () => Promise<void>;
  isGitHubLoading: boolean;
  isRawMode: boolean;
  onApplyNote: (note: string, suggestedRole?: string) => void;
  onClose: () => void;
  rawGitLog: string;
  repoInput: string;
  setBranchInput: React.Dispatch<React.SetStateAction<string>>;
  setDateInput: React.Dispatch<React.SetStateAction<string>>;
  setIsRawMode: React.Dispatch<React.SetStateAction<boolean>>;
  setRawGitLog: React.Dispatch<React.SetStateAction<string>>;
  setRepoInput: React.Dispatch<React.SetStateAction<string>>;
  setUsernameInput: React.Dispatch<React.SetStateAction<string>>;
  suggestedRole: string;
  usernameInput: string;
}

export function IngestionGithubTab({ branchInput, dateInput, fetchedCommits, generatedDraftNote, githubError, handleFetchGitHub, isGitHubLoading, isRawMode, onApplyNote, onClose, rawGitLog, repoInput, setBranchInput, setDateInput, setIsRawMode, setRawGitLog, setRepoInput, setUsernameInput, suggestedRole, usernameInput }: IngestionGithubTabProps) {
  return (
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
  );
}
