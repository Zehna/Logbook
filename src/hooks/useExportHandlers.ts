"use client";

import React from "react";
import { toast } from "sonner";
import {
  KampusPreset,
  KAMPUS_PRESETS,
  LogbookEntry,
  StudentProfile,
  TipeKegiatan,
} from "@/src/lib/exporters/types";
import { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";
import { saveStoredSynthesizedReport } from "@/src/lib/storage/indexedDbStore";

/**
 * Handler bulk-selection dan ekspor dokumen (PDF/Excel/Word/PPTX +
 * sintesis Bab I-V). Sebelumnya closure di app/page.tsx.
 */

interface UseExportHandlersDeps {
  isBulkSelectionActive: boolean;
  selectedExportEntryIds: string[];
  studentProfile: StudentProfile;
  selectedPreset: KampusPreset;
  mentorAdminData: MentorAdminData | null;
  tipeKegiatan: TipeKegiatan;
  peran: string;
  isPro: boolean;
  setSelectedExportEntryIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsBulkSelectionActive: React.Dispatch<React.SetStateAction<boolean>>;
  setExportingType: React.Dispatch<
    React.SetStateAction<"pdf" | "excel" | "word" | "pptx" | null>
  >;
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  setIsSynthesizingReport: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLivePreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getEntriesForExport: () => LogbookEntry[];
  getSelectedEntriesForExport: () => LogbookEntry[];
  triggerToast: (msg: string, description?: string) => void;
}

export function useExportHandlers(deps: UseExportHandlersDeps) {
  const {
    isBulkSelectionActive,
    selectedExportEntryIds,
    studentProfile,
    selectedPreset,
    mentorAdminData,
    isPro,
    setSelectedExportEntryIds,
    setIsBulkSelectionActive,
    setExportingType,
    setErrorMsg,
    setIsSynthesizingReport,
    setIsLivePreviewOpen,
    getEntriesForExport,
    getSelectedEntriesForExport,
    triggerToast,
  tipeKegiatan,
  peran,
  } = deps;

const handleToggleBulkSelectEntry = (id: string) => {
  setSelectedExportEntryIds((prev) => {
    if (prev.includes(id)) {
      return prev.filter((item) => item !== id);
    } else {
      return [...prev, id];
    }
  });
};

const handleSelectAllExportEntries = () => {
  const all = getEntriesForExport();
  const allIds = all.map((e, idx) => e.id || `entry-${idx}`);
  setSelectedExportEntryIds(allIds);
  toast.info(`Semua ${allIds.length} entri logbook dipilih.`);
};

const handleDeselectAllExportEntries = () => {
  setSelectedExportEntryIds([]);
  toast.info("Pilihan entri logbook dibatalkan (0 dipilih).");
};

const handleSelectRecentExportEntries = (count: number) => {
  const all = getEntriesForExport();
  const sliced = all.slice(0, count);
  const slicedIds = sliced.map((e, idx) => e.id || `entry-${idx}`);
  setSelectedExportEntryIds(slicedIds);
  toast.info(`${slicedIds.length} entri terbaru dipilih.`);
};

const handleToggleBulkSelectionMode = () => {
  const next = !isBulkSelectionActive;
  setIsBulkSelectionActive(next);
  if (next && selectedExportEntryIds.length === 0) {
    const all = getEntriesForExport();
    setSelectedExportEntryIds(all.map((e, idx) => e.id || `entry-${idx}`));
  }
};

const handleOpenLivePreview = () => {
  const entries = getSelectedEntriesForExport();
  if (entries.length === 0) {
    toast.error(
      "Belum ada entri logbook untuk ditampilkan di Live Preview. Silakan generate atau pilih entri terlebih dahulu."
    );
    return;
  }
  setIsLivePreviewOpen(true);
};

const handleExportPdf = async () => {
  const entries = getSelectedEntriesForExport();
  if (entries.length === 0) {
    toast.error("Pilih minimal 1 entri logbook untuk diekspor ke PDF.");
    return;
  }
  setExportingType("pdf");
  try {
    const { exportLogbookToPdf } = await import("@/src/lib/exporters/exportPdf");
    await exportLogbookToPdf(entries, studentProfile, selectedPreset);
    triggerToast(
      `Berhasil mengunduh Dokumen Resmi PDF (.pdf) gabungan berisi ${entries.length} entri ${
        isBulkSelectionActive ? "terpilih" : ""
      }!`
    );
  } catch (err) {
    console.error("Gagal ekspor PDF:", err);
    setErrorMsg("Gagal mengekspor dokumen PDF (.pdf). Silakan coba lagi.");
  } finally {
    setExportingType(null);
  }
};

const handleExportExcel = async () => {
  const entries = getSelectedEntriesForExport();
  if (entries.length === 0) {
    toast.error("Pilih minimal 1 entri logbook untuk diekspor ke Excel.");
    return;
  }
  setExportingType("excel");
  try {
    const { exportLogbookToExcel } = await import("@/src/lib/exporters/exportExcel");
    await exportLogbookToExcel(entries, studentProfile);
    triggerToast(
      `Berhasil mengunduh Rekap Excel (.xlsx) gabungan berisi ${entries.length} entri logbook ${
        isBulkSelectionActive ? "terpilih" : ""
      }!`
    );
  } catch (err) {
    console.error("Gagal ekspor Excel:", err);
    setErrorMsg("Gagal mengekspor file Excel (.xlsx). Silakan coba lagi.");
  } finally {
    setExportingType(null);
  }
};

const handleExportWord = async () => {
  const entries = getSelectedEntriesForExport();
  if (entries.length === 0) {
    toast.error("Pilih minimal 1 entri logbook untuk diekspor ke Word.");
    return;
  }
  setExportingType("word");
  try {
    const { exportLogbookToWord } = await import("@/src/lib/exporters/exportWord");
    await exportLogbookToWord(
      entries,
      studentProfile,
      selectedPreset,
      mentorAdminData || undefined
    );
    const presetObj = KAMPUS_PRESETS.find((p) => p.value === selectedPreset);
    triggerToast(
      `Berhasil mengunduh Laporan Resmi [${presetObj?.label}] (.docx) gabungan berisi ${entries.length} entri ${
        isBulkSelectionActive ? "terpilih" : ""
      }!`
    );
  } catch (err) {
    console.error("Gagal ekspor Word:", err);
    setErrorMsg("Gagal mengekspor dokumen Word (.docx). Silakan coba lagi.");
  } finally {
    setExportingType(null);
  }
};

const handleSynthesizeAndExportWord = async () => {
  const entries = getSelectedEntriesForExport();
  if (entries.length === 0) {
    toast.error("Pilih minimal 1 entri logbook untuk disintesis dan diekspor.");
    return;
  }

  setIsSynthesizingReport(true);
  try {
    // 1. Panggil API Sintesis Bab I - V
    const res = await fetch("/api/synthesize-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentProfile,
        tipeKegiatan,
        peran,
        preset: selectedPreset,
        logbookEntries: entries,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal menyintesis bab laporan akademik.");
    }

    const synthesizedChapters = data.data;

    // 2. Simpan ke IndexedDB
    const { saveStoredSynthesizedReport } = await import("@/src/lib/storage/indexedDbStore");
    await saveStoredSynthesizedReport(synthesizedChapters);

    // 3. Ekspor ke Word (.docx) lengkap dengan bab sintesis
    const { exportLogbookToWord } = await import("@/src/lib/exporters/exportWord");
    await exportLogbookToWord(
      entries,
      studentProfile,
      selectedPreset,
      mentorAdminData || undefined,
      synthesizedChapters
    );

    const presetObj = KAMPUS_PRESETS.find((p) => p.value === selectedPreset);
    triggerToast(
      `🧠 Sukses! Bab I–V berhasil disintesis oleh AI & Laporan Lengkap (.docx) gabungan berisi ${entries.length} entri telah diunduh!`
    );
  } catch (err: unknown) {
    console.error("Gagal sintesis laporan Word:", err);
    const msg = err instanceof Error ? err.message : "Gagal menyintesis naskah laporan akademik.";
    setErrorMsg(msg);
    toast.error(msg);
  } finally {
    setIsSynthesizingReport(false);
  }
};

const handleExportPowerPoint = async () => {
  const entries = getSelectedEntriesForExport();
  if (entries.length === 0) {
    toast.error("Pilih minimal 1 entri logbook untuk diekspor ke PowerPoint.");
    return;
  }
  setExportingType("pptx");
  try {
    const { exportLogbookToPowerPoint } = await import("@/src/lib/exporters/exportPowerPoint");
    await exportLogbookToPowerPoint(
      entries,
      studentProfile,
      mentorAdminData || undefined
    );
    triggerToast(
      `Berhasil mengunduh Slide Presentasi Sidang Akhir (.pptx) gabungan berisi ${entries.length} entri!`
    );
  } catch (err) {
    console.error("Gagal ekspor PowerPoint:", err);
    setErrorMsg(
      "Gagal mengekspor slide presentasi (.pptx). Silakan coba lagi."
    );
  } finally {
    setExportingType(null);
  }
};

  return {
    handleToggleBulkSelectEntry,
    handleSelectAllExportEntries,
    handleDeselectAllExportEntries,
    handleSelectRecentExportEntries,
    handleToggleBulkSelectionMode,
    handleOpenLivePreview,
    handleExportPdf,
    handleExportExcel,
    handleExportWord,
    handleSynthesizeAndExportWord,
    handleExportPowerPoint,
  };
}
