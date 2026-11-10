"use client";

import React from "react";
import { Cloud, Download, Loader2 } from "lucide-react";

export interface WorkspaceSyncCloudTabProps {
  supabaseUrl: string;
  onSupabaseUrlChange: (value: string) => void;
  supabaseAnonKey: string;
  onSupabaseAnonKeyChange: (value: string) => void;
  syncRoomId: string;
  onSyncRoomIdChange: (value: string) => void;
  isCloudLoading: boolean;
  showSqlGuide: boolean;
  onPushToSupabase: () => void;
  onPullFromSupabase: () => void;
}

export const WorkspaceSyncCloudTab: React.FC<WorkspaceSyncCloudTabProps> = ({
  supabaseUrl,
  onSupabaseUrlChange,
  supabaseAnonKey,
  onSupabaseAnonKeyChange,
  syncRoomId,
  onSyncRoomIdChange,
  isCloudLoading,
  showSqlGuide,
  onPushToSupabase,
  onPullFromSupabase,
}) => {
  return (
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
          onChange={(e) => onSupabaseUrlChange(e.target.value)}
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
          onChange={(e) => onSupabaseAnonKeyChange(e.target.value)}
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
          onChange={(e) => onSyncRoomIdChange(e.target.value)}
          placeholder="contoh: sync-12345678"
          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-3 pt-2">
      <button
        type="button"
        onClick={onPushToSupabase}
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
        onClick={onPullFromSupabase}
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
  );
};
