"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Cloud,
  Download,
  Upload,
  Database,
  Check,
  AlertTriangle,
  X,
  FileJson,
  Smartphone,
  Laptop,
  ArrowRightLeft,
  Loader2,
  Key,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { saveAs } from "file-saver";

interface WorkspaceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

const STORAGE_KEYS = [
  "logmagang_entries_history",
  "logmagang_student_profile",
  "logmagang_free_usage_count",
  "logmagang_is_pro_active",
  "logmagang_license_info",
  "logmagang_kkn_proker",
  "logmagang_sks_history",
  "logmagang_resume_history",
  "logmagang_dpl_history",
];

const SUPABASE_CONFIG_KEY = "logmagang_supabase_sync_config";

export function WorkspaceSyncModal({
  isOpen,
  onClose,
  onDataRestored,
}: WorkspaceSyncModalProps) {
  const [activeTab, setActiveTab] = useState<"file" | "cloud">("file");

  // Status state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Supabase State
  const [supabaseUrl, setSupabaseUrl] = useState<string>("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>("");
  const [syncRoomId, setSyncRoomId] = useState<string>("default-nim");
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(SUPABASE_CONFIG_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.url) setSupabaseUrl(parsed.url);
        if (parsed.anonKey) setSupabaseAnonKey(parsed.anonKey);
        if (parsed.roomId) setSyncRoomId(parsed.roomId);
      } else {
        // Default NIM dari profil jika ada
        const profileStr = localStorage.getItem("logmagang_student_profile");
        if (profileStr) {
          try {
            const p = JSON.parse(profileStr);
            if (p.nim && p.nim !== "[NIM Mahasiswa]") {
              setSyncRoomId(`sync-${p.nim}`);
            }
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Ekspor Seluruh Data ke File JSON
  const handleExportJson = () => {
    try {
      const backupData: Record<string, unknown> = {
        _logmagang_version: "2.0.0",
        _export_timestamp: new Date().toISOString(),
        _device_info: typeof navigator !== "undefined" ? navigator.userAgent : "Web Client",
      };

      let entriesCount = 0;
      STORAGE_KEYS.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try {
            const parsed = JSON.parse(val);
            backupData[key] = parsed;
            if (key === "logmagang_entries_history" && Array.isArray(parsed)) {
              entriesCount = parsed.length;
            }
          } catch {
            backupData[key] = val;
          }
        }
      });

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      const dateStamp = new Date().toISOString().slice(0, 10);
      saveAs(blob, `LogMagang_Backup_${dateStamp}.json`);

      showNotification(`Berhasil mengekspor backup (${entriesCount} riwayat entri tersimpan)!`);
    } catch (err: unknown) {
      showNotification(
        `Gagal membuat backup: ${err instanceof Error ? err.message : "Kesalahan tidak dikenal"}`,
        "error"
      );
    }
  };

  // 2. Impor File JSON ke LocalStorage
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) throw new Error("File kosong");

        const data = JSON.parse(content);
        if (!data || typeof data !== "object") {
          throw new Error("Format berkas backup tidak valid.");
        }

        let restoredCount = 0;
        STORAGE_KEYS.forEach((key) => {
          if (key in data) {
            const val = data[key];
            if (typeof val === "object") {
              localStorage.setItem(key, JSON.stringify(val));
            } else {
              localStorage.setItem(key, String(val));
            }
            restoredCount++;
          }
        });

        // Trigger callback refresh state di page
        onDataRestored();
        showNotification(
          `Sukses! Seluruh data workspace (${restoredCount} modul) berhasil dipulihkan.`
        );
      } catch (err: unknown) {
        showNotification(
          `Gagal memulihkan backup: ${err instanceof Error ? err.message : "Format JSON salah"}`,
          "error"
        );
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // 3. Supabase Cloud Sync
  const saveSupabaseConfig = () => {
    try {
      localStorage.setItem(
        SUPABASE_CONFIG_KEY,
        JSON.stringify({
          url: supabaseUrl.trim(),
          anonKey: supabaseAnonKey.trim(),
          roomId: syncRoomId.trim(),
        })
      );
    } catch {
      // ignore
    }
  };

  const handlePushToSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      showNotification("Harap masukkan URL dan Anon Key proyek Supabase Anda.", "error");
      return;
    }

    saveSupabaseConfig();
    setIsCloudLoading(true);

    try {
      // Susun payload snapshot
      const snapshot: Record<string, unknown> = {};
      STORAGE_KEYS.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val !== null) {
          try {
            snapshot[key] = JSON.parse(val);
          } catch {
            snapshot[key] = val;
          }
        }
      });

      const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
      const endpoint = `${cleanUrl}/rest/v1/logmagang_sync`;

      const bodyPayload = {
        id: syncRoomId.trim() || "default-user",
        backup_data: snapshot,
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey.trim(),
          Authorization: `Bearer ${supabaseAnonKey.trim()}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 404 || errorText.includes("relation") || errorText.includes("does not exist")) {
          setShowSqlGuide(true);
          throw new Error("Tabel 'logmagang_sync' belum dibuat di Supabase. Lihat panduan SQL di bawah.");
        }
        throw new Error(`Supabase error (${res.status}): ${errorText.slice(0, 120)}`);
      }

      showNotification("Data berhasil diunggah dan disinkronkan ke Supabase Cloud!");
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Gagal mengunggah ke Supabase Cloud.",
        "error"
      );
    } finally {
      setIsCloudLoading(false);
    }
  };

  const handlePullFromSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      showNotification("Harap masukkan URL dan Anon Key proyek Supabase Anda.", "error");
      return;
    }

    saveSupabaseConfig();
    setIsCloudLoading(true);

    try {
      const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
      const roomId = syncRoomId.trim() || "default-user";
      const endpoint = `${cleanUrl}/rest/v1/logmagang_sync?id=eq.${encodeURIComponent(roomId)}&select=*`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          apikey: supabaseAnonKey.trim(),
          Authorization: `Bearer ${supabaseAnonKey.trim()}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Supabase error (${res.status}): ${errorText.slice(0, 120)}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = await res.json();
      if (!Array.isArray(rows) || rows.length === 0 || !rows[0].backup_data) {
        throw new Error(`Tidak ditemukan rekaman backup dengan ID '${roomId}' di Supabase.`);
      }

      const snapshot = rows[0].backup_data;
      let restoredCount = 0;
      STORAGE_KEYS.forEach((key) => {
        if (key in snapshot) {
          const val = snapshot[key];
          if (typeof val === "object") {
            localStorage.setItem(key, JSON.stringify(val));
          } else {
            localStorage.setItem(key, String(val));
          }
          restoredCount++;
        }
      });

      onDataRestored();
      showNotification(`Sukses menarik ${restoredCount} modul data dari cloud ke perangkat ini!`);
    } catch (err: unknown) {
      showNotification(
        err instanceof Error ? err.message : "Gagal menarik data dari Supabase Cloud.",
        "error"
      );
    } finally {
      setIsCloudLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Multi-Device Workspace Sync & Backup
              </h3>
              <p className="text-xs text-slate-500">
                Pindahkan data logbook, foto, dan lisensi Pro antar HP & Laptop dengan aman
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "file"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>Ekspor / Impor Berkas (.json)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cloud")}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === "cloud"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Supabase Cloud Connector</span>
          </button>
        </div>

        {/* Toast Notifikasi */}
        {toastMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              toastMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {toastMessage.type === "success" ? (
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === "file" ? (
            <div className="space-y-4">
              {/* Diagram Visual Perpindahan Perangkat */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-700">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Perangkat Asal</div>
                    <div className="text-[11px] text-slate-500">HP / Browser Lama</div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Instant JSON
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-700">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Perangkat Baru</div>
                    <div className="text-[11px] text-slate-500">Laptop / Sidang</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {/* Tombol Ekspor Backup */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                      <Download className="w-4 h-4" />
                      <span>1. Unduh Berkas Backup</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Simpan seluruh riwayat logbook harian, mingguan, biodata, bukti foto, dan lisensi Pro ke file JSON tunggal.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor Backup (.json)</span>
                  </button>
                </div>

                {/* Tombol Pulihkan Backup */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                      <Upload className="w-4 h-4" />
                      <span>2. Pulihkan di Perangkat Baru</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Buka di laptop atau browser baru, pilih file JSON hasil unduhan, dan seluruh data langsung aktif kembali.
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportJson}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Impor / Pulihkan Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                <b>Koneksi Cloud Mandiri (Opsional):</b> Hubungkan akun Supabase Anda untuk sinkronisasi otomatis multi-perangkat tanpa perlu mengunduh file secara manual.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Supabase Anon Public Key:
                  </label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ID Ruang Sinkronisasi (NIM / Kode Unik):
                  </label>
                  <input
                    type="text"
                    value={syncRoomId}
                    onChange={(e) => setSyncRoomId(e.target.value)}
                    placeholder="contoh: sync-12345678"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePushToSupabase}
                  disabled={isCloudLoading}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {isCloudLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  <span>Push ke Cloud</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromSupabase}
                  disabled={isCloudLoading}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                >
                  {isCloudLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Tarik dari Cloud</span>
                </button>
              </div>

              {showSqlGuide && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-800">Perintah SQL Supabase:</div>
                  <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg text-[11px] font-mono overflow-x-auto">
{`create table if not exists logmagang_sync (
  id text primary key,
  backup_data jsonb,
  updated_at timestamp with time zone default now()
);

alter table logmagang_sync enable row level security;
create policy "Allow all access" on logmagang_sync for all using (true) with check (true);`}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
