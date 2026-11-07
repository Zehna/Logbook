/**
 * Data Pengujian Dummy Terpadu untuk E2E LogMagang OS
 * Berisi payload data yang realistis untuk konteks MBKM, MSIB, dan KKN.
 */

export const TEST_DATA = {
  // Generator & Dokumen Harian
  dailyLogbook: {
    program: "Magang & Studi Independen Bersertifikat (MSIB)",
    peran: "Frontend Engineer Intern",
    mitra: "PT Inovasi Digital Nusantara",
    catatan:
      "Hari ini menyelesaikan integrasi endpoint REST API untuk modul dashboard mahasiswa, menangani error boundary pada komponen tabel, dan menghadiri sprint review bersama Tech Lead.",
  },

  // Konversi 20 SKS
  konversiSks: {
    dummyActivity:
      "Melakukan analisis performa web app Next.js, implementasi Tailwind CSS v4, konfigurasi state management React 19, unit testing komponen dengan Vitest, dan perancangan arsitektur micro-frontend bersama tim mentor.",
  },

  // CV ATS & LinkedIn
  atsResume: {
    targetRole: "Junior Fullstack Developer",
    dummyExperience:
      "Merancang dan mengimplementasikan sistem manajemen logbook mahasiswa berbasis Next.js 15 dan Cloud Firestore. Berhasil mengoptimalkan waktu render sebesar 40% dan mengotomasi 5 format ekspor dokumen resmi (PDF, Word, Excel, PowerPoint).",
  },

  // Simulasi Sidang DPL
  simulasiDpl: {
    judulLaporan:
      "Pengembangan Sistem Informasi Presensi & Manajemen Capaian Kompetensi MBKM",
    mitraPerusahaan: "PT Digital Transformasi Edukasi",
    dummyContext:
      "Fokus pekerjaan mencakup arsitektur database, otentikasi aman Firebase, pemetaan 20 SKS berbasis Taksonomi Bloom, dan pemenuhan luaran IKU-1 hingga IKU-7.",
    dummyAnswer:
      "Dalam proyek ini saya menerapkan teknik component-driven development dengan React 19 dan Next.js 15. Untuk memastikan pemenuhan CPL, saya menggunakan matriks Taksonomi Bloom level C3 hingga C6 sehingga setiap aktivitas terpetakan secara kuantitatif.",
  },

  // Tim KKN Desa
  timKkn: {
    namaProker: "Digitalisasi UMKM Keripik Tempe Desa Sukamaju",
    sasaranWarga: "30 Pelaku UMKM Dusun 2",
    penanggungJawab: "Budi Santoso & Tim IT",
    output:
      "Pembuatan akun Google Business, katalog produk digital, dan pelatihan foto produk berbasis smartphone.",
  },

  // Berkas & Penilaian
  berkasPenilaian: {
    namaMentor: "Ir. Bambang Wijaya, M.T.",
    jabatanMentor: "Senior Engineering Manager",
    catatanEvaluasi:
      "Mahasiswa menunjukkan integritas tinggi, kedisiplinan kerja luar biasa, dan inisiatif problem-solving yang sangat solutif selama masa magang.",
  },
};

