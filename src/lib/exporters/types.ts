export type TipeKegiatan = "Magang MBKM" | "MSIB" | "KKN";

export interface LogbookResult {
  deskripsiKegiatan: string;
  kompetensiDikembangkan: string;
  kendalaDihadapi: string;
  solusiTindakan: string;
  refleksiPembelajaran: string;
}

export interface WeeklyLogbookDayItem {
  tanggal: string;
  hari: string;
  tahap_fase: string;
  deskripsi_kegiatan: string;
  kompetensi_dikembangkan: string;
  kendala_dihadapi: string;
  solusi_tindakan: string;
  refleksi_pembelajaran: string;
}

export interface LogbookEntry extends LogbookResult {
  id: string;
  tanggal: string;
  hari?: string;
  tahapFase?: string;
  tipeKegiatan: TipeKegiatan | string;
  peran: string;
  catatanAsli?: string;
  fotoBase64?: string;
  fotoMimeType?: string;
}

export interface StudentProfile {
  namaMahasiswa: string;
  nim: string;
  programStudi: string;
  perguruanTinggi: string;
  namaMitra: string;
  namaPembimbing: string;
  periodeKegiatan: string;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  namaMahasiswa: "[Nama Lengkap Mahasiswa]",
  nim: "[NIM Mahasiswa]",
  programStudi: "S1 Teknik Informatika / Manajemen",
  perguruanTinggi: "Universitas Indonesia Merdeka",
  namaMitra: "PT Mitra Industri Nusantara / Desa Binaan",
  namaPembimbing: "[Nama Dosen Pembimbing / Mentor]",
  periodeKegiatan: "Semester Gasal 2026/2027",
};
