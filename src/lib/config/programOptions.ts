import type React from "react";
import { Briefcase, GraduationCap, Users } from "lucide-react";
import type { TipeKegiatan } from "@/src/lib/exporters/types";

/** Pilihan program kegiatan (Magang MBKM / MSIB / KKN) + contoh peran & catatan. */
export const PROGRAM_OPTIONS: {
  value: TipeKegiatan;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  roleExamples: string[];
  noteExample: string;
  weeklyExamples: { label: string; summary: string }[];
}[] = [
  {
    value: "Magang MBKM",
    label: "Magang MBKM",
    subtitle: "Magang Bersertifikat / Mandiri",
    icon: Briefcase,
    roleExamples: [
      "Social Media Specialist",
      "Staff Operasional",
      "Software Engineer Intern",
      "Finance & Admin Intern",
    ],
    noteExample:
      "hari ini bantu rekap nota masuk ke excel sama packing barang, tadi sempet ada 2 nota yang nominalnya gak sinkron sama mutasi tapi udah dicek ulang bareng supervisor",
    weeklyExamples: [
      {
        label: "📱 Kampanye Konten Medsos",
        summary:
          "pekan ini garap konten feeds & reels instagram buat kampanye produk baru, mulai dari riset tren kompetitor, bikin content calendar, take video & desain di canva, revisi copywriting dari mentor, sampai jadwalin posting & rekap insight mingguan",
      },
      {
        label: "📦 Rekap Operasional & Gudang",
        summary:
          "minggu ini beresin audit stok barang gudang dan rekap nota transaksi bulanan ke excel, sempet nemu selisih stok 5 item terus dicek ulang bareng tim gudang dan akhirnya bikin template kontrol stok baru",
      },
      {
        label: "💻 Pengembangan Fitur Web",
        summary:
          "pekan ini ngerjain fitur halaman dashboard laporan user, mulai dari baca dokumentasi API, slicing komponen tabel dan filter di Next.js, integrasi endpoint backend, benerin bug pagination, sampai code review bareng senior",
      },
    ],
  },
  {
    value: "MSIB",
    label: "MSIB",
    subtitle: "Studi Independen Bersertifikat",
    icon: GraduationCap,
    roleExamples: [
      "Fullstack Web Track",
      "Data Analytics Mentee",
      "UI/UX Product Design",
      "AI & Cloud Computing",
    ],
    noteExample:
      "hari ini ikut sesi mentoring live bahas REST API dan lanjut ngerjain tugas kelompok bikin endpoint autentikasi, sempet error CORS pas disambungin ke frontend tapi berhasil beres",
    weeklyExamples: [
      {
        label: "🚀 Sprint Capstone Project",
        summary:
          "pekan ini sprint 2 capstone project bareng kelompok: senin ikut sesi ILT mentor, selasa bikin rancangan database & wireframe, rabu coding modul autentikasi & CRUD, kamis testing bug bareng tim QA, jumat presentasi progres mingguan ke mentor",
      },
      {
        label: "📊 Eksplorasi & Visualisasi Data",
        summary:
          "minggu ini belajar materi data cleaning & visualisasi pakai Python dan Looker Studio, bersihin dataset transaksi yang banyak missing value, bikin dashboard interaktif, lalu kumpulin tugas hands-on tepat waktu",
      },
    ],
  },
  {
    value: "KKN",
    label: "KKN",
    subtitle: "Kuliah Kerja Nyata Pengabdian",
    icon: Users,
    roleExamples: [
      "Koordinator Divisi Pendidikan",
      "Divisi Ekonomi Kreatif UMKM",
      "Humas & Publikasi Desa",
      "Sekretaris Posko KKN",
    ],
    noteExample:
      "hari ini sosialisasi pembuatan katalog digital sama foto produk keripik ibu-ibu PKK di balai desa, awalnya terkendala pencahayaan kurang terang jadi pindah ke teras balai desa",
    weeklyExamples: [
      {
        label: "🏪 Pendampingan Digitalisasi UMKM Desa",
        summary:
          "pekan ini jalankan proker pendampingan UMKM warga desa: mulai dari survei 8 pelaku usaha keripik & batik, menyiapkan materi modul katalog digital & QRIS, praktik foto produk di balai desa, pendaftaran akun Google Maps & e-commerce, sampai evaluasi bareng perangkat desa",
      },
      {
        label: "📚 Bimbingan Belajar & Literasi Anak",
        summary:
          "minggu ini ngadain program pojok baca dan bimbel sore untuk anak SD di posko desa, koordinasi dengan kepala sekolah, merapikan buku donasi, ngajarin calistung & bahasa inggris dasar pakai kuis interaktif, dan evaluasi antusiasme peserta",
      },
    ],
  },
];
