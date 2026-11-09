"use client";

import React from "react";
import { toast } from "sonner";
import {
  LogbookEntry,
  LogbookResult,
  StudentProfile,
  TipeKegiatan,
  WeeklyLogbookDayItem,
} from "@/src/lib/exporters/types";
import { MonthlyReportOutput } from "@/src/lib/types/monthlyReport";
import {
  OfflineDraftItem,
  StorageEstimateInfo,
  clearStoredDailyAutoSave,
  getStoredOfflineDrafts,
  getStorageUsageEstimate,
  removeStoredOfflineDraft,
  clearStoredOfflineDrafts,
  saveStoredHistory,
  saveStoredOfflineDraft,
} from "@/src/lib/storage/indexedDbStore";
import {
  STORAGE_HISTORY_KEY,
  STORAGE_QUOTA_KEY,
} from "@/src/lib/config/storageKeys";

/**
 * Handler generate harian/mingguan/bulanan, ekspor docx bulanan, dan
 * antrean draf offline. Sebelumnya closure di app/page.tsx.
 */

interface UseGenerateHandlersDeps {
  isQuotaExhausted: boolean;
  peran: string;
  catatan: string;
  fotoBase64: string | null;
  fotoMimeType: string;
  tone: string;
  tanggalHarian: string;
  tipeKegiatan: TipeKegiatan;
  history: LogbookEntry[];
  isPro: boolean;
  usedQuota: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  ringkasanMingguan: string;
  selectedBulan: string;
  monthlyNotes: string;
  offlineDrafts: OfflineDraftItem[];
  studentProfile: StudentProfile;
  monthlyResult: MonthlyReportOutput | null;
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setResult: React.Dispatch<React.SetStateAction<LogbookResult | null>>;
  setResultPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  setHistory: React.Dispatch<React.SetStateAction<LogbookEntry[]>>;
  setUsedQuota: React.Dispatch<React.SetStateAction<number>>;
  setMonthlyResult: React.Dispatch<React.SetStateAction<MonthlyReportOutput | null>>;
  setWeeklyResults: React.Dispatch<React.SetStateAction<WeeklyLogbookDayItem[]>>;
  setExpandedDayIdx: React.Dispatch<React.SetStateAction<number>>;
  setIsGeneratingMonthly: React.Dispatch<React.SetStateAction<boolean>>;
  setIsExportingMonthlyDocx: React.Dispatch<React.SetStateAction<boolean>>;
  setOfflineDrafts: React.Dispatch<React.SetStateAction<OfflineDraftItem[]>>;
  setStorageInfo: React.Dispatch<React.SetStateAction<StorageEstimateInfo | null>>;
  setMode: React.Dispatch<React.SetStateAction<"daily" | "weekly" | "monthly">>;
  setCatatan: React.Dispatch<React.SetStateAction<string>>;
  setTanggalHarian: React.Dispatch<React.SetStateAction<string>>;
  setFotoBase64: React.Dispatch<React.SetStateAction<string | null>>;
  setRingkasanMingguan: React.Dispatch<React.SetStateAction<string>>;
  setTanggalMulai: React.Dispatch<React.SetStateAction<string>>;
  setTanggalSelesai: React.Dispatch<React.SetStateAction<string>>;
  setSelectedBulan: React.Dispatch<React.SetStateAction<string>>;
  setMonthlyNotes: React.Dispatch<React.SetStateAction<string>>;
  paywallRef: React.RefObject<HTMLDivElement | null>;
  resultRef: React.RefObject<HTMLDivElement | null>;
}

export function useGenerateHandlers(deps: UseGenerateHandlersDeps) {
  const {
    isQuotaExhausted,
    peran,
    catatan,
    fotoBase64,
    fotoMimeType,
    tone,
    tanggalHarian,
    tipeKegiatan,
    history,
    isPro,
    usedQuota,
    tanggalMulai,
    tanggalSelesai,
    ringkasanMingguan,
    selectedBulan,
    monthlyNotes,
    offlineDrafts,
    setErrorMsg,
    setIsLoading,
    setResult,
    setResultPhoto,
    setHistory,
    setUsedQuota,
    setMonthlyResult,
    setWeeklyResults,
    setExpandedDayIdx,
    setIsGeneratingMonthly,
    setIsExportingMonthlyDocx,
    setOfflineDrafts,
  studentProfile,
  monthlyResult,
    setStorageInfo,
    setMode,
    setCatatan,
    setTanggalHarian,
    setFotoBase64,
    setRingkasanMingguan,
    setTanggalMulai,
    setTanggalSelesai,
    setSelectedBulan,
    setMonthlyNotes,
    paywallRef,
    resultRef,
  } = deps;

// Handler Generate Mode Harian (1 Hari) dengan Multimodal Vision
const handleGenerateDaily = async (e?: React.FormEvent) => {
  e?.preventDefault();
  setErrorMsg(null);

  if (isQuotaExhausted) {
    paywallRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  if (!peran.trim()) {
    setErrorMsg("Silakan isi Peran / Posisi Anda terlebih dahulu.");
    return;
  }

  if (!catatan.trim() && !fotoBase64) {
    setErrorMsg(
      "Silakan tulis Catatan Harian Santai atau unggah Foto Dokumentasi Kegiatan terlebih dahulu."
    );
    return;
  }

  // Tangani kondisi offline untuk mahasiswa KKN di pelosok
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await saveStoredOfflineDraft({
      catatan: catatan.trim(),
      tipeKegiatan,
      peran: peran.trim(),
      mode: "daily",
      tanggalHarian,
      fotoBase64: fotoBase64 || undefined,
      fotoMimeType: fotoBase64 ? fotoMimeType : undefined,
      tone,
    });
    const drafts = await getStoredOfflineDrafts();
    setOfflineDrafts(drafts);
    toast.info("📍 Koneksi offline terdeteksi. Catatan harian disimpan sebagai draf offline di IndexedDB.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        catatan: catatan.trim(),
        tipeKegiatan,
        peran: peran.trim(),
        fotoBase64: fotoBase64 || undefined,
        fotoMimeType: fotoBase64 ? fotoMimeType : undefined,
        tone,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload?.error || "Terjadi kesalahan saat menghubungi server AI."
      );
    }

    const generatedData: LogbookResult = payload.data;
    setResult(generatedData);
    setResultPhoto(fotoBase64);

    const selectedDateObj = new Date(tanggalHarian + "T12:00:00");
    const formattedEntryDate = !isNaN(selectedDateObj.getTime())
      ? selectedDateObj.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

    const newEntry: LogbookEntry = {
      id: `${Date.now()}`,
      tanggal: formattedEntryDate,
      tipeKegiatan,
      peran: peran.trim(),
      catatanAsli: catatan.trim(),
      fotoBase64: fotoBase64 || undefined,
      fotoMimeType: fotoBase64 ? fotoMimeType : undefined,
      ...generatedData,
    };

    const updatedHistory = [newEntry, ...history].slice(0, 50);
    setHistory(updatedHistory);
    try {
      localStorage.setItem(
        STORAGE_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
    } catch {
      // Abaikan
    }
    saveStoredHistory(updatedHistory).catch(console.error);
    getStorageUsageEstimate().then(setStorageInfo).catch(() => {});

    if (!isPro) {
      const nextQuota = usedQuota + 1;
      setUsedQuota(nextQuota);
      try {
        localStorage.setItem(STORAGE_QUOTA_KEY, String(nextQuota));
      } catch {
        // Abaikan
      }
    }

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal memproses permintaan. Pastikan koneksi internet stabil.";
    setErrorMsg(message);
  } finally {
    setIsLoading(false);
  }
};

// Handler Generate Mode Borongan (1 Pekan)
const handleGenerateWeekly = async (e?: React.FormEvent) => {
  e?.preventDefault();
  setErrorMsg(null);

  if (isQuotaExhausted) {
    paywallRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  if (!peran.trim()) {
    setErrorMsg("Silakan isi Peran / Posisi Anda terlebih dahulu.");
    return;
  }

  if (!tanggalMulai || !tanggalSelesai) {
    setErrorMsg("Silakan pilih Tanggal Mulai dan Tanggal Selesai pekan ini.");
    return;
  }

  if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
    setErrorMsg(
      "Tanggal Mulai tidak boleh lebih akhir daripada Tanggal Selesai."
    );
    return;
  }

  if (!ringkasanMingguan.trim()) {
    setErrorMsg("Silakan isi Ringkasan Aktivitas Pekan Ini terlebih dahulu.");
    return;
  }

  // Tangani kondisi offline untuk mahasiswa KKN di pelosok
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await saveStoredOfflineDraft({
      catatan: ringkasanMingguan.trim(),
      tipeKegiatan,
      peran: peran.trim(),
      mode: "weekly",
      tanggalMulai,
      tanggalSelesai,
      ringkasanMingguan: ringkasanMingguan.trim(),
    });
    const drafts = await getStoredOfflineDrafts();
    setOfflineDrafts(drafts);
    toast.info("📍 Koneksi offline terdeteksi. Catatan 1 pekan disimpan sebagai draf offline di IndexedDB.");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch("/api/generate-weekly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipeKegiatan,
        peran: peran.trim(),
        tanggalMulai,
        tanggalSelesai,
        ringkasanMingguan: ringkasanMingguan.trim(),
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload?.error ||
          "Terjadi kesalahan saat menyusun logbook 1 pekan penuh."
      );
    }

    const generatedDays: WeeklyLogbookDayItem[] = payload.data || [];
    setWeeklyResults(generatedDays);
    setExpandedDayIdx(0);

    const mappedEntries: LogbookEntry[] = generatedDays.map((day, idx) => ({
      id: `${Date.now()}-${idx}`,
      tanggal: day.tanggal,
      hari: day.hari,
      tahapFase: day.tahap_fase,
      tipeKegiatan,
      peran: peran.trim(),
      catatanAsli: ringkasanMingguan.trim(),
      deskripsiKegiatan: day.deskripsi_kegiatan,
      kompetensiDikembangkan: day.kompetensi_dikembangkan,
      kendalaDihadapi: day.kendala_dihadapi,
      solusiTindakan: day.solusi_tindakan,
      refleksiPembelajaran: day.refleksi_pembelajaran,
    }));

    const updatedHistory = [...mappedEntries, ...history].slice(0, 50);
    setHistory(updatedHistory);
    try {
      localStorage.setItem(
        STORAGE_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );
    } catch {
      // Abaikan
    }
    saveStoredHistory(updatedHistory).catch(console.error);
    getStorageUsageEstimate().then(setStorageInfo).catch(() => {});

    if (!isPro) {
      const nextQuota = usedQuota + 1;
      setUsedQuota(nextQuota);
      try {
        localStorage.setItem(STORAGE_QUOTA_KEY, String(nextQuota));
      } catch {
        // Abaikan
      }
    }

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal memproses logbook mingguan. Pastikan koneksi internet stabil.";
    setErrorMsg(message);
  } finally {
    setIsLoading(false);
  }
};

// Handler Generate Mode Laporan Bulanan (Monev Kemajuan)
const handleGenerateMonthly = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setErrorMsg(null);

  if (isQuotaExhausted) {
    paywallRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await saveStoredOfflineDraft({
      catatan: monthlyNotes.trim(),
      tipeKegiatan,
      peran: peran.trim() || "Mahasiswa Peserta Program",
      mode: "monthly",
      bulanKe: selectedBulan,
    });
    const drafts = await getStoredOfflineDrafts();
    setOfflineDrafts(drafts);
    toast.info("📍 Koneksi offline terdeteksi. Draf laporan bulanan disimpan di IndexedDB.");
    return;
  }

  setIsLoading(true);
  setIsGeneratingMonthly(true);

  try {
    const entriesContext = history.slice(0, 30).map((h) => ({
      tanggal: h.tanggal,
      deskripsiKegiatan: h.deskripsiKegiatan,
      kompetensiDikembangkan: h.kompetensiDikembangkan,
      kendalaDihadapi: h.kendalaDihadapi,
      solusiTindakan: h.solusiTindakan,
      refleksiPembelajaran: h.refleksiPembelajaran,
    }));

    const response = await fetch("/api/generate-monthly", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bulanKe: selectedBulan,
        tipeKegiatan,
        peran: peran.trim() || "Mahasiswa Peserta Program",
        catatanTambahan: monthlyNotes.trim(),
        namaMahasiswa: studentProfile.namaMahasiswa,
        nim: studentProfile.nim,
        namaMitra: studentProfile.namaMitra,
        programStudi: studentProfile.programStudi,
        perguruanTinggi: studentProfile.perguruanTinggi,
        entries: entriesContext,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "Gagal menyusun laporan kemajuan bulanan.");
    }

    setMonthlyResult(payload);
    toast.success("✅ Laporan Bulanan (Monev) berhasil disintesis!");

    if (!isPro) {
      const nextQuota = usedQuota + 1;
      setUsedQuota(nextQuota);
      try {
        localStorage.setItem(STORAGE_QUOTA_KEY, String(nextQuota));
      } catch {}
    }

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  } catch (err: unknown) {
    console.error(err);
    const message =
      err instanceof Error
        ? err.message
        : "Gagal memproses laporan bulanan. Pastikan koneksi internet stabil.";
    setErrorMsg(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
    setIsGeneratingMonthly(false);
  }
};

const handleExportMonthlyDocx = async () => {
  if (!monthlyResult) return;
  setIsExportingMonthlyDocx(true);
  try {
    const { exportMonthlyReportToWord } = await import(
      "@/src/lib/exporters/exportMonthlyReport"
    );
    await exportMonthlyReportToWord(
      monthlyResult,
      studentProfile,
      tipeKegiatan,
      peran.trim() || "Mahasiswa Peserta Program"
    );
    toast.success("📄 Laporan Bulanan (.docx) berhasil diunduh!");
  } catch (err: unknown) {
    console.error("Gagal ekspor laporan bulanan:", err);
    toast.error("Gagal mengekspor laporan bulanan ke format Word.");
  } finally {
    setIsExportingMonthlyDocx(false);
  }
};

const handleProcessOfflineDrafts = async () => {
  if (offlineDrafts.length === 0) return;
  const topDraft = offlineDrafts[0];
  if (topDraft.mode === "daily") {
    setMode("daily");
    setCatatan(topDraft.catatan);
    if (topDraft.tanggalHarian) setTanggalHarian(topDraft.tanggalHarian);
    if (topDraft.fotoBase64) setFotoBase64(topDraft.fotoBase64);
    toast.success("Draf harian dimuat ke formulir. Klik tombol Generate untuk memproses.");
  } else if (topDraft.mode === "weekly") {
    setMode("weekly");
    setRingkasanMingguan(topDraft.ringkasanMingguan || topDraft.catatan);
    if (topDraft.tanggalMulai) setTanggalMulai(topDraft.tanggalMulai);
    if (topDraft.tanggalSelesai) setTanggalSelesai(topDraft.tanggalSelesai);
    toast.success("Draf mingguan dimuat ke formulir. Klik tombol Generate untuk memproses.");
  } else {
    setMode("monthly");
    if (topDraft.bulanKe) setSelectedBulan(topDraft.bulanKe);
    setMonthlyNotes(topDraft.catatan);
    toast.success("Draf bulanan dimuat ke formulir. Klik tombol Generate untuk memproses.");
  }

  await removeStoredOfflineDraft(topDraft.id);
  const remaining = await getStoredOfflineDrafts();
  setOfflineDrafts(remaining);
};

const handleClearOfflineDrafts = async () => {
  await clearStoredOfflineDrafts();
  setOfflineDrafts([]);
  toast.info("Seluruh antrean draf offline telah dibersihkan.");
};

  return {
    handleGenerateDaily,
    handleGenerateWeekly,
    handleGenerateMonthly,
    handleExportMonthlyDocx,
    handleProcessOfflineDrafts,
    handleClearOfflineDrafts,
  };
}
