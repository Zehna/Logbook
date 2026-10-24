export interface MonthlyGeneratePayload {
  bulanKe: string; // e.g. "Bulan 1 (Pekan 1-4)", "Bulan 2 (Pekan 5-8)", "Mid-term (Tengah Periode)", "Bulan 3 (Pekan 9-12)", "Bulan 4 (Pekan 13-16)"
  tipeKegiatan: string;
  peran: string;
  catatanTambahan?: string;
  namaMahasiswa?: string;
  nim?: string;
  namaMitra?: string;
  programStudi?: string;
  perguruanTinggi?: string;
  entries?: Array<{
    tanggal: string;
    deskripsiKegiatan: string;
    kompetensiDikembangkan?: string;
    kendalaDihadapi?: string;
    solusiTindakan?: string;
    refleksiPembelajaran?: string;
  }>;
}

export interface MonthlyReportOutput {
  periodeBulan: string;
  ringkasanPencapaianIKU: string;
  milestoneProyekUtama: string;
  evaluasiHambatanDanSolusi: string;
  rencanaEmpatPekanKedepan: string;
  rekomendasiDanRefleksi: string;
}
