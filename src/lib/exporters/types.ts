export type TipeKegiatan = "Magang MBKM" | "MSIB" | "KKN";

export type KampusPreset = "dikti" | "its" | "ui_ugm_ipb";

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
  kampusPreset?: KampusPreset;
  logoKampusBase64?: string;
  logoKampusMimeType?: string;
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  namaMahasiswa: "[Nama Lengkap Mahasiswa]",
  nim: "[NIM Mahasiswa]",
  programStudi: "S1 Teknik Informatika / Manajemen",
  perguruanTinggi: "Universitas Indonesia Merdeka",
  namaMitra: "PT Mitra Industri Nusantara / Desa Binaan",
  namaPembimbing: "[Nama Dosen Pembimbing / Mentor]",
  periodeKegiatan: "Semester Gasal 2026/2027",
  kampusPreset: "dikti",
};

export const KAMPUS_PRESETS: {
  value: KampusPreset;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    value: "dikti",
    label: "Standar Nasional Dikti / Umum",
    badge: "Margin 4-4-3-3 • TNR 12pt • Spasi 1.5",
    description: "Format resmi standar nasional Dikti Kemdikbudristek untuk Magang & Studi Independen Bersertifikat.",
  },
  {
    value: "its",
    label: "Standar ITS / Politeknik (Buku KP)",
    badge: "Format Buku KP: Bab I-V • Pengesahan Ganda",
    description: "Pedoman laporan Kerja Praktik (KP) teknik & vokasi dengan lembar pengesahan ganda dosen & mentor lapangan.",
  },
  {
    value: "ui_ugm_ipb",
    label: "Standar UI / UGM / IPB (Eksekutif)",
    badge: "Format Ringkas Eksekutif • Matriks Capaian",
    description: "Format laporan modern padat berbasis ringkasan eksekutif, matriks capaian SKS, dan evaluasi berkala.",
  },
];
