"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Briefcase,
  FileText,
  Loader2,
  Crown,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Zap,
  Cloud,
  X,
  ExternalLink,
  Calendar,
  Puzzle,
  Download,
  Mic,
  Tent,
  ArrowRightLeft,
  ClipboardCheck,
  Sun,
  Moon,
  User,
} from "lucide-react";

import {
  TipeKegiatan,
  LogbookResult,
  LogbookEntry,
  WeeklyLogbookDayItem,
  StudentProfile,
  DEFAULT_STUDENT_PROFILE,
  KampusPreset,
  KAMPUS_PRESETS,
} from "@/src/lib/exporters/types";
import { AttendanceTracker } from "@/src/components/AttendanceTracker";
import { AdminDocsTab } from "@/src/components/AdminDocsTab";
import { SksConversionTab } from "@/src/components/SksConversionTab";
import { AtsResumeTab } from "@/src/components/AtsResumeTab";
import { DplSimulatorTab } from "@/src/components/DplSimulatorTab";
import { KknTeamTab } from "@/src/components/KknTeamTab";
import {
  ToneType,
  LicenseInfo,
  KknProkerItem,
  LogbookTemplateSnippet,
} from "@/src/lib/types/modules";
import { LicenseModal } from "@/src/components/LicenseModal";

import { SmartIngestionModal } from "@/src/components/SmartIngestionModal";
import { WorkspaceSyncModal } from "@/src/components/WorkspaceSyncModal";
import { AuditHistoryPanel } from "@/src/components/AuditHistoryPanel";
import { TemplateLibraryModal } from "@/src/components/TemplateLibraryModal";
import { AuthLoginModal } from "@/src/components/AuthLoginModal";
import { LivePreviewModal } from "@/src/components/LivePreviewModal";
import { QrScannerModal } from "@/src/components/QrScannerModal";
import { CalendarCompetencyModal } from "@/src/components/CalendarCompetencyModal";
import { auth, getUserFromFirestore, AppUserProfile } from "@/src/lib/firebase/config";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";
import {
  autoMigrateFromLocalStorage,
  getStorageUsageEstimate,
  getStoredHistory,
  saveStoredHistory,
  getStoredProfile,
  saveStoredProfile,
  getStoredMentorData,
  saveStoredMentorData,
  getStoredSksCourses,
  saveStoredSksCourses,
  getStoredOfflineDrafts,
  saveStoredOfflineDraft,
  removeStoredOfflineDraft,
  clearStoredOfflineDrafts,
  getStoredTemplates,
  getStoredDailyAutoSave,
  saveStoredDailyAutoSave,
  clearStoredDailyAutoSave,
  OfflineDraftItem,
  StorageEstimateInfo,
} from "@/src/lib/storage/indexedDbStore";
import { MonthlyReportOutput } from "@/src/lib/types/monthlyReport";
import {
  MAX_FREE_QUOTA,
  STORAGE_HISTORY_KEY,
  STORAGE_LICENSE_KEY,
  STORAGE_PROFILE_KEY,
  STORAGE_PRO_KEY,
  STORAGE_QUOTA_KEY,
} from "@/src/lib/config/storageKeys";
import { getCurrentWeekMondayAndFriday } from "@/src/lib/utils/dates";
import { PROGRAM_OPTIONS } from "@/src/lib/config/programOptions";
import {
  getEntriesForExport as getEntriesForExportPure,
  getSelectedEntriesForExport as getSelectedEntriesForExportPure,
} from "@/src/lib/utils/exportEntries";
import {
  buildCanvaPosterDraft as buildCanvaPosterDraftPure,
  buildSheetsTsv,
  formatDailyLogbookCopy,
  formatWeeklyDayCopy,
  formatWeeklyMarkdown,
} from "@/src/lib/utils/logbookFormatting";
import { WeeklyResultsSection } from "@/src/components/WeeklyResultsSection";
import { MonthlyResultsSection } from "@/src/components/MonthlyResultsSection";
import { DailyResultSection } from "@/src/components/DailyResultSection";
import { DailyFormCard } from "@/src/components/DailyFormCard";
import { ExportHub } from "@/src/components/ExportHub";


export default function HomePage() {
  const [mainTab, setMainTab] = useState<
    "generator" | "sks" | "resume" | "simulator" | "kkn" | "admin"
  >("generator");
  const [mode, setMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [tone, setTone] = useState<ToneType>("alami");

  const [tipeKegiatan, setTipeKegiatan] = useState<TipeKegiatan>("Magang MBKM");
  const [peran, setPeran] = useState<string>("");

  // State Mode Harian & Vision
  const [tanggalHarian, setTanggalHarian] = useState<string>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [catatan, setCatatan] = useState<string>("");
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null);
  const [areAllSectionsCollapsed, setAreAllSectionsCollapsed] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const catatanRef = useRef<string>("");
  const lastSavedCatatanRef = useRef<string>("");
  const [result, setResult] = useState<LogbookResult | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [fotoMimeType, setFotoMimeType] = useState<string>("image/jpeg");
  const [fotoFileName, setFotoFileName] = useState<string | null>(null);
  const [resultPhoto, setResultPhoto] = useState<string | null>(null);
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);
  const [detectedPhotoDate, setDetectedPhotoDate] = useState<{
    iso: string;
    formatted: string;
  } | null>(null);
  const [rawUploadedFile, setRawUploadedFile] = useState<File | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [isSynthesizingReport, setIsSynthesizingReport] = useState<boolean>(false);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");

  // State Mode Borongan (1 Pekan)
  const defaultWeek = getCurrentWeekMondayAndFriday();
  const [tanggalMulai, setTanggalMulai] = useState<string>(defaultWeek.monday);
  const [tanggalSelesai, setTanggalSelesai] = useState<string>(
    defaultWeek.friday
  );
  const [ringkasanMingguan, setRingkasanMingguan] = useState<string>("");
  const [weeklyResults, setWeeklyResults] = useState<WeeklyLogbookDayItem[]>(
    []
  );
  const [expandedDayIdx, setExpandedDayIdx] = useState<number>(0);
  const [copiedDayIdx, setCopiedDayIdx] = useState<number | null>(null);
  const [copiedWeeklyAll, setCopiedWeeklyAll] = useState<boolean>(false);

  // State Mode Laporan Bulanan (Monev)
  const [selectedBulan, setSelectedBulan] = useState<string>("Bulan 1 (Pekan 1-4)");
  const [monthlyNotes, setMonthlyNotes] = useState<string>("");
  const [monthlyResult, setMonthlyResult] = useState<MonthlyReportOutput | null>(null);
  const [isGeneratingMonthly, setIsGeneratingMonthly] = useState<boolean>(false);
  const [isExportingMonthlyDocx, setIsExportingMonthlyDocx] = useState<boolean>(false);
  const [copiedMonthlyField, setCopiedMonthlyField] = useState<string | null>(null);

  // State Offline Resilience untuk Mahasiswa KKN di Pelosok
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineDrafts, setOfflineDrafts] = useState<OfflineDraftItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<LogbookEntry[]>([]);

  // Biodata / Profil Mahasiswa untuk Cover Word, Header Excel & Slide PPTX
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(
    DEFAULT_STUDENT_PROFILE
  );
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);

  // State kuota lokal (LocalStorage)
  const [usedQuota, setUsedQuota] = useState<number>(0);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // State copy clipboard Mode Harian
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // State Dokumen & Export Hub
  const [exportingType, setExportingType] = useState<
    "pdf" | "excel" | "word" | "pptx" | null
  >(null);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(
    null
  );
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [driveSyncStep, setDriveSyncStep] = useState<
    "idle" | "syncing" | "synced"
  >("idle");
  const [copiedSheetsTsv, setCopiedSheetsTsv] = useState<boolean>(false);
  const [canvaBannerOpen, setCanvaBannerOpen] = useState<boolean>(false);
  const [copiedCanvaDraft, setCopiedCanvaDraft] = useState<boolean>(false);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState<boolean>(false);
  const [copiedExtensionJson, setCopiedExtensionJson] = useState<boolean>(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState<boolean>(false);
  const [licenseDetails, setLicenseDetails] = useState<LicenseInfo | null>(null);
  const [inlineLicenseCode, setInlineLicenseCode] = useState<string>("");
  const [isInlineVerifying, setIsInlineVerifying] = useState<boolean>(false);
  const [inlineLicenseError, setInlineLicenseError] = useState<string | null>(null);

  // New Enterprise States: Smart Ingestion, Workspace Sync, & Kampus Preset
  const [isSmartIngestionOpen, setIsSmartIngestionOpen] = useState<boolean>(false);
  const [isWorkspaceSyncOpen, setIsWorkspaceSyncOpen] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<KampusPreset>("dikti");

  // Tahap 4: Unified Cross-Tab Data Pipeline & IndexedDB States
  const [mentorAdminData, setMentorAdminData] = useState<MentorAdminData | null>(null);
  const [sksCoursesContext, setSksCoursesContext] = useState<string>("");
  const [fixingEntryId, setFixingEntryId] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageEstimateInfo | null>(null);
  const [extensionSyncAck, setExtensionSyncAck] = useState<boolean>(false);

  // Template Snippets Library State
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState<boolean>(false);
  const [templateSnippets, setTemplateSnippets] = useState<LogbookTemplateSnippet[]>([]);

  // Firebase Authentication & Firestore User State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<AppUserProfile | null>(null);
  const [currentFbUser, setCurrentFbUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Tahap 6: Dark Mode / Night Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Bulk Selection & Merged Export States
  const [isBulkSelectionActive, setIsBulkSelectionActive] = useState<boolean>(false);
  const [selectedExportEntryIds, setSelectedExportEntryIds] = useState<string[]>([]);
  const [bulkExportSearchQuery, setBulkExportSearchQuery] = useState<string>("");
  const [bulkExportFilterType, setBulkExportFilterType] = useState<string>("all");

  // Live Preview Modal State
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState<boolean>(false);

  // QR Scanner Modal State
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Calendar Heatmap, Competency & E-Paraf Hub Modal State
  const [isCalendarHubOpen, setIsCalendarHubOpen] = useState<boolean>(false);
  const [calendarHubTab, setCalendarHubTab] = useState<"calendar" | "competency" | "signature">("calendar");

  // Listener Autentikasi Firebase & Profil Lokal
  useEffect(() => {
    // Muat profil lokal yang tersimpan jika ada
    if (typeof window !== "undefined") {
      const savedLocal = localStorage.getItem("logmagang_local_user");
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          setCurrentUserProfile(parsed);
          setStudentProfile((prev) => ({
            ...prev,
            namaMahasiswa: parsed.displayName || prev.namaMahasiswa,
            nim: parsed.nim || prev.nim,
            perguruanTinggi: parsed.campus || prev.perguruanTinggi,
            programStudi: parsed.prodi || prev.programStudi,
          }));
        } catch {
          // ignore corrupted local user
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentFbUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserFromFirestore(fbUser.uid);
          if (profile) {
            setCurrentUserProfile(profile);
            if (typeof window !== "undefined") {
              localStorage.setItem("logmagang_local_user", JSON.stringify(profile));
            }
            setStudentProfile((prev) => ({
              ...prev,
              namaMahasiswa: profile.displayName || prev.namaMahasiswa,
              nim: profile.nim || prev.nim,
              perguruanTinggi: profile.campus || prev.perguruanTinggi,
              programStudi: profile.prodi || prev.programStudi,
            }));
          } else {
            const fallbackProfile: AppUserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || "Mahasiswa MBKM",
              email: fbUser.email || "",
              photoURL: fbUser.photoURL || "",
            };
            setCurrentUserProfile(fallbackProfile);
            if (typeof window !== "undefined") {
              localStorage.setItem("logmagang_local_user", JSON.stringify(fallbackProfile));
            }
          }
        } catch (e) {
          console.warn("Gagal fetch user profile dari Firestore:", e);
        }
      } else {
        // Jika tidak ada user Firebase, cek apakah user sedang login dengan profil lokal
        if (typeof window !== "undefined") {
          const savedLocal = localStorage.getItem("logmagang_local_user");
          if (!savedLocal) {
            setCurrentUserProfile(null);
          }
        } else {
          setCurrentUserProfile(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("logmagang_theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("logmagang_theme", "dark");
      } catch {}
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("logmagang_theme", "light");
      } catch {}
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const paywallRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      const savedQuota = localStorage.getItem(STORAGE_QUOTA_KEY);
      const savedPro = localStorage.getItem(STORAGE_PRO_KEY);
      const savedLicense = localStorage.getItem(STORAGE_LICENSE_KEY);
      const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
      const savedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);

      if (savedQuota !== null) {
        const parsed = parseInt(savedQuota, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          setUsedQuota(parsed);
        }
      }
      if (savedPro === "true") {
        setIsPro(true);
      }
      if (savedLicense) {
        try {
          const parsedLicense = JSON.parse(savedLicense);
          setLicenseDetails(parsedLicense);
        } catch {
          // ignore
        }
      }
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            setHistory(parsedHistory);
          }
        } catch {
          // ignore
        }
      }
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && typeof parsedProfile === "object") {
            setStudentProfile((prev) => ({ ...prev, ...parsedProfile }));
            if (parsedProfile.kampusPreset) {
              setSelectedPreset(parsedProfile.kampusPreset);
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // Abaikan jika akses localStorage dibatasi
    } finally {
      setIsHydrated(true);
    }

    // Inisialisasi & Auto-Migrasi ke IndexedDB Native Engine
    (async () => {
      try {
        await autoMigrateFromLocalStorage();
        const [idbHistory, idbProfile, idbMentor, idbCourses, idbTemplates, idbDailyAutoSave] = await Promise.all([
          getStoredHistory(),
          getStoredProfile(),
          getStoredMentorData(),
          getStoredSksCourses(),
          getStoredTemplates(),
          getStoredDailyAutoSave(),
        ]);

        if (!isMounted) return;

        if (idbHistory && idbHistory.length > 0) {
          setHistory(idbHistory);
        }
        if (idbProfile) {
          setStudentProfile((prev) => ({ ...prev, ...idbProfile }));
          if (idbProfile.kampusPreset) {
            setSelectedPreset(idbProfile.kampusPreset);
          }
        }
        if (idbMentor) {
          setMentorAdminData(idbMentor);
        }
        if (idbCourses) {
          setSksCoursesContext(idbCourses);
        }
        if (idbTemplates && idbTemplates.length > 0) {
          setTemplateSnippets(idbTemplates);
        }
        if (idbDailyAutoSave && idbDailyAutoSave.catatan.trim()) {
          setCatatan((prev) => (prev.trim() ? prev : idbDailyAutoSave.catatan));
          catatanRef.current = idbDailyAutoSave.catatan;
          lastSavedCatatanRef.current = idbDailyAutoSave.catatan;
          const parsedTime = new Date(idbDailyAutoSave.updatedAt);
          if (!isNaN(parsedTime.getTime())) {
            setLastAutoSavedAt(
              parsedTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            );
          }
        }

        const est = await getStorageUsageEstimate();
        const drafts = await getStoredOfflineDrafts();
        if (isMounted) {
          setStorageInfo(est);
          setOfflineDrafts(drafts);
        }
      } catch (err) {
        console.warn("IndexedDB bootstrap warning:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sinkronisasi ref catatan terbaru agar interval 30 detik tidak ter-reset setiap ketikan
  useEffect(() => {
    catatanRef.current = catatan;
  }, [catatan]);

  // Auto-save catatan ke IndexedDB setiap 30 detik pada mode 'daily'
  useEffect(() => {
    if (mode !== "daily") return;

    const autoSaveInterval = setInterval(async () => {
      const currentCatatan = catatanRef.current;
      if (currentCatatan === lastSavedCatatanRef.current) return;

      try {
        if (currentCatatan.trim()) {
          const savedDraft = await saveStoredDailyAutoSave(currentCatatan);
          lastSavedCatatanRef.current = currentCatatan;
          const timeFormatted = new Date(savedDraft.updatedAt).toLocaleTimeString(
            "id-ID",
            {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }
          );
          setLastAutoSavedAt(timeFormatted);
        } else {
          await clearStoredDailyAutoSave();
          lastSavedCatatanRef.current = "";
          setLastAutoSavedAt(null);
        }
      } catch (err) {
        console.warn("Gagal menyimpan otomatis catatan harian ke IndexedDB:", err);
      }
    }, 30000);

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [mode]);

  const refreshTemplateSnippets = async () => {
    try {
      const data = await getStoredTemplates();
      setTemplateSnippets(data);
    } catch (e) {
      console.warn("Gagal memuat template snippets:", e);
    }
  };

  const handleSelectTemplateSnippet = (
    snippet: string,
    insertMode: "replace" | "append" = "replace"
  ) => {
    if (insertMode === "append" && catatan.trim()) {
      setCatatan((prev) => `${prev.trim()}\n${snippet}`);
    } else {
      setCatatan(snippet);
    }
  };

  // Listener Status Koneksi Online / Offline untuk Mahasiswa KKN di Pelosok
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const drafts = await getStoredOfflineDrafts();
      setOfflineDrafts(drafts);
      toast.success("🌐 Anda kembali online. Sinkronisasi draf siap dijalankan.");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("⚠️ Koneksi internet terputus. Mode pencatatan draf offline aktif.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listener Konfirmasi Live Bridge Ekstensi Chrome
  useEffect(() => {
    const handleExtensionAck = (event: MessageEvent) => {
      if (event.data && event.data.source === "LOGMAGANG_EXTENSION_ACK") {
        setExtensionSyncAck(true);
        triggerToast(`⚡ Ekstensi berhasil menerima ${event.data.count || 0} entri secara live!`);
        setTimeout(() => setExtensionSyncAck(false), 3000);
      }
    };
    window.addEventListener("message", handleExtensionAck);
    return () => window.removeEventListener("message", handleExtensionAck);
  }, []);

  const remainingQuota = Math.max(0, MAX_FREE_QUOTA - usedQuota);
  const isQuotaExhausted = !isPro && usedQuota >= MAX_FREE_QUOTA;

  const currentProgramConfig =
    PROGRAM_OPTIONS.find((item) => item.value === tipeKegiatan) ||
    PROGRAM_OPTIONS[0];

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

  // Daftar entri yang akan diekspor ke Excel, Word, dan PowerPoint
  const getEntriesForExport = (): LogbookEntry[] =>
    getEntriesForExportPure({
      history,
      weeklyResults,
      result,
      resultPhoto,
      fotoMimeType,
      tipeKegiatan,
      peran,
    });

  // Mendapatkan entri yang terpilih (baik seluruhnya atau subset hasil bulk selection)
  const getSelectedEntriesForExport = (): LogbookEntry[] =>
    getSelectedEntriesForExportPure(
      getEntriesForExport(),
      isBulkSelectionActive,
      selectedExportEntryIds
    );
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

  const triggerToast = (msg: string, description?: string) => {
    toast.success(msg, { description });
    setExportSuccessToast(msg);
    setTimeout(() => {
      setExportSuccessToast((prev) => (prev === msg ? null : prev));
    }, 3500);
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

  const getCombinedLogbookText = () => {
    if (history.length > 0) {
      return history
        .slice(0, 10)
        .map(
          (h, i) =>
            `[Hari #${i + 1} - ${h.tanggal}] (${h.peran})\n- Deskripsi: ${h.deskripsiKegiatan}\n- Kompetensi: ${h.kompetensiDikembangkan}\n- Kendala: ${h.kendalaDihadapi}\n- Solusi: ${h.solusiTindakan}\n- Refleksi: ${h.refleksiPembelajaran}`
        )
        .join("\n\n");
    }
    if (weeklyResults.length > 0) {
      return weeklyResults
        .map(
          (w, i) =>
            `[Hari #${i + 1} - ${w.hari}, ${w.tanggal}] (${w.tahap_fase})\n- Deskripsi: ${w.deskripsi_kegiatan}\n- Kompetensi: ${w.kompetensi_dikembangkan}\n- Kendala: ${w.kendala_dihadapi}\n- Solusi: ${w.solusi_tindakan}\n- Refleksi: ${w.refleksi_pembelajaran}`
        )
        .join("\n\n");
    }
    if (result) {
      return `[Logbook Terkini - ${tipeKegiatan}] (${peran})\n- Deskripsi: ${result.deskripsiKegiatan}\n- Kompetensi: ${result.kompetensiDikembangkan}\n- Kendala: ${result.kendalaDihadapi}\n- Solusi: ${result.solusiTindakan}\n- Refleksi: ${result.refleksiPembelajaran}`;
    }
    return catatan || "";
  };

  const hasAnyOutput =
    (mode === "daily" && result !== null) ||
    (mode === "weekly" && weeklyResults.length > 0) ||
    (mode === "monthly" && monthlyResult !== null) ||
    result !== null ||
    weeklyResults.length > 0 ||
    monthlyResult !== null ||
    history.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Navbar & Sticky Glass Header (Midday / Dub Style) */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                LogMagang OS
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                Workspace Magang & KKN
              </span>
            </div>
          </div>

          {/* Sederhanakan tombol di kanan: Backup & Sync, Lencana Pro Monokrom Halus, Dark/Light Mode */}
          {isHydrated && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWorkspaceSyncOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
                title="Cadangan & Sinkronisasi JSON"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="hidden sm:inline">Backup & Sync</span>
              </button>

              {isPro ? (
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 transition cursor-pointer"
                  title="Klik untuk melihat detail Lisensi Pro Anda"
                >
                  <Crown className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                  <span>
                    {licenseDetails?.tier === "sultan" ? "Sultan Pro" : "Pro Plan"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
                  title="Klik untuk upgrade ke LogMagang Pro"
                >
                  <Zap className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Kuota: {remainingQuota}/{MAX_FREE_QUOTA}
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">Upgrade</span>
                </button>
              )}

              {/* User Login / Profile Pill Button */}
              {currentUserProfile ? (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer max-w-[170px]"
                  title={`Akun Mahasiswa: ${currentUserProfile.displayName} (${currentUserProfile.email})`}
                >
                  {currentUserProfile.photoURL ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={currentUserProfile.photoURL}
                      alt={currentUserProfile.displayName}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {currentUserProfile.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate">{currentUserProfile.displayName.split(" ")[0]}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Tersambung ke Firestore Database" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-2xs"
                  title="Masuk dengan Akun Google (Tersimpan di Cloud Database)"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </button>
              )}

              {/* Tombol Toggle Dark Mode */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
                title={isDarkMode ? "Beralih ke Tema Terang (Light Mode)" : "Beralih ke Tema Gelap (Dark Mode)"}
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-zinc-300" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-600" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* 6 Tabs Navigation Bar (Dub.co Minimalist Underline Style) */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs relative">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: "generator", label: "Generator & Dokumen", icon: FileText, count: history.length > 0 ? history.length : undefined },
              { id: "sks", label: "Konversi 20 SKS", icon: GraduationCap },
              { id: "resume", label: "CV ATS & LinkedIn", icon: Briefcase },
              { id: "simulator", label: "Simulasi Sidang DPL", icon: Mic },
              { id: "kkn", label: "Tim KKN Desa", icon: Tent },
              { id: "admin", label: "Berkas & Penilaian", icon: ClipboardCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = mainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMainTab(tab.id as typeof mainTab)}
                  className={`inline-flex items-center gap-2 py-2.5 px-2 sm:px-0 text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer border-b-2 -mb-px group ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-5 pb-14 space-y-6">
        {mainTab === "generator" && (
          <>
            {/* Banner Ajakan Masuk / Sinkronisasi Cloud Firestore jika Belum Login */}
            {!currentUserProfile && isHydrated && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 text-xs shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Sinkronkan Identitas Mahasiswa & Logbook ke Cloud Database
                    </p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Masuk dengan akun Google untuk menyimpan profil dan riwayat logbook secara aman di Firestore.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-2xs shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Masuk Akun</span>
                </button>
              </div>
            )}

            {/* Attendance Tracker & Heatmap Kehadiran 900 Jam MBKM (GitHub/Linear Strip Style) */}
            <AttendanceTracker
              history={history}
              isPro={isPro}
              remainingQuota={remainingQuota}
              maxFreeQuota={MAX_FREE_QUOTA}
              planName={
                licenseDetails?.tier === "sultan"
                  ? "Sultan Pro MBKM"
                  : licenseDetails?.plan || "Member Pro 3 Bulan"
              }
              onOpenUpgradeModal={() => setIsLicenseModalOpen(true)}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
              onOpenCalendarHub={(tab = "calendar") => {
                setCalendarHubTab(tab);
                setIsCalendarHubOpen(true);
              }}
              onSelectDateToBackfill={(isoDate, displayDate) => {
                setMode("daily");
                setTanggalHarian(isoDate);
                toast.info(`Form disetel untuk tanggal ${displayDate}`, {
                  description: "Silakan lengkapi catatan kegiatan atau unggah foto dokumentasi.",
                });
                const formElem = document.getElementById("daily-form-card");
                if (formElem) {
                  formElem.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />

            {/* Kartu Ajakan Aktivasi Langganan (Ditampilkan saat kuota 3x habis) */}
            {isHydrated && isQuotaExhausted && (
              <section
                ref={paywallRef}
                className="rounded-xl bg-zinc-900 text-white p-5 sm:p-6 border border-zinc-800 shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium">
                    <Crown className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Kuota Gratis 3/3 Telah Terpakai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLicenseModalOpen(true)}
                      className="text-xs text-zinc-300 hover:text-white underline cursor-pointer"
                    >
                      Lihat Detail Paket
                    </button>
                    <span className="text-zinc-600">•</span>
                    <button
                      type="button"
                      onClick={handleResetQuota}
                      title="Reset kuota gratis untuk keperluan pengujian"
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Demo
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    Upgrade ke LogMagang Pro
                  </h2>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed max-w-xl">
                    Buka akses tanpa batas untuk logbook harian, mode borongan, konversi SKS, dan ekspor dokumen resmi:
                  </p>
                </div>

                {/* 2 Pilihan Kartu Paket */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Paket Reguler */}
                  <div className="rounded-lg p-3.5 bg-zinc-800/60 border border-zinc-700/80 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200">
                          Paket Reguler Magang
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300">
                          3 Bulan
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">Rp25.000</span>
                        <span className="text-xs text-zinc-400"> / periode</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Ideal untuk logbook harian rutin dan bebas tugas nunggak.
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                        "Halo Admin LogMagang! Saya ingin beli Paket Reguler Magang (Rp25.000) via QRIS."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-md bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-xs text-center border border-zinc-600 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Beli via QRIS (Rp25.000)</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>

                  {/* Paket Sultan */}
                  <div className="rounded-lg p-3.5 bg-zinc-800/90 border border-zinc-600 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Paket Sultan Lulus MBKM</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 font-semibold">
                          Full Fitur
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-xl font-bold text-white">Rp49.000</span>
                        <span className="text-xs text-zinc-400"> / periode</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Seluruh fitur OS lengkap: logbook, konversi SKS, CV ATS, hingga sidang.
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                        "Halo Admin LogMagang! Saya ingin beli Paket Sultan Lulus MBKM (Rp49.000) via QRIS."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs text-center transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Beli via QRIS (Rp49.000)</span>
                      <ExternalLink className="w-3 h-3 text-zinc-600" />
                    </a>
                  </div>
                </div>

                {/* Form Input Kode Lisensi Langsung */}
                <div className="rounded-lg p-3 bg-zinc-800/40 border border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Sudah punya lisensi? Masukkan kode:</span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inlineLicenseCode}
                      onChange={(e) => setInlineLicenseCode(e.target.value.toUpperCase())}
                      placeholder="Contoh: LMPRO-2026-BERES"
                      className="flex-1 text-xs font-mono font-medium uppercase p-2 rounded-md border border-zinc-700 bg-zinc-950 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyInlineLicense()}
                      disabled={isInlineVerifying}
                      className="px-4 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isInlineVerifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-900" />
                          <span>Verifikasi...</span>
                        </>
                      ) : (
                        <span>Aktivasi</span>
                      )}
                    </button>
                  </div>

                  {inlineLicenseError && (
                    <p className="text-xs text-rose-300 bg-rose-950/40 border border-rose-800 p-2 rounded-md">
                      {inlineLicenseError}
                    </p>
                  )}

                  {/* Preset Kode Demo Cepat untuk Pengujian */}
                  <div className="pt-1.5 border-t border-zinc-800 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-zinc-500 mr-1">
                      Kode Demo:
                    </span>
                    {["LMPRO-2026-BERES", "LMPRO-SULTAN-99", "KKN-DESA-2026"].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setInlineLicenseCode(code);
                          handleVerifyInlineLicense(code);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono border border-zinc-700 transition cursor-pointer"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Banner Antrean Draf Offline untuk Mahasiswa KKN di Daerah Pelosok */}
            {offlineDrafts.length > 0 && isOnline && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🌐</span>
                  <div>
                    <span className="font-semibold">Anda kembali online.</span>
                    <span className="ml-1 text-amber-800 dark:text-amber-300">
                      Terdapat {offlineDrafts.length} draf logbook offline.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleProcessOfflineDrafts}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs cursor-pointer transition shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate Sekarang</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleClearOfflineDrafts}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-amber-200/70 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-medium text-xs cursor-pointer transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}

            {!isOnline && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 text-xs">
                <span className="text-sm">⚠️</span>
                <span>
                  <strong>Mode Offline Aktif:</strong> Tidak ada koneksi internet. Catatan Anda akan otomatis disimpan sebagai draf offline aman di IndexedDB perangkat.
                </span>
              </div>
            )}

            {/* Form Input Card (Linear / Midday Minimalist Workspace) */}
<DailyFormCard
              mode={mode}
              tone={tone}
              tipeKegiatan={tipeKegiatan}
              peran={peran}
              tanggalHarian={tanggalHarian}
              catatan={catatan}
              lastAutoSavedAt={lastAutoSavedAt}
              fotoBase64={fotoBase64}
              fotoFileName={fotoFileName}
              enableWatermark={enableWatermark}
              detectedPhotoDate={detectedPhotoDate}
              isCompressingPhoto={isCompressingPhoto}
              tanggalMulai={tanggalMulai}
              tanggalSelesai={tanggalSelesai}
              ringkasanMingguan={ringkasanMingguan}
              selectedBulan={selectedBulan}
              monthlyNotes={monthlyNotes}
              isLoading={isLoading}
              errorMsg={errorMsg}
              historyCount={history.length}
              isHydrated={isHydrated}
              templateSnippets={templateSnippets}
              currentProgramConfig={currentProgramConfig}
              isQuotaExhausted={isQuotaExhausted}
              setMode={setMode}
              setTone={setTone}
              setTipeKegiatan={setTipeKegiatan}
              setPeran={setPeran}
              setTanggalHarian={setTanggalHarian}
              setCatatan={setCatatan}
              setLastAutoSavedAt={setLastAutoSavedAt}
              setErrorMsg={setErrorMsg}
              setTanggalMulai={setTanggalMulai}
              setTanggalSelesai={setTanggalSelesai}
              setRingkasanMingguan={setRingkasanMingguan}
              setSelectedBulan={setSelectedBulan}
              setMonthlyNotes={setMonthlyNotes}
              setIsQrScannerOpen={setIsQrScannerOpen}
              setIsSmartIngestionOpen={setIsSmartIngestionOpen}
              setIsTemplateLibraryOpen={setIsTemplateLibraryOpen}
              catatanRef={catatanRef}
              lastSavedCatatanRef={lastSavedCatatanRef}
              fileInputRef={fileInputRef}
              onSelectTemplateSnippet={handleSelectTemplateSnippet}
              onFillSample={handleFillSample}
              onFillWeeklySample={handleFillWeeklySample}
              onToggleWatermark={handleToggleWatermark}
              onFileChange={handleFileChange}
              onDropImage={handleDropImage}
              onRemovePhoto={handleRemovePhoto}
              onGenerateDaily={handleGenerateDaily}
              onGenerateWeekly={handleGenerateWeekly}
              onGenerateMonthly={handleGenerateMonthly}
            />

        {/* Loading Skeleton */}
        {isLoading && (
          <section className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 animate-pulse-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {fotoBase64
                    ? "Sedang Menginspeksi Bukti Foto Kegiatan..."
                    : mode === "weekly"
                      ? "Sedang Merancang Alur Progresif 1 Pekan..."
                      : "Sedang Menganalisis & Menyusun Laporan..."}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Mengonversi data ke standar akademik Taksonomi Bloom (C3–C6)
                </p>
              </div>
            </div>
            <div className="space-y-2.5 pt-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60 space-y-1.5"
                >
                  <div className="h-3 w-40 bg-zinc-200 dark:bg-zinc-700 rounded" />
                  <div className="h-2.5 w-full bg-zinc-200/70 dark:bg-zinc-700/60 rounded" />
                  <div className="h-2.5 w-5/6 bg-zinc-200/70 dark:bg-zinc-700/60 rounded" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAMPILAN HASIL MODE BORONGAN (1 PEKAN) */}
        {mode === "weekly" && weeklyResults.length > 0 && !isLoading && (
          <WeeklyResultsSection
            weeklyResults={weeklyResults}
            tipeKegiatan={tipeKegiatan}
            peran={peran}
            expandedDayIdx={expandedDayIdx}
            setExpandedDayIdx={setExpandedDayIdx}
            copiedDayIdx={copiedDayIdx}
            copiedWeeklyAll={copiedWeeklyAll}
            onOpenLivePreview={handleOpenLivePreview}
            onCopySingleDayWeekly={handleCopySingleDayWeekly}
            onCopyAllWeeklyMarkdown={handleCopyAllWeeklyMarkdown}
            resultRef={resultRef}
          />
        )}

        {/* ================================================================= */}
        {/* TAMPILAN HASIL MODE BULANAN (MONEV KEMAJUAN MBKM)                 */}
        {/* ================================================================= */}
        {mode === "monthly" && monthlyResult && !isLoading && (
          <MonthlyResultsSection
            monthlyResult={monthlyResult}
            tipeKegiatan={tipeKegiatan}
            peran={peran}
            studentProfile={studentProfile}
            copiedMonthlyField={copiedMonthlyField}
            setCopiedMonthlyField={setCopiedMonthlyField}
            isExportingMonthlyDocx={isExportingMonthlyDocx}
            onExportMonthlyDocx={handleExportMonthlyDocx}
            resultRef={resultRef}
          />
        )}

        {/* ================================================================= */}
        {/* TAMPILAN HASIL MODE HARIAN (LENGKAP DENGAN BUKTI DOKUMENTASI FOTO)*/}
        {/* ================================================================= */}
        {mode === "daily" && result && !isLoading && (
          <DailyResultSection
            result={result}
            resultPhoto={resultPhoto}
            tipeKegiatan={tipeKegiatan}
            peran={peran}
            copiedAll={copiedAll}
            copiedSection={copiedSection}
            collapsedSections={collapsedSections}
            areAllSectionsCollapsed={areAllSectionsCollapsed}
            setAreAllSectionsCollapsed={setAreAllSectionsCollapsed}
            setCollapsedSections={setCollapsedSections}
            onCopyAll={handleCopyAll}
            onCopySection={handleCopySection}
            onOpenLivePreview={handleOpenLivePreview}
            resultRef={resultRef}
          />
        )}

        {/* PANEL AKSI: HUB EKSPOR & INTEGRASI DOKUMEN */}
{hasAnyOutput && !isLoading && (
          <ExportHub
            isSynthesizingReport={isSynthesizingReport}
            studentProfile={studentProfile}
            showProfileEditor={showProfileEditor}
            exportingType={exportingType}
            exportSuccessToast={exportSuccessToast}
            canvaBannerOpen={canvaBannerOpen}
            copiedCanvaDraft={copiedCanvaDraft}
            copiedExtensionJson={copiedExtensionJson}
            selectedPreset={selectedPreset}
            isBulkSelectionActive={isBulkSelectionActive}
            selectedExportEntryIds={selectedExportEntryIds}
            bulkExportSearchQuery={bulkExportSearchQuery}
            bulkExportFilterType={bulkExportFilterType}
            setCanvaBannerOpen={setCanvaBannerOpen}
            setCopiedCanvaDraft={setCopiedCanvaDraft}
            setIsExtensionModalOpen={setIsExtensionModalOpen}
            setShowProfileEditor={setShowProfileEditor}
            setBulkExportFilterType={setBulkExportFilterType}
            setBulkExportSearchQuery={setBulkExportSearchQuery}
            logoInputRef={logoInputRef}
            onUpdateProfile={handleUpdateProfile}
            onLogoUpload={handleLogoUpload}
            onRemoveLogo={handleRemoveLogo}
            onPresetChange={handlePresetChange}
            onGetEntriesForExport={getEntriesForExport}
            onGetSelectedEntriesForExport={getSelectedEntriesForExport}
            onToggleBulkSelectEntry={handleToggleBulkSelectEntry}
            onSelectAllExportEntries={handleSelectAllExportEntries}
            onDeselectAllExportEntries={handleDeselectAllExportEntries}
            onSelectRecentExportEntries={handleSelectRecentExportEntries}
            onToggleBulkSelectionMode={handleToggleBulkSelectionMode}
            onOpenLivePreview={handleOpenLivePreview}
            onExportExcel={handleExportExcel}
            onExportWord={handleExportWord}
            onSynthesizeAndExportWord={handleSynthesizeAndExportWord}
            onExportPowerPoint={handleExportPowerPoint}
            onSyncDirectToExtension={handleSyncDirectToExtension}
            onOpenDriveSyncModal={handleOpenDriveSyncModal}
            onBuildCanvaPosterDraft={buildCanvaPosterDraft}
            onOpenCanvaPoster={handleOpenCanvaPoster}
            onCopyExtensionJson={handleCopyExtensionJson}
            onDownloadExtension={handleDownloadExtension}
          />
        )}

        {/* PANEL RIWAYAT LOGBOOK & AUDIT KUALITAS (MODULAR COMPONENT DENGAN 1-CLICK AI AUTO-FIX) */}
        <AuditHistoryPanel
          history={history}
          onClearAllHistory={handleClearAllHistory}
          onDeleteEntry={handleDeleteHistoryEntry}
          onLoadEntry={handleLoadHistoryEntry}
          onAutoFixEntry={handleAutoFixEntry}
          fixingEntryId={fixingEntryId}
          searchQuery={historySearchQuery}
          onSearchChange={setHistorySearchQuery}
          onToast={triggerToast}
        />

          </>
        )}

        {/* TAB 2: KONVERSI 20 SKS */}
        {mainTab === "sks" && (
          <SksConversionTab
            tipeKegiatan={tipeKegiatan}
            peran={peran || "Mahasiswa Peserta"}
            riwayatLogbookText={getCombinedLogbookText()}
            mentorAdminData={mentorAdminData}
            onSksMatrixGenerated={(matriks, rawCourses) => {
              setSksCoursesContext(rawCourses);
              saveStoredSksCourses(rawCourses).catch(console.error);
            }}
          />
        )}

        {/* TAB 3: ATS RESUME & LINKEDIN */}
        {mainTab === "resume" && (
          <AtsResumeTab
            tipeKegiatan={tipeKegiatan}
            peran={peran || "Mahasiswa Peserta"}
            riwayatLogbookText={getCombinedLogbookText()}
            studentProfile={studentProfile}
          />
        )}

        {/* TAB 4: SIMULASI SIDANG DPL */}
        {mainTab === "simulator" && (
          <DplSimulatorTab
            tipeKegiatan={tipeKegiatan}
            peran={peran || "Mahasiswa Peserta"}
            riwayatLogbookText={getCombinedLogbookText()}
            konteksMatkulSks={sksCoursesContext}
          />
        )}

        {/* TAB 5: TIM KKN DESA */}
        {mainTab === "kkn" && (
          <KknTeamTab
            onConvertToDailyLogbook={handleConvertToDailyLogbook}
          />
        )}

        {/* TAB 6: BERKAS & PENILAIAN MENTOR */}
        {mainTab === "admin" && (
          <AdminDocsTab
            profile={studentProfile}
            initialData={mentorAdminData}
            onUpdateProfile={(p) => {
              setStudentProfile(p);
              saveStoredProfile(p).catch(console.error);
            }}
            onUpdateMentorData={(data) => {
              setMentorAdminData(data);
              saveStoredMentorData(data).catch(console.error);
            }}
          />
        )}
      </main>

      {/* Modal Status Integrasi Google Drive / Google Sheets */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Integrasi Google Drive & Sheets
                  </h3>
                  <p className="text-xs text-slate-500">
                    Status Sinkronisasi Dokumen LogMagang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {driveSyncStep === "syncing" ? (
              <div className="py-6 flex flex-col items-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Menyiapkan Pipeline Sinkronisasi Cloud...
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memformat {getEntriesForExport().length} entri logbook untuk
                    Google Sheets & Google Drive
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">
                      Data Logbook Siap Disinkronkan (
                      {getEntriesForExport().length} Baris Aktif)
                    </p>
                    <p className="text-emerald-700 leading-relaxed">
                      Format baris tabel telah disesuaikan dengan struktur kolom
                      standar Google Sheets (`No`, `Tanggal`, `Peran`,
                      `Deskripsi`, `Kompetensi`, `Kendala`, `Solusi`,
                      `Refleksi`).
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">
                      Target Folder Drive:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      /LogMagang_{tipeKegiatan.replace(/\s+/g, "_")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500">
                      Mode OAuth Workspace:
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[11px]">
                      Sandbox / Clipboard Bridge
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySheetsRowTsv}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {copiedSheetsTsv ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Format Tabel Google Sheets Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>
                          Salin Format Tabel (Langsung Paste di Google Sheets)
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://sheets.new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Buka Google Sheets Baru</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsDriveModalOpen(false)}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Panduan Pasang Ekstensi dalam 3 Langkah */}
      {isExtensionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                  <Puzzle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Cara Pasang Ekstensi Auto-Fill
                  </h3>
                  <p className="text-xs text-slate-500">
                    3 Langkah Mudah untuk Google Chrome, Edge & Opera (Manifest V3)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Langkah Instalasi */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <span>Unduh & Ekstrak File Ekstensi (.zip)</span>
                </div>
                <p className="pl-7 text-slate-600 leading-relaxed">
                  Unduh paket ekstensi dengan tombol di bawah, lalu ekstrak file zip tersebut ke folder komputer Anda (misal ke folder <code>Dokumen/extension</code>).
                </p>
              </div>

              <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>Buka chrome://extensions & Aktifkan Developer Mode</span>
                </div>
                <p className="pl-7 text-slate-600 leading-relaxed">
                  Buka tab baru di browser Anda, ketik <code>chrome://extensions</code> (atau <code>edge://extensions</code> di Edge), lalu aktifkan tombol switch <strong>Developer mode (Mode Pengembang)</strong> di sudut kanan atas.
                </p>
              </div>

              <div className="rounded-xl p-3.5 bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Klik "Load unpacked" & Pilih Folder Ekstensi</span>
                </div>
                <p className="pl-7 text-slate-600 leading-relaxed">
                  Klik tombol <strong>Load unpacked (Muat yang belum dibongkar)</strong> di kiri atas, lalu pilih folder <code>extension</code> hasil ekstrak. Selesai! Tombol mengambang 📄 <strong>Auto-Fill LogMagang</strong> akan langsung muncul di portal kampus Anda.
                </p>
              </div>
            </div>

            {/* Cara Pemakaian Singkat */}
            <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <span className="font-bold block">💡 Cara Mengisi Form di Portal Kampus:</span>
              <p className="leading-relaxed">
                1. Klik <strong>"Salin Data untuk Ekstensi"</strong> di bawah.<br />
                2. Buka formulir logbook di portal kampus Anda (misal Kampus Merdeka atau SIM KKN).<br />
                3. Buka popup ekstensi LogMagang atau klik tombol melayang 📄 <strong>Auto-Fill LogMagang</strong> di pojok kanan bawah halaman portal untuk mengisi otomatis seluruh kolom!
              </p>
            </div>

            {/* Tombol Aksi di Modal */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="/api/download-extension"
                  download="logmagang-autofill-extension.zip"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File Ekstensi (.zip)</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyExtensionJson}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                >
                  {copiedExtensionJson ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Data JSON Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Data Logbook (JSON)</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExtensionModalOpen(false)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Aktivasi Lisensi Pro & QRIS Checkout */}
      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onActivated={handleLicenseActivated}
        currentLicense={licenseDetails}
      />

      {/* Modal Smart Ingestion (GitHub Commit Sync, Agenda Kalender & Batch CSV Timesheet) */}
      <SmartIngestionModal
        isOpen={isSmartIngestionOpen}
        onClose={() => setIsSmartIngestionOpen(false)}
        onApplyNote={(note, suggestedRole) => {
          if (mode === "daily") {
            setCatatan((prev) => (prev.trim() ? `${prev.trim()}\n${note}` : note));
          } else {
            setRingkasanMingguan((prev) => (prev.trim() ? `${prev.trim()}\n${note}` : note));
          }
          if (suggestedRole && !peran.trim()) {
            setPeran(suggestedRole);
          }
        }}
        onImportBatchEntries={(importedEntries) => {
          if (importedEntries.length > 0) {
            setMainTab("generator");
            setMode("daily");
            setResult(importedEntries[0]);
            setHistory((prev) => {
              const updated = [...importedEntries, ...prev].slice(0, 150);
              saveStoredHistory(updated).catch(console.error);
              return updated;
            });
          }
        }}
        currentPeran={peran}
        currentTipeKegiatan={tipeKegiatan}
      />

      {/* Modal Multi-Device Workspace Sync & Backup */}
      <WorkspaceSyncModal
        isOpen={isWorkspaceSyncOpen}
        onClose={() => setIsWorkspaceSyncOpen(false)}
        onDataRestored={handleRefreshWorkspaceFromSync}
      />

      {/* Modal Library Templat Snippet Catatan */}
      <TemplateLibraryModal
        isOpen={isTemplateLibraryOpen}
        onClose={() => {
          setIsTemplateLibraryOpen(false);
          refreshTemplateSnippets();
        }}
        onSelectTemplate={handleSelectTemplateSnippet}
        currentCatatan={catatan}
        activeProgram={tipeKegiatan}
      />

      {/* Modal Autentikasi Google Login & Sinkronisasi Cloud Firestore */}
      <AuthLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUserProfile}
        firebaseUser={currentFbUser}
        onUserChanged={(user) => {
          setCurrentUserProfile(user);
          if (user) {
            if (typeof window !== "undefined") {
              localStorage.setItem("logmagang_local_user", JSON.stringify(user));
            }
            setStudentProfile((prev) => ({
              ...prev,
              namaMahasiswa: user.displayName || prev.namaMahasiswa,
              nim: user.nim || prev.nim,
              perguruanTinggi: user.campus || prev.perguruanTinggi,
              programStudi: user.prodi || prev.programStudi,
            }));
          } else {
            if (typeof window !== "undefined") {
              localStorage.removeItem("logmagang_local_user");
            }
          }
        }}
        initialName={studentProfile.namaMahasiswa || ""}
        initialNim={studentProfile.nim || ""}
        initialCampus={studentProfile.perguruanTinggi || ""}
      />

      {/* Modal Live Preview Format Dokumen Resmi (.pdf, .docx, .xlsx, .pptx) */}
      <LivePreviewModal
        isOpen={isLivePreviewOpen}
        onClose={() => setIsLivePreviewOpen(false)}
        entries={getSelectedEntriesForExport()}
        studentProfile={studentProfile}
        selectedPreset={selectedPreset}
        onExportPdf={handleExportPdf}
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
        onExportPowerPoint={handleExportPowerPoint}
        exportingType={exportingType}
        onOpenSignatureModal={() => {
          setIsLivePreviewOpen(false);
          setCalendarHubTab("signature");
          setIsCalendarHubOpen(true);
        }}
        title={
          isBulkSelectionActive
            ? `Live Preview: ${getSelectedEntriesForExport().length} Entri Terpilih`
            : "Live Preview Format Dokumen Resmi"
        }
      />

      {/* Modal Kalender Heatmap, Deteksi Hari Bolong, Peta Kompetensi & E-Paraf Digital */}
      <CalendarCompetencyModal
        isOpen={isCalendarHubOpen}
        onClose={() => setIsCalendarHubOpen(false)}
        initialTab={calendarHubTab}
        history={history}
        studentProfile={studentProfile}
        onUpdateProfile={(updatedProfile) => {
          setStudentProfile(updatedProfile);
          saveStoredProfile(updatedProfile).catch(console.error);
        }}
        onSelectDateToBackfill={(isoDate, displayDate) => {
          setMainTab("generator");
          setMode("daily");
          setTanggalHarian(isoDate);
          toast.info(`Form disetel untuk menambal tanggal ${displayDate}`, {
            description: "Silakan lengkapi catatan kegiatan harian Anda lalu klik Generate.",
          });
          const formElem = document.getElementById("daily-form-card");
          if (formElem) {
            formElem.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* Modal QR Code Scanner untuk Verifikasi Dokumen Mentor & Presensi Kehadiran */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        studentProfile={studentProfile}
        currentRole={peran}
        currentProgram={tipeKegiatan}
        onApplyToForm={(qrData) => {
          setMainTab("generator");
          setMode("daily");
          setTanggalHarian(qrData.isoDate);
          if (qrData.peran) setPeran(qrData.peran);
          const qrNote = `[Terverifikasi QR Mentor #${qrData.verificationHash} - ${qrData.mentorName}] ${qrData.agendaCatatan}`;
          setCatatan((prev) => (prev.trim() ? `${prev.trim()}\n${qrNote}` : qrNote));
          setStudentProfile((prev) => ({
            ...prev,
            namaPembimbing: qrData.mentorName || prev.namaPembimbing,
            namaMitra: qrData.mitraName || prev.namaMitra,
          }));
          toast.success(
            `Data QR Mentor (#${qrData.verificationHash}) berhasil dimasukkan ke form generator!`
          );
        }}
        onRecordInstantAttendance={(newEntry, mentorName, mitraName) => {
          setMainTab("generator");
          setMode("daily");
          setResult(newEntry);
          setHistory((prev) => {
            const updated = [newEntry, ...prev].slice(0, 120);
            saveStoredHistory(updated).catch(console.error);
            return updated;
          });
          if (mentorName || mitraName) {
            setStudentProfile((prev) => {
              const updatedProfile = {
                ...prev,
                namaPembimbing: mentorName || prev.namaPembimbing,
                namaMitra: mitraName || prev.namaMitra,
              };
              saveStoredProfile(updatedProfile).catch(console.error);
              return updatedProfile;
            });
          }
          toast.success(
            `Presensi & Logbook Terverifikasi QR berhasil dicatat (+8 Jam MBKM)!`,
            {
              description: `${newEntry.tanggal} • Disupervisi oleh ${mentorName || "Mentor"}`,
            }
          );
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p className="font-medium text-slate-600">
              © {new Date().getFullYear()} LogMagang OS — Ekosistem Terpadu MBKM, MSIB & KKN
            </p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{storageInfo?.statusLabel || "💾 IndexedDB Engine Aktif • Bebas Limit 5MB"}</span>
              {storageInfo?.isSupported && (
                <span className="text-[10px] text-emerald-600 font-mono">
                  ({storageInfo.usedFormatted} terpakai)
                </span>
              )}
            </span>
          </div>
          {isHydrated && (usedQuota > 0 || isPro) && (
            <button
              type="button"
              onClick={handleResetQuota}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>
                Reset Status Kuota Lokal ({usedQuota}/{MAX_FREE_QUOTA})
              </span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
