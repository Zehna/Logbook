import type { StudentProfile } from "@/src/lib/exporters/types";
import type { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";

/**
 * Predikat kelulusan dari skor akhir terbobot mentor (0-100).
 * Sebelumnya inline di AdminDocsTab — dipindah ke sini agar bisa diuji unit
 * dan dipakai ulang (naskah IMRAD, kartu skor).
 */
export function getPredikat(score: number): string {
  if (score >= 85) return "Sangat Memuaskan (A)";
  if (score >= 75) return "Memuaskan (B)";
  if (score >= 60) return "Cukup (C)";
  return "Kurang (D)";
}

/** Skor akhir terbobot dari rubrik penilaian mentor (nilai x bobot / 100). */
export function computeTotalWeightedScore(
  scores: MentorAdminData["scores"]
): number {
  return (
    Math.round(
      scores.reduce((acc, curr) => acc + (curr.nilai * curr.bobot) / 100, 0) *
        10
    ) / 10
  );
}

export interface ImradManuscriptInput {
  profile: StudentProfile;
  adminData: MentorAdminData;
  skemaJurnal: "pengabdian" | "terapan";
  judulJurnal: string;
  kataKunci: string;
  masalahMitra: string;
  solusiInovasi: string;
  capaianKuantitatif: string;
  totalWeightedScore: number;
}

/**
 * Naskah draf artikel ilmiah IMRAD/SINTA. Sebelumnya useMemo inline di
 * AdminDocsTab — dipindah verbatim ke sini agar bisa diuji unit.
 */
export function buildImradManuscript({
  profile,
  adminData,
  skemaJurnal,
  judulJurnal,
  kataKunci,
  masalahMitra,
  solusiInovasi,
  capaianKuantitatif,
  totalWeightedScore,
}: ImradManuscriptInput): string {
const namaMhs = profile.namaMahasiswa || "Nama Mahasiswa";
const nimMhs = profile.nim || "NIM";
const prodi = profile.programStudi || "Program Studi Teknik Informatika";
const univ = profile.perguruanTinggi || "Universitas";
const dpl = profile.namaPembimbing || "Dosen Pembimbing Lapangan, M.Kom.";
const mitra = profile.namaMitra || adminData.kopSurat?.namaInstansi || "Instansi Mitra";
const divisi = adminData.divisi || "Divisi Operasional & Teknologi";

return `================================================================================
DRAF MANUSKRIP ARTIKEL ILMIAH (${skemaJurnal === "pengabdian" ? "JURNAL PENGABDIAN MASYARAKAT - STANDAR SINTA" : "JURNAL RISET TERAPAN / KERJA PRAKTIK"})
Format Struktur: IMRAD (Introduction, Methods, Results, and Discussion)
================================================================================

JUDUL ARTIKEL:
${judulJurnal.toUpperCase()}

PENULIS & AFILIASI:
1. ${namaMhs} (${nimMhs}) — ${prodi}, ${univ}
2. ${dpl} — ${prodi}, ${univ} (Corresponding Author)
3. ${adminData.namaMentor} — ${divisi}, ${mitra}

--------------------------------------------------------------------------------
ABSTRAK (BAHASA INDONESIA)
--------------------------------------------------------------------------------
Kegiatan ${skemaJurnal === "pengabdian" ? "pengabdian kepada masyarakat dan kemitraan institusi" : "magang industri dan riset terapan"} pada ${mitra} bertujuan untuk menjawab permasalahan mitra terkait: ${masalahMitra} Metode pelaksanaan yang diterapkan meliputi tahapan observasi kebutuhan lapangan, perancangan solusi sistematis, implementasi bertahap pada ${divisi}, serta evaluasi kinerja berbasis indikator terukur. Solusi utama yang dihadirkan berupa: ${solusiInovasi} Hasil evaluasi pelaksanaan menunjukkan capaian signifikan, yaitu: ${capaianKuantitatif} Selain itu, evaluasi kompetensi dan kinerja pelaksanaan oleh pihak mitra memperoleh skor akhir terbobot sebesar ${totalWeightedScore}/100 dengan predikat "${getPredikat(totalWeightedScore)}". Luaran kegiatan ini diharapkan dapat menjadi rujukan tata kelola berkelanjutan bagi ${mitra}.

Kata Kunci: ${kataKunci}

--------------------------------------------------------------------------------
ABSTRACT (ENGLISH)
--------------------------------------------------------------------------------
This ${skemaJurnal === "pengabdian" ? "community engagement and institutional partnership" : "industrial internship and applied research"} program conducted at ${mitra} aims to address operational challenges within ${divisi}. The primary methodology encompasses field observation, structured solution engineering, iterative deployment, and quantitative performance evaluation. By implementing standardized digital workflows and operational procedures, the program achieved measurable improvements: ${capaianKuantitatif} Furthermore, the official partner evaluation recorded a weighted performance score of ${totalWeightedScore}/100 (${getPredikat(totalWeightedScore)}). These findings demonstrate that structured academic-industry collaboration effectively accelerates operational excellence at ${mitra}.

Keywords: ${kataKunci}

================================================================================
1. PENDAHULUAN (INTRODUCTION)
================================================================================
1.1 Analisis Situasi & Latar Belakang
Sinergi antara perguruan tinggi (${univ}) dengan dunia industri dan instansi mitra (${mitra}) merupakan instrumen krusial dalam mengakselerasi hilirisasi keilmuan ${prodi}. Berdasarkan observasi awal yang dilaksanakan pada ${divisi} di ${mitra}, teridentifikasi sejumlah tantangan operasional yang memerlukan intervensi teknis dan manajerial.

1.2 Permasalahan Mitra
Secara spesifik, permasalahan prioritas yang dihadapi oleh mitra meliputi:
${masalahMitra}

1.3 Tujuan dan Manfaat Kegiatan
Tujuan dari pelaksanaan kegiatan ini adalah merancang, mengimplementasikan, dan mengevaluasi solusi terukur guna meningkatkan efektivitas proses kerja pada ${mitra}, sekaligus memberikan dampak nyata yang terverifikasi secara kuantitatif.

================================================================================
2. METODE PELAKSANAAN (METHODS)
================================================================================
Pelaksanaan kegiatan di ${mitra} menggunakan pendekatan siklus PDCA (Plan-Do-Check-Act) yang terbagi ke dalam 4 (empat) tahapan sistematis:
1. Tahap Observasi & Analisis Kebutuhan (Requirement Gathering): Pemetaan alur kerja eksisting dan wawancara mendalam bersama ${adminData.namaMentor} (${adminData.jabatanMentor}).
2. Tahap Perancangan Solusi (Design & Prototyping): ${solusiInovasi}
3. Tahap Implementasi & Pendampingan (Deployment & Socialization): Penerapan langsung pada lingkungan operasional ${divisi} disertai uji coba pengguna.
4. Tahap Evaluasi & Keberlanjutan (Evaluation): Pengukuran indikator efisiensi dan penilaian kinerja berbasis rubrik 5 aspek standar industri.

================================================================================
3. HASIL DAN PEMBAHASAN (RESULTS AND DISCUSSION)
================================================================================
3.1 Ketercapaian Solusi dan Dampak Kuantitatif
Implementasi program pada ${mitra} berjalan sesuai kerangka acuan kerja yang telah disepakati. Berdasarkan pengukuran data sebelum dan sesudah program berjalan, diperoleh hasil utama sebagai berikut:
${capaianKuantitatif}

3.2 Evaluasi Kinerja Pelaksanaan oleh Instansi Mitra
Sebagai bentuk validasi objektif dari pihak industri/mitra, dilakukan pengukuran terhadap 5 (lima) aspek penilaian utama dengan rincian capaian sebagai berikut:
${adminData.scores
  .map(
(s, i) =>
  `   ${i + 1}. ${s.aspek} (Bobot ${s.bobot}%): Skor ${s.nilai}/100 — ${s.keterangan}`
  )
  .join("\n")}

   -> SKOR AKHIR TERBOBOT : ${totalWeightedScore} / 100
   -> PREDIKAT KELULUSAN  : ${getPredikat(totalWeightedScore)}
   -> CATATAN EVALUATOR   : "${adminData.catatanEvaluasi}"

================================================================================
4. KESIMPULAN DAN SARAN (CONCLUSION)
================================================================================
4.1 Kesimpulan
Program kolaborasi dan implementasi pada ${mitra} telah berhasil menyelesaikan permasalahan mitra melalui ${solusiInovasi.toLowerCase()} Capaian kuantitatif serta skor evaluasi kinerja sebesar ${totalWeightedScore}/100 membuktikan bahwa solusi yang diterapkan relevan dengan kebutuhan riil organisasi.

4.2 Ucapan Terima Kasih (Acknowledgments)
Penulis menyampaikan terima kasih kepada Program Studi ${prodi}, ${univ}, Dosen Pembimbing Lapangan (${dpl}), serta jajaran pimpinan dan tim ${divisi} pada ${mitra} atas dukungan fasilitas dan pendampingan selama kegiatan berlangsung.

================================================================================
DAFTAR PUSTAKA (REFERENCES)
================================================================================
[1] Direktorat Jenderal Pendidikan Tinggi, Riset, dan Teknologi. (2024). Buku Panduan Merdeka Belajar - Kampus Merdeka (MBKM). Jakarta: Kemendikbudristek.
[2] Tim Penyusun Pedoman Akademik. (2025). Pedoman Penulisan Laporan Kerja Praktik, Magang Industri, dan Publikasi Ilmiah Mahasiswa. ${univ}.
[3] Dokumen Prosedur Operasional Standar (SOP) & Laporan Tahunan ${mitra} (${new Date().getFullYear()}).
================================================================================`;
}
