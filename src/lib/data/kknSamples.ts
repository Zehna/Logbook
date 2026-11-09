import type { KknProkerItem } from "@/src/lib/types/modules";

/**
 * Data contoh & daftar luaran default Tim KKN. Sebelumnya konstanta inline
 * di KknTeamTab (baris 26-211) — dipindah ke sini agar komponennya ramping.
 * Isi data contoh tidak diubah sama sekali.
 */

export const SAMPLE_PROKERS: KknProkerItem[] = [
  {
    id: "p1",
    namaProker: "Sosialisasi Sanitasi & Pemilahan Sampah Rumah Tangga",
    divisi: "Kesehatan & Sanitasi",
    sasaranWarga: "60 Ibu-Ibu PKK & Kader Posyandu RW 03",
    status: "Selesai 100%",
    capaianDanOutput:
      "Pemasangan 10 unit tempat sampah pilah organik-anorganik dan booklet edukasi pencegahan DBD.",
    penanggungJawab: "Ahmad & Siti",
  },
  {
    id: "p2",
    namaProker: "Bimbel Ceria & Pojok Baca Digital Anak Desa",
    divisi: "Pendidikan & Literasi",
    sasaranWarga: "45 Siswa SDN 01 Sukamaju (Kelas 4-6)",
    status: "Selesai 100%",
    capaianDanOutput:
      "Pengadaan 120 buku bacaan hibah, 8 sesi pendampingan calistung, dan pelatihan dasar komputer.",
    penanggungJawab: "Nadia & Rizky",
  },
  {
    id: "p3",
    namaProker: "Digitalisasi Pemasaran & Foto Produk UMKM Keripik Singkong",
    divisi: "Ekonomi Kreatif & UMKM",
    sasaranWarga: "8 Pelaku UMKM Makanan Olahan Dusun 2",
    status: "Sedang Berjalan 75%",
    capaianDanOutput:
      "Pembuatan akun Google Maps Business, desain label stiker kemasan baru, dan onboarding Shopee/Tokopedia.",
    penanggungJawab: "Budi & Maya",
  },
  {
    id: "p4",
    namaProker: "Pemasangan Plang Petunjuk Arah & Lampu Penerangan Jalan",
    divisi: "Infrastruktur & Lingkungan",
    sasaranWarga: "Masyarakat Umum Dusun 1 & Dusun 3",
    status: "Sedang Berjalan 75%",
    capaianDanOutput:
      "Terpasang 14 plang penunjuk jalan reflektif dan pembersihan saluran drainase sepanjang 300 meter.",
    penanggungJawab: "Dimas & Tim",
  },
];

export interface KknRabItem {
  id: string;
  prokerTerkait: string;
  uraianPengeluaran: string;
  sumberDana: "LPPM Kampus" | "Swadaya Mahasiswa" | "Dana Desa / Mitra" | "Sponsor";
  anggaranRencana: number;
  realisasiPengeluaran: number;
  nomorBuktiNota: string;
}

export const SAMPLE_RAB_ITEMS: KknRabItem[] = [
  {
    id: "rab-1",
    prokerTerkait: "Sosialisasi Sanitasi & Pemilahan Sampah Rumah Tangga",
    uraianPengeluaran: "Pengadaan 10 set tong sampah pilah & cetak 60 booklet sanitasi",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 1500000,
    realisasiPengeluaran: 1425000,
    nomorBuktiNota: "KW/KKN/001",
  },
  {
    id: "rab-2",
    prokerTerkait: "Bimbel Ceria & Pojok Baca Digital Anak Desa",
    uraianPengeluaran: "Rak buku kayu, alat tulis edukasi, dan cetak modul calistung",
    sumberDana: "Swadaya Mahasiswa",
    anggaranRencana: 950000,
    realisasiPengeluaran: 910000,
    nomorBuktiNota: "KW/KKN/002",
  },
  {
    id: "rab-3",
    prokerTerkait: "Digitalisasi Pemasaran & Foto Produk UMKM Keripik Singkong",
    uraianPengeluaran: "Cetak 500 stiker kemasan standing pouch & mini studio box foto produk",
    sumberDana: "Dana Desa / Mitra",
    anggaranRencana: 1200000,
    realisasiPengeluaran: 1150000,
    nomorBuktiNota: "KW/KKN/003",
  },
  {
    id: "rab-4",
    prokerTerkait: "Pemasangan Plang Petunjuk Arah & Lampu Penerangan Jalan",
    uraianPengeluaran: "Plat besi reflektif, tiang pipa galvanis, cat besi, dan semen cor",
    sumberDana: "LPPM Kampus",
    anggaranRencana: 1850000,
    realisasiPengeluaran: 1800000,
    nomorBuktiNota: "KW/KKN/004",
  },
];

export interface KknLuaranWajibItem {
  id: string;
  kategori: string;
  judulLuaran: string;
  targetSpesifikasi: string;
  status: "Tuntas / Terbit" | "Proses Review DPL" | "Penyusunan Draf" | "Belum Dimulai";
  tautanBukti: string;
}

export const DEFAULT_LUARAN_WAJIB_CLEAN: KknLuaranWajibItem[] = [
  {
    id: "lw-1",
    kategori: "Buku Saku / Modul Masyarakat",
    judulLuaran: "",
    targetSpesifikasi: "PDF Ber-ISBN / HKI Kampus • 32 Halaman Full Color",
    status: "Belum Dimulai",
    tautanBukti: "",
  },
  {
    id: "lw-2",
    kategori: "Video Dokumenter & Profil Desa",
    judulLuaran: "",
    targetSpesifikasi: "Resolusi 1080p • Durasi 10–15 Menit • YouTube Resmi",
    status: "Belum Dimulai",
    tautanBukti: "",
  },
  {
    id: "lw-3",
    kategori: "Publikasi Media Massa Online",
    judulLuaran: "",
    targetSpesifikasi: "Portal Berita Nasional / Daerah Terverifikasi Dewan Pers",
    status: "Belum Dimulai",
    tautanBukti: "",
  },
  {
    id: "lw-4",
    kategori: "Artikel Jurnal Pengabdian (SINTA)",
    judulLuaran: "",
    targetSpesifikasi: "Format IMRAD • Target Submit Jurnal Pengabdian SINTA 4",
    status: "Belum Dimulai",
    tautanBukti: "",
  },
  {
    id: "lw-5",
    kategori: "Peta Monografi / Infografis Desa",
    judulLuaran: "",
    targetSpesifikasi: "Banner Cetak A1 Balai Desa & File Vektor",
    status: "Belum Dimulai",
    tautanBukti: "",
  },
];

export const SAMPLE_LUARAN_WAJIB: KknLuaranWajibItem[] = [
  {
    id: "lw-1",
    kategori: "Buku Saku / Modul Masyarakat",
    judulLuaran: "Buku Saku Panduan Pengelolaan Sampah Rumah Tangga & Katalog Digital UMKM Desa Sukamaju",
    targetSpesifikasi: "PDF Ber-ISBN / HKI Kampus • 32 Halaman Full Color",
    status: "Tuntas / Terbit",
    tautanBukti: "https://drive.google.com/drive/folders/buku-saku-kkn-104",
  },
  {
    id: "lw-2",
    kategori: "Video Dokumenter & Profil Desa",
    judulLuaran: "Dokumenter Sinergi KKN-T 104: Transformasi Literasi & Ekonomi Kreatif Desa Sukamaju",
    targetSpesifikasi: "Resolusi 1080p • Durasi 10–15 Menit • YouTube Resmi",
    status: "Tuntas / Terbit",
    tautanBukti: "https://youtube.com/watch?v=kkn104-sukamaju",
  },
  {
    id: "lw-3",
    kategori: "Publikasi Media Massa Online",
    judulLuaran: "Mahasiswa KKN-T 104 Dorong Digitalisasi 8 UMKM Olahan Singkong Tembus E-Commerce",
    targetSpesifikasi: "Portal Berita Nasional / Daerah Terverifikasi Dewan Pers",
    status: "Tuntas / Terbit",
    tautanBukti: "https://kompasiana.com/kkn104-umkm-sukamaju",
  },
  {
    id: "lw-4",
    kategori: "Artikel Jurnal Pengabdian (SINTA)",
    judulLuaran: "Pemberdayaan Ekonomi Pelaku UMKM Desa Sukamaju Melalui Rebranding Kemasan dan Pemasaran Digital",
    targetSpesifikasi: "Format IMRAD • Target Submit Jurnal Pengabdian SINTA 4",
    status: "Proses Review DPL",
    tautanBukti: "https://jurnal.kampus.ac.id/pengabdian/submission/104",
  },
  {
    id: "lw-5",
    kategori: "Peta Monografi / Infografis Desa",
    judulLuaran: "Peta Spasial Sebaran UMKM & Titik Fasilitas Sanitasi Desa Sukamaju",
    targetSpesifikasi: "Banner Cetak A1 Balai Desa & File Vektor",
    status: "Tuntas / Terbit",
    tautanBukti: "Diserahkan ke Kepala Desa Sukamaju (BAST-04)",
  },
];
