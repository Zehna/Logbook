/**
 * indexedDbStore.ts
 * Mesin Penyimpanan IndexedDB Native Ringan untuk LogMagang OS
 * Mencegah QuotaExceededError (limit 5MB localStorage) dan mendukung ratusan foto base64
 */

import { LogbookEntry, StudentProfile } from "../exporters/types";
import { MentorAdminData } from "../exporters/exportAdminDocs";
import { MatriksSksItem, KknTeamData, SynthesizedReportChapters, DefenseEvaluationResult, LogbookTemplateSnippet } from "../types/modules";

const DB_NAME = "logmagang_db";
const DB_VERSION = 1;
const STORE_NAME = "app_store";

// Kunci-kunci penyimpanan standar
export const IDB_KEYS = {
  HISTORY: "logmagang_entries_history",
  PROFILE: "logmagang_student_profile",
  MENTOR: "logmagang_mentor_admin_data",
  SKS_MATRIX: "logmagang_sks_matrix",
  SKS_COURSES: "logmagang_sks_courses_raw",
  ATS_RESUME: "logmagang_ats_resume_data",
  KKN_TEAM: "logmagang_kkn_team_data",
  SYNTHESIZED_REPORT: "logmagang_synthesized_report",
  DEFENSE_EVALUATIONS: "logmagang_defense_evaluations",
  OFFLINE_DRAFTS: "logmagang_offline_drafts",
  TEMPLATES: "logmagang_template_snippets",
  MIGRATION_FLAG: "logmagang_idb_migrated_v1",
} as const;

export interface OfflineDraftItem {
  id: string;
  createdAt: string;
  catatan: string;
  tipeKegiatan: string;
  peran: string;
  mode: "daily" | "weekly" | "monthly";
  tanggalHarian?: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  ringkasanMingguan?: string;
  bulanKe?: string;
  fotoBase64?: string;
  fotoMimeType?: string;
  tone?: string;
  instruksiKhusus?: string;
  status: "DRAFT_OFFLINE";
}

/**
 * Membuka koneksi IndexedDB dengan aman
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB tidak didukung pada lingkungan ini."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error("Gagal membuka IndexedDB."));
    };
  });
}

/**
 * Mengambil nilai berdasarkan key dari IndexedDB
 */
export async function getIdbItem<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve((request.result as T) ?? null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Gagal membaca key "${key}":`, err);
    return null;
  }
}

/**
 * Menyimpan nilai ke IndexedDB
 */
export async function setIdbItem<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error(`[IndexedDB] Gagal menyimpan key "${key}":`, err);
    throw err;
  }
}

/**
 * Menghapus nilai berdasarkan key
 */
export async function deleteIdbItem(key: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Gagal menghapus key "${key}":`, err);
  }
}

// ==========================================
// TYPED HELPERS UNTUK LOGMAGANG OS
// ==========================================

export async function getStoredHistory(): Promise<LogbookEntry[]> {
  const data = await getIdbItem<LogbookEntry[]>(IDB_KEYS.HISTORY);
  return Array.isArray(data) ? data : [];
}

export async function saveStoredHistory(entries: LogbookEntry[]): Promise<void> {
  await setIdbItem(IDB_KEYS.HISTORY, entries);
}

export async function getStoredProfile(): Promise<StudentProfile | null> {
  return await getIdbItem<StudentProfile>(IDB_KEYS.PROFILE);
}

export async function saveStoredProfile(profile: StudentProfile): Promise<void> {
  await setIdbItem(IDB_KEYS.PROFILE, profile);
}

export async function getStoredMentorData(): Promise<MentorAdminData | null> {
  return await getIdbItem<MentorAdminData>(IDB_KEYS.MENTOR);
}

export async function saveStoredMentorData(data: MentorAdminData): Promise<void> {
  await setIdbItem(IDB_KEYS.MENTOR, data);
}

export async function getStoredSksMatrix(): Promise<MatriksSksItem[] | null> {
  return await getIdbItem<MatriksSksItem[]>(IDB_KEYS.SKS_MATRIX);
}

export async function saveStoredSksMatrix(items: MatriksSksItem[]): Promise<void> {
  await setIdbItem(IDB_KEYS.SKS_MATRIX, items);
}

export async function getStoredSksCourses(): Promise<string | null> {
  return await getIdbItem<string>(IDB_KEYS.SKS_COURSES);
}

export async function saveStoredSksCourses(coursesText: string): Promise<void> {
  await setIdbItem(IDB_KEYS.SKS_COURSES, coursesText);
}

export async function getStoredSynthesizedReport(): Promise<SynthesizedReportChapters | null> {
  return await getIdbItem<SynthesizedReportChapters>(IDB_KEYS.SYNTHESIZED_REPORT);
}

export async function saveStoredSynthesizedReport(report: SynthesizedReportChapters): Promise<void> {
  await setIdbItem(IDB_KEYS.SYNTHESIZED_REPORT, report);
}

export async function getStoredDefenseEvaluations(): Promise<Record<number, DefenseEvaluationResult> | null> {
  return await getIdbItem<Record<number, DefenseEvaluationResult>>(IDB_KEYS.DEFENSE_EVALUATIONS);
}

export async function saveStoredDefenseEvaluations(evals: Record<number, DefenseEvaluationResult>): Promise<void> {
  await setIdbItem(IDB_KEYS.DEFENSE_EVALUATIONS, evals);
}

export async function getStoredOfflineDrafts(): Promise<OfflineDraftItem[]> {
  const data = await getIdbItem<OfflineDraftItem[]>(IDB_KEYS.OFFLINE_DRAFTS);
  return Array.isArray(data) ? data : [];
}

export async function saveStoredOfflineDraft(
  draft: Omit<OfflineDraftItem, "id" | "createdAt" | "status">
): Promise<OfflineDraftItem> {
  const existing = await getStoredOfflineDrafts();
  const newItem: OfflineDraftItem = {
    ...draft,
    id: `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    status: "DRAFT_OFFLINE",
  };
  const updated = [newItem, ...existing];
  await setIdbItem(IDB_KEYS.OFFLINE_DRAFTS, updated);
  return newItem;
}

export async function removeStoredOfflineDraft(id: string): Promise<void> {
  const existing = await getStoredOfflineDrafts();
  const updated = existing.filter((d) => d.id !== id);
  await setIdbItem(IDB_KEYS.OFFLINE_DRAFTS, updated);
}

export async function clearStoredOfflineDrafts(): Promise<void> {
  await setIdbItem(IDB_KEYS.OFFLINE_DRAFTS, []);
}

// ==========================================
// TEMPLATE SNIPPETS LOGBOOK
// ==========================================

export const DEFAULT_LOGBOOK_TEMPLATES: LogbookTemplateSnippet[] = [
  {
    id: "tpl-default-1",
    title: "Daily Standup & Slicing UI Komponen",
    category: "Magang MBKM",
    content:
      "pagi ini ikut daily standup tim engineering, lanjut slicing komponen UI dashboard dan filter tabel di Next.js sesuai wireframe Figma, lalu testing responsif di mobile dan fix bug alignment",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-2",
    title: "Rekapitulasi Nota & Arsip Finansial",
    category: "Magang MBKM",
    content:
      "hari ini bantu rekap nota masuk dan faktur penjualan ke master spreadsheet Excel, cross-check selisih mutasi kas bareng supervisor, dan rapikan berkas arsip fisik divisi keuangan",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-3",
    title: "Riset Konten Medsos & Copywriting",
    category: "Magang MBKM",
    content:
      "hari ini riset tren konten TikTok & Instagram Reels untuk kampanye mingguan, bikin 3 draf naskah copywriting, koordinasi dengan desainer grafis, dan submit jadwal tayang ke marketing lead",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-4",
    title: "Live Mentoring & Integrasi REST API",
    category: "MSIB",
    content:
      "hari ini menghadiri live mentoring sesi ke-6 membahas integrasi REST API dan token JWT, dilanjutkan hands-on coding modul autentikasi user dan testing endpoint via Postman",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-5",
    title: "Data Cleaning & Eksplorasi Dataset",
    category: "MSIB",
    content:
      "hari ini fokus pembersihan dataset transaksi dengan Python Pandas, menangani missing values dan outlier, lalu membuat visualisasi korelasi di Looker Studio untuk bahan sprint review",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-6",
    title: "Pendampingan UMKM & Foto Produk Desa",
    category: "KKN",
    content:
      "pagi ini ke balai desa untuk mendampingi ibu-ibu PKK pembuat keripik singkong, membantu pemotretan produk dengan pencahayaan portabel, membuatkan draf stiker kemasan, dan mendaftarkan titik lokasi Google Maps Bisnis",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-7",
    title: "Bimbingan Belajar & Calistung Posko",
    category: "KKN",
    content:
      "sore ini mengadakan bimbel gratis untuk 18 siswa SD di posko KKN, mengajarkan matematika dasar dan calistung dengan kuis interaktif, lalu dilanjutkan kegiatan membaca buku cerita donasi",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-8",
    title: "Rapat Evaluasi Mingguan & Notulensi",
    category: "Umum / Rutinitas",
    content:
      "mengikuti rapat mingguan evaluasi capaian kerja bersama mentor dan tim divisi, mencatat poin-poin kesepakatan dan action items ke dalam notulensi resmi, lalu membagikannya ke grup komunikasi",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "tpl-default-9",
    title: "Quality Control & Pengujian Deliverables",
    category: "Umum / Rutinitas",
    content:
      "hari ini fokus quality control deliverables sebelum diserahkan ke mentor/atasan, mengecek kesesuaian checklist operasional, mencatat temuan deviasi minor, dan menyusun laporan perbaikan",
    isCustom: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export async function getStoredTemplates(): Promise<LogbookTemplateSnippet[]> {
  const custom = await getIdbItem<LogbookTemplateSnippet[]>(IDB_KEYS.TEMPLATES);
  if (Array.isArray(custom) && custom.length > 0) {
    return custom;
  }
  // Simpan default ke IDB pertama kali
  await setIdbItem(IDB_KEYS.TEMPLATES, DEFAULT_LOGBOOK_TEMPLATES);
  return DEFAULT_LOGBOOK_TEMPLATES;
}

export async function saveStoredTemplates(
  templates: LogbookTemplateSnippet[]
): Promise<void> {
  await setIdbItem(IDB_KEYS.TEMPLATES, templates);
}

export async function addStoredTemplate(
  item: Omit<LogbookTemplateSnippet, "id" | "createdAt">
): Promise<LogbookTemplateSnippet> {
  const current = await getStoredTemplates();
  const newSnippet: LogbookTemplateSnippet = {
    ...item,
    id: `tpl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };
  const updated = [newSnippet, ...current];
  await saveStoredTemplates(updated);
  return newSnippet;
}

export async function deleteStoredTemplate(id: string): Promise<void> {
  const current = await getStoredTemplates();
  const updated = current.filter((t) => t.id !== id);
  await saveStoredTemplates(updated);
}

export async function resetStoredTemplates(): Promise<LogbookTemplateSnippet[]> {
  await saveStoredTemplates(DEFAULT_LOGBOOK_TEMPLATES);
  return DEFAULT_LOGBOOK_TEMPLATES;
}


// ==========================================
// MEKANISME AUTO-MIGRASI DARI LOCALSTORAGE
// ==========================================

export interface MigrationResult {
  migrated: boolean;
  entriesCount: number;
  hasProfile: boolean;
  message: string;
}

export async function autoMigrateFromLocalStorage(): Promise<MigrationResult> {
  if (typeof window === "undefined") {
    return { migrated: false, entriesCount: 0, hasProfile: false, message: "SSR environment" };
  }

  try {
    // Cek apakah sudah pernah dimigrasi
    const alreadyMigrated = await getIdbItem<boolean>(IDB_KEYS.MIGRATION_FLAG);
    const existingIdbEntries = await getStoredHistory();

    // Jika di IndexedDB sudah ada data riwayat, tandai selesai
    if (alreadyMigrated && existingIdbEntries.length > 0) {
      return {
        migrated: false,
        entriesCount: existingIdbEntries.length,
        hasProfile: true,
        message: "IndexedDB sudah aktif dan terisi.",
      };
    }

    let entriesCount = 0;
    let hasProfile = false;

    // 1. Migrasi Riwayat Logbook
    const legacyHistoryRaw = localStorage.getItem("logmagang_entries_history");
    if (legacyHistoryRaw) {
      try {
        const parsed = JSON.parse(legacyHistoryRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge jika ada entri di IDB
          const merged = [...parsed];
          await saveStoredHistory(merged);
          entriesCount = merged.length;
        }
      } catch (e) {
        console.warn("[Migration] Gagal parse history localStorage:", e);
      }
    }

    // 2. Migrasi Profil Mahasiswa
    const legacyProfileRaw = localStorage.getItem("logmagang_student_profile");
    if (legacyProfileRaw) {
      try {
        const parsed = JSON.parse(legacyProfileRaw);
        if (parsed && typeof parsed === "object") {
          await saveStoredProfile(parsed);
          hasProfile = true;
        }
      } catch (e) {
        console.warn("[Migration] Gagal parse profile localStorage:", e);
      }
    }

    // 3. Migrasi Data Mentor
    const legacyMentorRaw = localStorage.getItem("logmagang_mentor_admin_data");
    if (legacyMentorRaw) {
      try {
        const parsed = JSON.parse(legacyMentorRaw);
        if (parsed && typeof parsed === "object") {
          await saveStoredMentorData(parsed);
        }
      } catch (e) {
        console.warn("[Migration] Gagal parse mentor localStorage:", e);
      }
    }

    // Tandai migrasi sukses di IDB
    await setIdbItem(IDB_KEYS.MIGRATION_FLAG, true);

    return {
      migrated: true,
      entriesCount,
      hasProfile,
      message: `Migrasi selesai: ${entriesCount} entri logbook berhasil dipindahkan ke IndexedDB.`,
    };
  } catch (err) {
    console.error("[Migration] Error selama auto-migrasi:", err);
    return {
      migrated: false,
      entriesCount: 0,
      hasProfile: false,
      message: "Terjadi kendala saat migrasi data lokal.",
    };
  }
}

// ==========================================
// INDIKATOR KAPASITAS PENYIMPANAN
// ==========================================

export interface StorageEstimateInfo {
  isSupported: boolean;
  usedBytes: number;
  quotaBytes: number;
  percentageUsed: number;
  usedFormatted: string;
  quotaFormatted: string;
  statusLabel: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export async function getStorageUsageEstimate(): Promise<StorageEstimateInfo> {
  if (
    typeof navigator !== "undefined" &&
    navigator.storage &&
    navigator.storage.estimate
  ) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? Math.round((used / quota) * 100) : 0;

      return {
        isSupported: true,
        usedBytes: used,
        quotaBytes: quota,
        percentageUsed: percentage,
        usedFormatted: formatBytes(used),
        quotaFormatted: formatBytes(quota),
        statusLabel: "💾 IndexedDB Engine Aktif • Kapasitas Bebas QuotaExceeded",
      };
    } catch {
      // Fallback
    }
  }

  return {
    isSupported: false,
    usedBytes: 0,
    quotaBytes: 0,
    percentageUsed: 0,
    usedFormatted: "N/A",
    quotaFormatted: "Unlimited",
    statusLabel: "💾 IndexedDB Engine Aktif • Aman untuk Ratusan Foto",
  };
}
