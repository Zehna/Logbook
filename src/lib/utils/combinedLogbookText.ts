import type {
  LogbookEntry,
  LogbookResult,
  WeeklyLogbookDayItem,
} from "@/src/lib/exporters/types";

/**
 * Teks gabungan riwayat logbook untuk simulator DPL / CV / SKS.
 * Sebelumnya closure di app/page.tsx yang membaca state langsung;
 * sekarang fungsi murni dengan argumen eksplisit agar bisa diuji unit.
 */
export function buildCombinedLogbookText(args: {
  history: LogbookEntry[];
  weeklyResults: WeeklyLogbookDayItem[];
  result: LogbookResult | null;
  catatan: string;
  tipeKegiatan: string;
  peran: string;
}): string {
  const { history, weeklyResults, result, catatan, tipeKegiatan, peran } = args;
  if (history.length > 0) {
    return history
      .slice(0, 10)
      .map(
        (h, i) =>
          `[Hari #${i + 1} - ${h.tanggal}] (${h.peran})\n- Deskripsi: ${h.deskripsiKegiatan}\n- Kompetensi: ${h.kompetensiDikembangkan}\n- Kendala: ${h.kendalaDihadapi}\n- Solusi: ${h.solusiTindakan}\n- Refleksi: ${h.refleksiPembelajaran}`
      )
      .join("\n\n");
  }
  if (weeklyResults.length > 0) {
    return weeklyResults
      .map(
        (w, i) =>
          `[Hari #${i + 1} - ${w.hari}, ${w.tanggal}] (${w.tahap_fase})\n- Deskripsi: ${w.deskripsi_kegiatan}\n- Kompetensi: ${w.kompetensi_dikembangkan}\n- Kendala: ${w.kendala_dihadapi}\n- Solusi: ${w.solusi_tindakan}\n- Refleksi: ${w.refleksi_pembelajaran}`
      )
      .join("\n\n");
  }
  if (result) {
    return `[Logbook Terkini - ${tipeKegiatan}] (${peran})\n- Deskripsi: ${result.deskripsiKegiatan}\n- Kompetensi: ${result.kompetensiDikembangkan}\n- Kendala: ${result.kendalaDihadapi}\n- Solusi: ${result.solusiTindakan}\n- Refleksi: ${result.refleksiPembelajaran}`;
  }
  return catatan || "";
}
