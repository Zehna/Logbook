/**
 * Tipe & data default sesi bimbingan DPL/Mentor. Sebelumnya inline di
 * AdminDocsTab — dipindah ke sini agar sub-komponen bimbingan bisa
 * memakai tipenya tanpa import sirkular.
 */

export interface ConsultationSession {
  id: string;
  pertemuanKe: number;
  tanggal: string;
  topikBab: string;
  catatanRevisi: string;
  pembimbing: "DPL Kampus" | "Mentor Mitra";
  statusParaf: "Disetujui & Diparaf" | "Revisi Minor" | "Menunggu";
}


export const DEFAULT_CONSULTATION_SESSIONS: ConsultationSession[] = [
  {
    id: "bimb-1",
    pertemuanKe: 1,
    tanggal: "2025-02-10",
    topikBab: "Orientasi Lapangan & Pengajuan Kerangka Kerja (TOR)",
    catatanRevisi: "Fokuskan ruang lingkup masalah pada efisiensi proses bisnis inti di unit kerja mitra.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-2",
    pertemuanKe: 2,
    tanggal: "2025-02-24",
    topikBab: "Bab I: Pendahuluan, Rumusan Masalah & Tujuan Magang/KKN",
    catatanRevisi: "Perjelas indikator ketercapaian luaran (deliverables) agar terukur secara kuantitatif.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-3",
    pertemuanKe: 3,
    tanggal: "2025-03-10",
    topikBab: "Bab II: Profil Organisasi Mitra & Tinjauan Pustaka",
    catatanRevisi: "Tambahkan struktur organisasi divisi terkait dan alur SOP eksisting.",
    pembimbing: "Mentor Mitra",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-4",
    pertemuanKe: 4,
    tanggal: "2025-03-25",
    topikBab: "Bab III: Metodologi Pelaksanaan & Rencana Implementasi",
    catatanRevisi: "Sudah sesuai dengan timeline sprint proyek di departemen teknis.",
    pembimbing: "Mentor Mitra",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-5",
    pertemuanKe: 5,
    tanggal: "2025-04-14",
    topikBab: "Monitoring & Evaluasi Tengah Semester (Monev Kemajuan 50%)",
    catatanRevisi: "Logbook mingguan tertib. Lanjutkan pengambilan data pengujian hasil implementasi.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-6",
    pertemuanKe: 6,
    tanggal: "2025-05-05",
    topikBab: "Bab IV: Hasil Pelaksanaan Proyek, Analisis & Pembahasan",
    catatanRevisi: "Lengkapi tabel perbandingan efisiensi sebelum dan sesudah implementasi sistem/program.",
    pembimbing: "Mentor Mitra",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-7",
    pertemuanKe: 7,
    tanggal: "2025-05-20",
    topikBab: "Bab V: Kesimpulan, Rekomendasi Mitra & Draf Artikel Ilmiah",
    catatanRevisi: "Abstrak artikel ilmiah disesuaikan dengan format template jurnal SINTA.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
  {
    id: "bimb-8",
    pertemuanKe: 8,
    tanggal: "2025-06-02",
    topikBab: "Validasi Draf Final Laporan Akhir & Persetujuan Sidang (ACC)",
    catatanRevisi: "Seluruh berkas laporan akhir dan luaran wajib lengkap. Disetujui untuk maju seminar/sidang.",
    pembimbing: "DPL Kampus",
    statusParaf: "Disetujui & Diparaf",
  },
];
