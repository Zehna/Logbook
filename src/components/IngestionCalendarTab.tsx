import React from "react";
import {
  Calendar,
  Loader2,
  Upload,
  Clock,
} from "lucide-react";

interface IngestionCalendarTabProps {
  agendaText: string;
  fileIcsInputRef: React.RefObject<HTMLInputElement | null>;
  handleIcsUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleProcessAgenda: () => void;
  isCalendarLoading: boolean;
  setAgendaText: React.Dispatch<React.SetStateAction<string>>;
}

export function IngestionCalendarTab({ agendaText, fileIcsInputRef, handleIcsUpload, handleProcessAgenda, isCalendarLoading, setAgendaText }: IngestionCalendarTabProps) {
  return (
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
  );
}
