"use client";

import React from "react";
import { toast } from "sonner";
import {
  LogbookEntry,
  LogbookResult,
  TipeKegiatan,
} from "@/src/lib/exporters/types";
import { KknProkerItem } from "@/src/lib/types/modules";
import {
  getStorageUsageEstimate,
  saveStoredHistory,
  StorageEstimateInfo,
} from "@/src/lib/storage/indexedDbStore";
import { STORAGE_HISTORY_KEY } from "@/src/lib/config/storageKeys";
import {
  buildCanvaPosterDraft as buildCanvaPosterDraftPure,
  buildSheetsTsv,
} from "@/src/lib/utils/logbookFormatting";

/**
 * Handler riwayat (hapus/bersihkan/auto-fix), konversi proker KKN,
 * bridge ekstensi, dan sinkronisasi Drive/Sheets/Canva.
 * Sebelumnya closure di app/page.tsx.
 */

interface UseHistorySyncHandlersDeps {
  history: LogbookEntry[];
  result: LogbookResult | null;
  tipeKegiatan: TipeKegiatan;
  peran: string;
  catatan: string;
  studentProfile: import("@/src/lib/exporters/types").StudentProfile;
  setHistory: React.Dispatch<React.SetStateAction<LogbookEntry[]>>;
  setStorageInfo: React.Dispatch<React.SetStateAction<StorageEstimateInfo | null>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  setFixingEntryId: React.Dispatch<React.SetStateAction<string | null>>;
  setMainTab: React.Dispatch<
    React.SetStateAction<
      | "generator"
      | "sks"
      | "resume"
      | "simulator"
      | "kkn"
      | "admin"
    >
  >;
  setMode: React.Dispatch<React.SetStateAction<"daily" | "weekly" | "monthly">>;
  setTipeKegiatan: React.Dispatch<React.SetStateAction<TipeKegiatan>>;
  setPeran: React.Dispatch<React.SetStateAction<string>>;
  setCatatan: React.Dispatch<React.SetStateAction<string>>;
  setResult: React.Dispatch<React.SetStateAction<LogbookResult | null>>;
  setResultPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  setIsDriveModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDriveSyncStep: React.Dispatch<
    React.SetStateAction<"idle" | "syncing" | "synced">
  >;
  setCopiedSheetsTsv: React.Dispatch<React.SetStateAction<boolean>>;
  setCopiedCanvaDraft: React.Dispatch<React.SetStateAction<boolean>>;
  setCopiedExtensionJson: React.Dispatch<React.SetStateAction<boolean>>;
  setIsExtensionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCanvaBannerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getEntriesForExport: () => LogbookEntry[];
  triggerToast: (msg: string, description?: string) => void;
  resultRef: React.RefObject<HTMLDivElement | null>;
}

export function useHistorySyncHandlers(deps: UseHistorySyncHandlersDeps) {
  const {
    history,
    result,
    tipeKegiatan,
    peran,
    catatan,
    studentProfile,
    setHistory,
    setStorageInfo,
    setErrorMsg,
    setFixingEntryId,
    setMainTab,
    setMode,
    setTipeKegiatan,
    setPeran,
    setCatatan,
    setResult,
    setResultPhoto,
    setIsDriveModalOpen,
    setDriveSyncStep,
    setCopiedSheetsTsv,
    setCopiedCanvaDraft,
    setCopiedExtensionJson,
    setIsExtensionModalOpen,
    setCanvaBannerOpen,
    getEntriesForExport,
    triggerToast,
    resultRef,
  } = deps;

const handleDeleteHistoryEntry = async (id: string) => {
  const updated = history.filter((e) => e.id !== id);
  setHistory(updated);
  try {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  await saveStoredHistory(updated);
  const est = await getStorageUsageEstimate();
  setStorageInfo(est);
  toast.success("Entri logbook berhasil dihapus dari riwayat.");
  triggerToast("Entri logbook berhasil dihapus dari riwayat.");
};

const handleClearAllHistory = async () => {
  setHistory([]);
  try {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  } catch {
    // ignore
  }
  await saveStoredHistory([]);
  const est = await getStorageUsageEstimate();
  setStorageInfo(est);
  toast.success("Seluruh riwayat logbook telah dibersihkan.");
  triggerToast("Seluruh riwayat logbook telah dibersihkan.");
};

// Tahap 4: 1-Click AI Auto-Fix untuk Audit Entri Repetitif/Singkat
const handleAutoFixEntry = async (entry: LogbookEntry) => {
  setFixingEntryId(entry.id);
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        catatan: entry.catatanAsli || entry.deskripsiKegiatan,
        tipeKegiatan: entry.tipeKegiatan as TipeKegiatan,
        peran: entry.peran,
        fotoBase64: entry.fotoBase64 || undefined,
        fotoMimeType: entry.fotoMimeType || undefined,
        tone: "profesional",
        instruksiKhusus:
          "Tulis ulang entri logbook ini dengan kosakata yang segar, kaya variasi verba Taksonomi Bloom (C3-C6), pertegas tantangan operasional dan tindakan problem-solving terukur, serta pastikan panjang deskripsi melebihi 35 kata.",
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Gagal memperbaiki entri logbook.");
    }

    const regenerated: LogbookResult = payload.data;
    const updatedHistory = history.map((item) =>
      item.id === entry.id
        ? {
            ...item,
            ...regenerated,
          }
        : item
    );

    setHistory(updatedHistory);
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch {
      // ignore
    }
    await saveStoredHistory(updatedHistory);
    const est = await getStorageUsageEstimate();
    setStorageInfo(est);
    triggerToast(`✨ Entri logbook ${entry.tanggal} berhasil diperbaiki & divariasikan!`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal memperbaiki logbook.";
    setErrorMsg(msg);
  } finally {
    setFixingEntryId(null);
  }
};

// Tahap 4: Konversi Proker Tim KKN Langsung ke Logbook Harian
const handleConvertToDailyLogbook = (
  proker: KknProkerItem,
  villageInfo: { namaDesa: string; unit: string }
) => {
  setMainTab("generator");
  setMode("daily");
  setTipeKegiatan("KKN");
  setPeran(
    `Tim KKN ${villageInfo.namaDesa ? villageInfo.namaDesa.split(",")[0] : "Desa"} - Divisi ${proker.divisi}`
  );
  setCatatan(
    `Program Kerja: ${proker.namaProker}\nDivisi: ${proker.divisi}\nSasaran Kegiatan: ${proker.sasaranWarga}\nStatus Progres: ${proker.status}\nRealisasi & Capaian: ${proker.capaianDanOutput}\nPenanggung Jawab: ${proker.penanggungJawab}`
  );
  triggerToast(`Proker "${proker.namaProker}" berhasil dimuat ke Form Logbook Harian!`);
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 100);
};

// Tahap 4: Zero-Click Extension Bridge ke Chrome Extension
const handleSyncDirectToExtension = () => {
  const entries = getEntriesForExport();
  if (entries.length === 0) {
    setErrorMsg("Belum ada data logbook untuk dikirim ke ekstensi.");
    return;
  }
  window.postMessage(
    {
      source: "LOGMAGANG_WEB_APP",
      type: "SYNC_TO_EXTENSION",
      payload: { history: entries },
    },
    "*"
  );
  triggerToast(`⚡ Mengirimkan ${entries.length} entri langsung ke Ekstensi Browser...`);
};

const handleLoadHistoryEntry = (entry: LogbookEntry) => {
  setTipeKegiatan(entry.tipeKegiatan as TipeKegiatan);
  setPeran(entry.peran || "");
  setCatatan(entry.catatanAsli || "");
  setResult({
    deskripsiKegiatan: entry.deskripsiKegiatan,
    kompetensiDikembangkan: entry.kompetensiDikembangkan,
    kendalaDihadapi: entry.kendalaDihadapi,
    solusiTindakan: entry.solusiTindakan,
    refleksiPembelajaran: entry.refleksiPembelajaran,
  });
  setResultPhoto(entry.fotoBase64 || null);
  setMode("daily");
  triggerToast(`Entri tanggal ${entry.tanggal} dimuat ke pratinjau!`);
  if (resultRef.current) {
    resultRef.current.scrollIntoView({ behavior: "smooth" });
  }
};

const handleOpenDriveSyncModal = () => {
  setIsDriveModalOpen(true);
  setDriveSyncStep("syncing");
  setTimeout(() => {
    setDriveSyncStep("synced");
  }, 1200);
};

const handleCopySheetsRowTsv = async () => {
  const entries = getEntriesForExport();
  if (entries.length === 0) return;
  const tsv = buildSheetsTsv(entries);
  try {
    await navigator.clipboard.writeText(tsv);
    setCopiedSheetsTsv(true);
    setTimeout(() => setCopiedSheetsTsv(false), 2500);
  } catch {
    // Abaikan
  }
};

const buildCanvaPosterDraft = (): string =>
  buildCanvaPosterDraftPure(getEntriesForExport(), tipeKegiatan, studentProfile);

const handleOpenCanvaPoster = async () => {
  const draft = buildCanvaPosterDraft();
  try {
    await navigator.clipboard.writeText(draft);
    setCopiedCanvaDraft(true);
    setTimeout(() => setCopiedCanvaDraft(false), 3000);
  } catch {
    // Abaikan
  }
  setCanvaBannerOpen(true);
  toast.success("Draf Poster Luaran berhasil disalin ke clipboard!");
};

const handleCopyExtensionJson = async () => {
  const entries = getEntriesForExport();
  const target = entries[0];
  if (!target && !result) {
    setErrorMsg("Belum ada data logbook untuk disalin ke ekstensi.");
    return;
  }

  const logbookPayload = target || {
    tanggal: new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    tipeKegiatan,
    peran: peran || "Mahasiswa Peserta",
    catatanAsli: catatan,
    deskripsiKegiatan: result?.deskripsiKegiatan || "",
    kompetensiDikembangkan: result?.kompetensiDikembangkan || "",
    kendalaDihadapi: result?.kendalaDihadapi || "",
    solusiTindakan: result?.solusiTindakan || "",
    refleksiPembelajaran: result?.refleksiPembelajaran || "",
    jamMulai: "08:00",
    jamSelesai: "17:00",
  };

  try {
    await navigator.clipboard.writeText(
      JSON.stringify(logbookPayload, null, 2)
    );
    setCopiedExtensionJson(true);
    triggerToast("Data JSON untuk Ekstensi Auto-Fill Tersalin!");
    setTimeout(() => setCopiedExtensionJson(false), 2500);
  } catch {
    // fallback
  }
};

const handleDownloadExtension = () => {
  window.location.href = "/api/download-extension";
  setIsExtensionModalOpen(true);
};

  return {
    handleDeleteHistoryEntry,
    handleClearAllHistory,
    handleAutoFixEntry,
    handleConvertToDailyLogbook,
    handleSyncDirectToExtension,
    handleLoadHistoryEntry,
    handleOpenDriveSyncModal,
    handleCopySheetsRowTsv,
    handleOpenCanvaPoster,
    handleCopyExtensionJson,
    handleDownloadExtension,
    buildCanvaPosterDraft,
  };
}
