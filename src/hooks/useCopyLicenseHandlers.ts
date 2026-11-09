"use client";

import React from "react";
import { toast } from "sonner";
import { LogbookResult, WeeklyLogbookDayItem } from "@/src/lib/exporters/types";
import { LicenseInfo } from "@/src/lib/types/modules";
import {
  formatDailyLogbookCopy,
  formatWeeklyDayCopy,
  formatWeeklyMarkdown,
} from "@/src/lib/utils/logbookFormatting";
import {
  STORAGE_LICENSE_KEY,
  STORAGE_PRO_KEY,
  STORAGE_QUOTA_KEY,
} from "@/src/lib/config/storageKeys";

/**
 * Handler salin clipboard dan lisensi/kuota Pro. Sebelumnya closure
 * di app/page.tsx.
 */

interface UseCopyLicenseHandlersDeps {
  result: LogbookResult | null;
  weeklyResults: WeeklyLogbookDayItem[];
  tipeKegiatan: string;
  peran: string;
  inlineLicenseCode: string;
  setCopiedSection: React.Dispatch<React.SetStateAction<string | null>>;
  setCopiedAll: React.Dispatch<React.SetStateAction<boolean>>;
  setCopiedDayIdx: React.Dispatch<React.SetStateAction<number | null>>;
  setCopiedWeeklyAll: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPro: React.Dispatch<React.SetStateAction<boolean>>;
  setLicenseDetails: React.Dispatch<React.SetStateAction<LicenseInfo | null>>;
  setUsedQuota: React.Dispatch<React.SetStateAction<number>>;
  setInlineLicenseError: React.Dispatch<React.SetStateAction<string | null>>;
  setInlineLicenseCode: React.Dispatch<React.SetStateAction<string>>;
  setIsInlineVerifying: React.Dispatch<React.SetStateAction<boolean>>;
  triggerToast: (msg: string, description?: string) => void;
}

export function useCopyLicenseHandlers(deps: UseCopyLicenseHandlersDeps) {
  const {
    result,
    weeklyResults,
    tipeKegiatan,
    peran,
    inlineLicenseCode,
    setCopiedSection,
    setCopiedAll,
    setCopiedDayIdx,
    setCopiedWeeklyAll,
    setIsPro,
    setLicenseDetails,
    setUsedQuota,
    setInlineLicenseError,
    setInlineLicenseCode,
    setIsInlineVerifying,
    triggerToast,
  } = deps;

const handleCopySection = async (key: keyof LogbookResult, title: string) => {
  if (!result) return;
  const textToCopy = `${title}\n${result[key]}`;
  try {
    await navigator.clipboard.writeText(textToCopy);
    setCopiedSection(key);
    toast.success(`${title} Berhasil Disalin!`, {
      description: "Teks Taksonomi Bloom siap ditempelkan ke formulir logbook.",
    });
    setTimeout(() => {
      setCopiedSection((prev) => (prev === key ? null : prev));
    }, 2000);
  } catch {
    // Fallback
  }
};

const handleCopyAll = async () => {
  if (!result) return;
  const formattedAll = formatDailyLogbookCopy(result, tipeKegiatan, peran);

  try {
    await navigator.clipboard.writeText(formattedAll);
    setCopiedAll(true);
    toast.success("Logbook Berhasil Disalin!", {
      description: "Format 5 bagian Taksonomi Bloom siap ditempel ke portal.",
    });
    setTimeout(() => setCopiedAll(false), 2500);
  } catch {
    // Fallback
  }
};

const handleCopySingleDayWeekly = async (
  day: WeeklyLogbookDayItem,
  index: number
) => {
  const formattedDay = formatWeeklyDayCopy(day, tipeKegiatan, peran);

  try {
    await navigator.clipboard.writeText(formattedDay);
    setCopiedDayIdx(index);
    toast.success(`Logbook Hari ${day.hari} (${day.tanggal}) Disalin!`, {
      description: "Format Taksonomi Bloom siap ditempel ke formulir portal.",
    });
    setTimeout(() => {
      setCopiedDayIdx((prev) => (prev === index ? null : prev));
    }, 2200);
  } catch {
    // Abaikan
  }
};

const handleCopyAllWeeklyMarkdown = async () => {
  if (weeklyResults.length === 0) return;

  const fullMarkdown = formatWeeklyMarkdown(weeklyResults, tipeKegiatan, peran);

  try {
    await navigator.clipboard.writeText(fullMarkdown);
    setCopiedWeeklyAll(true);
    toast.success("Rekap Mingguan Berhasil Disalin!", {
      description: "Format Markdown 5 hari kerja lengkap dengan taksonomi Bloom tersalin.",
    });
    setTimeout(() => setCopiedWeeklyAll(false), 2500);
  } catch {
    // Abaikan
  }
};

const handleActivateProDemo = () => {
  setIsPro(true);
  try {
    localStorage.setItem(STORAGE_PRO_KEY, "true");
  } catch {
    // Abaikan
  }
};

const handleLicenseActivated = (info: LicenseInfo) => {
  setIsPro(true);
  setLicenseDetails(info);
  setUsedQuota(0);
  setInlineLicenseError(null);
  setInlineLicenseCode("");
  try {
    localStorage.setItem(STORAGE_PRO_KEY, "true");
    localStorage.setItem(STORAGE_LICENSE_KEY, JSON.stringify(info));
    localStorage.setItem(STORAGE_QUOTA_KEY, "0");
  } catch {
    // Abaikan
  }
  triggerToast(`👑 Lisensi Pro (${info.plan}) Berhasil Diaktifkan!`);
};

const handleVerifyInlineLicense = async (codeToVerify?: string) => {
  const code = (codeToVerify || inlineLicenseCode).trim();
  if (!code) {
    setInlineLicenseError("Mohon masukkan kode lisensi Pro Anda.");
    return;
  }

  setIsInlineVerifying(true);
  setInlineLicenseError(null);

  try {
    const res = await fetch("/api/verify-license", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || "Kode lisensi tidak valid.");
    }

    handleLicenseActivated(json.data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
    setInlineLicenseError(msg);
  } finally {
    setIsInlineVerifying(false);
  }
};

const handleResetQuota = () => {
  setUsedQuota(0);
  setIsPro(false);
  setLicenseDetails(null);
  try {
    localStorage.setItem(STORAGE_QUOTA_KEY, "0");
    localStorage.removeItem(STORAGE_PRO_KEY);
    localStorage.removeItem(STORAGE_LICENSE_KEY);
  } catch {
    // Abaikan
  }
};

  return {
    handleCopySection,
    handleCopyAll,
    handleCopySingleDayWeekly,
    handleCopyAllWeeklyMarkdown,
    handleActivateProDemo,
    handleLicenseActivated,
    handleVerifyInlineLicense,
    handleResetQuota,
  };
}
