/** Tipe & template contoh untuk SmartIngestionModal (impor GitHub/kalender/CSV). */

export interface CommitItem {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
}

export interface ParsedCsvRow {
  tanggal: string;
  peran: string;
  aktivitas: string;
  kompetensi: string;
  kendala: string;
  solusi: string;
}

export const SAMPLE_CSV_TEMPLATE = `Tanggal,Peran,Aktivitas,Kompetensi,Kendala,Solusi
2026-10-19,Software Engineer Intern,Melakukan analisis kebutuhan API autentikasi OAuth2 dan menyusun skema database pengguna bersama mentor teknis,Backend Architecture & REST API Design,Dokumentasi endpoint lama belum sinkron dengan spesifikasi terbaru,Melakukan penyelarasan kontrak OpenAPI bersama tim backend
2026-10-20,Software Engineer Intern,Mengimplementasikan modul validasi token JWT dan menguji unit test pada layanan autentikasi utama,Security Hardening & Automated Testing,Terdapat race condition pada saat refresh token dieksekusi bersamaan,Menambahkan mekanisme mutex lock dan antrean request pada interceptor
2026-10-21,Software Engineer Intern,Mempresentasikan hasil sprint review ke supervisor lapangan dan melakukan perbaikan performa query dashboard,Technical Communication & SQL Query Optimization,Waktu muat agregasi laporan bulanan masih di atas 800ms,Menambahkan composite index pada kolom tanggal dan user_id`;
