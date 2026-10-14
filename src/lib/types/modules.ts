import { TipeKegiatan, LogbookEntry } from "../exporters/types";

// ==========================================
// 1. TONE HUMANIZER
// ==========================================
export type ToneType = "alami" | "formal" | "korporat";

export interface ToneOption {
  value: ToneType;
  label: string;
  badge: string;
  description: string;
  iconName: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    value: "alami",
    label: "Mahasiswa Alami",
    badge: "Rekomendasi",
    description: "Natural, realistis, santun, dan bebas dari frasa klise robotik AI.",
    iconName: "Sprout",
  },
  {
    value: "formal",
    label: "Akademik Formal",
    badge: "Standar Kampus",
    description: "Baku, berbobot, dan mengacu pada kata kerja operasional Taksonomi Bloom.",
    iconName: "GraduationCap",
  },
  {
    value: "korporat",
    label: "Korporat & Bisnis",
    badge: "Standar Industri",
    description: "Impact-driven, berorientasi KPI, efisiensi kerja, dan profesionalisme kantor.",
    iconName: "Briefcase",
  },
];

// ==========================================
// 2. MODUL KONVERSI 20 SKS
// ==========================================
export interface MatriksSksItem {
  mataKuliah: string;
  sks: number;
  cplTerpenuhi: string;
  aktivitasLogbook: string;
  justifikasiAkademis: string;
  rekomendasiNilai: string;
}

export interface SksMappingResponse {
  totalSksDiajukan: number;
  totalSksDisetujui: number;
  ringkasanJustifikasi: string;
  matriks: MatriksSksItem[];
  rekomendasiUntukDosen: string;
}

// ==========================================
// 3. MODUL ATS RESUME & LINKEDIN
// ==========================================
export interface ResumeBulletItem {
  bulletText: string;
  starFramework: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  actionVerb: string;
  metric: string;
}

export interface LinkedInPostDraft {
  headlineHook: string;
  fullText: string;
  hashtags: string[];
}

export interface TopSkillItem {
  name: string;
  category: "Hard Skill" | "Soft Skill" | "Tools & Teknologi";
  relevance: string;
}

export interface ResumeGeneratorResponse {
  targetRole: string;
  resumeBullets: ResumeBulletItem[];
  linkedInPost: LinkedInPostDraft;
  topSkills: TopSkillItem[];
}

// ==========================================
// 4. MODUL SIMULASI SIDANG DPL
// ==========================================
export interface DefenseQuestionItem {
  id: number;
  kategori: string;
  pertanyaan: string;
  alasanPenguji: string;
  tipsTaktis: string;
  contohJawabanLisan: string;
}

export interface DplSimulatorResponse {
  evaluasiKesiapanSidang: {
    skorPrediksi: number;
    tingkatKesiapan: string;
    catatanUtama: string;
  };
  pertanyaanSidang: DefenseQuestionItem[];
}

// ==========================================
// 5. MODUL TIM KKN DESA
// ==========================================
export interface KknProkerItem {
  id: string;
  namaProker: string;
  divisi: "Kesehatan & Sanitasi" | "Pendidikan & Literasi" | "Infrastruktur & Lingkungan" | "Ekonomi Kreatif & UMKM" | "Teknologi & Informasi" | string;
  sasaranWarga: string;
  status: "Selesai 100%" | "Sedang Berjalan 75%" | "Tahap Persiapan 30%" | "Terkendala";
  capaianDanOutput: string;
  penanggungJawab: string;
}

export interface KknTeamData {
  namaDesa: string;
  kecamatanKabupaten: string;
  namaUnit: string;
  dplNama: string;
  ketuaKelompok: string;
  daftarProker: KknProkerItem[];
}

// ==========================================
// 6. MONETISASI & LISENSI PRO
// ==========================================
export type ProTier = "reguler" | "sultan";

export interface LicenseInfo {
  valid: boolean;
  code: string;
  plan: string;
  tier: ProTier;
  features: string[];
  activatedAt: string;
  expiresAt: string;
  message?: string;
}

export interface VerifyLicensePayload {
  code: string;
}

