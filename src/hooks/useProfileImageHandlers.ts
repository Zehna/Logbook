"use client";

import React from "react";
import {
  KampusPreset,
  KAMPUS_PRESETS,
  LogbookEntry,
  StudentProfile,
  TipeKegiatan,
} from "@/src/lib/exporters/types";
import { LicenseInfo } from "@/src/lib/types/modules";
import { PROGRAM_OPTIONS } from "@/src/lib/config/programOptions";
import {
  STORAGE_HISTORY_KEY,
  STORAGE_LICENSE_KEY,
  STORAGE_PROFILE_KEY,
  STORAGE_PRO_KEY,
  STORAGE_QUOTA_KEY,
} from "@/src/lib/config/storageKeys";
import { saveStoredProfile } from "@/src/lib/storage/indexedDbStore";

/**
 * Handler profil/logo/preset/sampel/foto. Sebelumnya closure di
 * app/page.tsx; sekarang hook dengan dependensi eksplisit.
 * handlePresetChange memanggil handleUpdateProfile internal hook.
 */

interface UseProfileImageHandlersDeps {
  studentProfile: StudentProfile;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  peran: string;
  setPeran: React.Dispatch<React.SetStateAction<string>>;
  currentProgramConfig: (typeof PROGRAM_OPTIONS)[number];
  tipeKegiatan: TipeKegiatan;
  enableWatermark: boolean;
  setEnableWatermark: React.Dispatch<React.SetStateAction<boolean>>;
  rawUploadedFile: File | null;
  setCatatan: React.Dispatch<React.SetStateAction<string>>;
  setRingkasanMingguan: React.Dispatch<React.SetStateAction<string>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedPreset: React.Dispatch<React.SetStateAction<KampusPreset>>;
  setUsedQuota: React.Dispatch<React.SetStateAction<number>>;
  setIsPro: React.Dispatch<React.SetStateAction<boolean>>;
  setLicenseDetails: React.Dispatch<React.SetStateAction<LicenseInfo | null>>;
  setHistory: React.Dispatch<React.SetStateAction<LogbookEntry[]>>;
  setRawUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setIsCompressingPhoto: React.Dispatch<React.SetStateAction<boolean>>;
  setFotoBase64: React.Dispatch<React.SetStateAction<string | null>>;
  setFotoMimeType: React.Dispatch<React.SetStateAction<string>>;
  setFotoFileName: React.Dispatch<React.SetStateAction<string | null>>;
  setDetectedPhotoDate: React.Dispatch<
    React.SetStateAction<{ iso: string; formatted: string } | null>
  >;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  triggerToast: (msg: string, description?: string) => void;
}

export function useProfileImageHandlers(deps: UseProfileImageHandlersDeps) {
  const {
    studentProfile,
    setStudentProfile,
    peran,
    setPeran,
    currentProgramConfig,
    tipeKegiatan,
    enableWatermark,
    setEnableWatermark,
    rawUploadedFile,
    setCatatan,
    setRingkasanMingguan,
    setErrorMsg,
    setSelectedPreset,
    setUsedQuota,
    setIsPro,
    setLicenseDetails,
    setHistory,
    setRawUploadedFile,
    setIsCompressingPhoto,
    setFotoBase64,
    setFotoMimeType,
    setFotoFileName,
    setDetectedPhotoDate,
    logoInputRef,
    fileInputRef,
    triggerToast,
  } = deps;

const handleUpdateProfile = (field: keyof StudentProfile, value: string) => {
  setStudentProfile((prev) => {
    const updated = { ...prev, [field]: value };
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // Abaikan
    }
    saveStoredProfile(updated).catch(console.error);
    return updated;
  });
};

const handleLogoUpload = (file: File) => {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setErrorMsg("Format logo kampus harus berupa gambar (PNG atau JPG).");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;
    setStudentProfile((prev) => {
      const updated = {
        ...prev,
        logoKampusBase64: base64,
        logoKampusMimeType: file.type || "image/png",
      };
      try {
        localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      saveStoredProfile(updated).catch(console.error);
      return updated;
    });
    triggerToast("Logo kampus berhasil diunggah dan disimpan!");
  };
  reader.readAsDataURL(file);
};

const handleRemoveLogo = () => {
  setStudentProfile((prev) => {
    const updated = { ...prev };
    delete updated.logoKampusBase64;
    delete updated.logoKampusMimeType;
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    saveStoredProfile(updated).catch(console.error);
    return updated;
  });
  if (logoInputRef.current) logoInputRef.current.value = "";
  triggerToast("Logo kampus berhasil dihapus.");
};

const handlePresetChange = (preset: KampusPreset) => {
  setSelectedPreset(preset);
  handleUpdateProfile("kampusPreset", preset);
  const presetObj = KAMPUS_PRESETS.find((p) => p.value === preset);
  triggerToast(`Pedoman dokumen disetel ke: ${presetObj?.label}`);
};

const handleRefreshWorkspaceFromSync = () => {
  try {
    const savedQuota = localStorage.getItem(STORAGE_QUOTA_KEY);
    const savedPro = localStorage.getItem(STORAGE_PRO_KEY);
    const savedLicense = localStorage.getItem(STORAGE_LICENSE_KEY);
    const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
    const savedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);

    if (savedQuota !== null) setUsedQuota(parseInt(savedQuota, 10) || 0);
    setIsPro(savedPro === "true");
    if (savedLicense) setLicenseDetails(JSON.parse(savedLicense));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setStudentProfile(p);
      if (p.kampusPreset) setSelectedPreset(p.kampusPreset);
    }
    triggerToast("Workspace berhasil disinkronkan kembali!");
  } catch {
    // ignore
  }
};

const handleFillSample = () => {
  if (!peran.trim()) {
    setPeran(currentProgramConfig.roleExamples[0]);
  }
  setCatatan(currentProgramConfig.noteExample);
  setErrorMsg(null);
};

const handleFillWeeklySample = (sampleSummary: string) => {
  if (!peran.trim()) {
    setPeran(currentProgramConfig.roleExamples[0]);
  }
  setRingkasanMingguan(sampleSummary);
  setErrorMsg(null);
};

// Handler Upload Foto Vision (Canvas Smart Compressor & Official Watermark)
const processImageFile = async (file: File, watermarkToggle?: boolean) => {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setErrorMsg("Format file harus berupa gambar (JPG, PNG, atau WebP).");
    return;
  }

  setRawUploadedFile(file);
  setIsCompressingPhoto(true);
  setErrorMsg(null);

  try {
    const shouldUseWatermark =
      watermarkToggle !== undefined ? watermarkToggle : enableWatermark;

    const { compressAndWatermarkImage } = await import(
      "@/src/lib/media/imageProcessor"
    );

    const processed = await compressAndWatermarkImage(file, {
      enableWatermark: shouldUseWatermark,
      identitasText: `${studentProfile.namaMahasiswa || "Mahasiswa"} • NIM: ${
        studentProfile.nim || "-"
      }`,
      instansiText: `${tipeKegiatan} • ${
        studentProfile.namaMitra || "Mitra Industri/Desa"
      }`,
    });

    setFotoBase64(processed.base64);
    setFotoMimeType(processed.mimeType);
    setFotoFileName(file.name);
    setDetectedPhotoDate({
      iso: processed.originalDateIso,
      formatted: processed.originalDateFormatted,
    });
  } catch (err) {
    console.warn("Gagal memproses gambar dengan canvas:", err);
    // Fallback klasik FileReader jika canvas gagal
    const reader = new FileReader();
    reader.onload = () => {
      setFotoBase64(reader.result as string);
      setFotoMimeType(file.type || "image/jpeg");
      setFotoFileName(file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Gagal membaca file gambar. Silakan coba lagi.");
    };
    reader.readAsDataURL(file);
  } finally {
    setIsCompressingPhoto(false);
  }
};

const handleToggleWatermark = (newVal: boolean) => {
  setEnableWatermark(newVal);
  if (rawUploadedFile) {
    processImageFile(rawUploadedFile, newVal);
  }
};

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    processImageFile(file);
  }
};

const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    processImageFile(file);
  }
};

const handleRemovePhoto = () => {
  setFotoBase64(null);
  setFotoFileName(null);
  setRawUploadedFile(null);
  setDetectedPhotoDate(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  return {
    handleUpdateProfile,
    handleLogoUpload,
    handleRemoveLogo,
    handlePresetChange,
    handleRefreshWorkspaceFromSync,
    handleFillSample,
    handleFillWeeklySample,
    processImageFile,
    handleToggleWatermark,
    handleFileChange,
    handleDropImage,
    handleRemovePhoto,
  };
}
