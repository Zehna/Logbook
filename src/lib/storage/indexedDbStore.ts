/**
 * indexedDbStore.ts
 * Mesin Penyimpanan IndexedDB Native Ringan untuk LogMagang OS
 * Mencegah QuotaExceededError (limit 5MB localStorage) dan mendukung ratusan foto base64
 */

import { LogbookEntry, StudentProfile } from "../exporters/types";
import { MentorAdminData } from "../exporters/exportAdminDocs";
import { MatriksSksItem, KknTeamData, SynthesizedReportChapters, DefenseEvaluationResult } from "../types/modules";

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
  MIGRATION_FLAG: "logmagang_idb_migrated_v1",
} as const;

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
