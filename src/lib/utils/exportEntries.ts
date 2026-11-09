import type {
  LogbookEntry,
  LogbookResult,
  WeeklyLogbookDayItem,
} from "@/src/lib/exporters/types";

/**
 * Selektor entri untuk ekspor (Excel/Word/PowerPoint). Sebelumnya closure di
 * app/page.tsx yang membaca state langsung; sekarang fungsi murni dengan
 * argumen eksplisit agar bisa diuji unit.
 */

export function getEntriesForExport(args: {
  history: LogbookEntry[];
  weeklyResults: WeeklyLogbookDayItem[];
  result: LogbookResult | null;
  resultPhoto: string | null;
  fotoMimeType: string;
  tipeKegiatan: string;
  peran: string;
}): LogbookEntry[] {
  const { history, weeklyResults, result, resultPhoto, fotoMimeType, tipeKegiatan, peran } = args;

    if (history.length > 0) {
      return history.map((entry, idx) => ({
        ...entry,
        id: entry.id || `hist-${idx}-${entry.tanggal || "entry"}`,
      }));
    }
    if (weeklyResults.length > 0) {
      return weeklyResults.map((day, idx) => ({
        id: `weekly-${idx}-${day.tanggal || idx}`,
        tanggal: day.tanggal,
        hari: day.hari,
        tahapFase: day.tahap_fase,
        tipeKegiatan,
        peran: peran || "Mahasiswa Peserta Program",
        deskripsiKegiatan: day.deskripsi_kegiatan,
        kompetensiDikembangkan: day.kompetensi_dikembangkan,
        kendalaDihadapi: day.kendala_dihadapi,
        solusiTindakan: day.solusi_tindakan,
        refleksiPembelajaran: day.refleksi_pembelajaran,
      }));
    }
    if (result) {
      return [
        {
          id: "current-result",
          tanggal: new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          tipeKegiatan,
          peran: peran || "Mahasiswa Peserta Program",
          fotoBase64: resultPhoto || undefined,
          fotoMimeType: resultPhoto ? fotoMimeType : undefined,
          ...result,
        },
      ];
    }
    return [];
}

export function getSelectedEntriesForExport(
  all: LogbookEntry[],
  isBulkSelectionActive: boolean,
  selectedExportEntryIds: string[]
): LogbookEntry[] {
    if (!isBulkSelectionActive) {
      return all;
    }
    const filtered = all.filter((entry, idx) => {
      const entryId = entry.id || `entry-${idx}`;
      return selectedExportEntryIds.includes(entryId);
    });
    return filtered;
}

