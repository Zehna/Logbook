import type { KknRabItem } from "@/src/lib/data/kknSamples";

export interface KknFinancialSummary {
  totalRencana: number;
  totalRealisasi: number;
  sisaSaldo: number;
  serapanPersen: number;
}

/**
 * Ringkasan keuangan RAB KKN dari daftar item. Sebelumnya useMemo inline di
 * KknTeamTab — dipindah verbatim ke sini agar bisa diuji unit.
 */
export function computeFinancialSummary(
  rabItems: KknRabItem[]
): KknFinancialSummary {
  const totalRencana = rabItems.reduce(
    (acc, r) => acc + (Number(r.anggaranRencana) || 0),
    0
  );
  const totalRealisasi = rabItems.reduce(
    (acc, r) => acc + (Number(r.realisasiPengeluaran) || 0),
    0
  );
  const sisaSaldo = totalRencana - totalRealisasi;
  const serapanPersen =
    totalRencana > 0
      ? Math.min(100, Math.round((totalRealisasi / totalRencana) * 100))
      : 0;

  return {
    totalRencana,
    totalRealisasi,
    sisaSaldo,
    serapanPersen,
  };
}

/** Format angka menjadi "Rp 1.500.000" (id-ID). */
export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}
