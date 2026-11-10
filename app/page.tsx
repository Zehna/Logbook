"use client";

import React, { useState, useRef } from "react";
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
import { AppUserProfile } from "@/src/lib/firebase/config";
import { User as FirebaseUser } from "firebase/auth";
import { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";
import {
  saveStoredHistory,
  saveStoredProfile,
  saveStoredMentorData,
  saveStoredSksCourses,
  getStoredTemplates,
  OfflineDraftItem,
  StorageEstimateInfo,
} from "@/src/lib/storage/indexedDbStore";
import { MonthlyReportOutput } from "@/src/lib/types/monthlyReport";
import { MAX_FREE_QUOTA } from "@/src/lib/config/storageKeys";
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
import { AppHeader } from "@/src/components/AppHeader";
import { GeneratorBanners } from "@/src/components/GeneratorBanners";
import { DriveSyncModal } from "@/src/components/DriveSyncModal";
import { ExtensionGuideModal } from "@/src/components/ExtensionGuideModal";
import { AppFooter } from "@/src/components/AppFooter";
import { useProfileImageHandlers } from "@/src/hooks/useProfileImageHandlers";
import { useGenerateHandlers } from "@/src/hooks/useGenerateHandlers";
import { useExportHandlers } from "@/src/hooks/useExportHandlers";
import { useHistorySyncHandlers } from "@/src/hooks/useHistorySyncHandlers";
import { useCopyLicenseHandlers } from "@/src/hooks/useCopyLicenseHandlers";
import { usePageLifecycle } from "@/src/hooks/usePageLifecycle";
import { buildCombinedLogbookText } from "@/src/lib/utils/combinedLogbookText";


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
  // Toast sukses ekspor (dipindah ke atas agar bisa dioper ke usePageLifecycle)
  const triggerToast = (msg: string, description?: string) => {
    toast.success(msg, { description });
    setExportSuccessToast(msg);
    setTimeout(() => {
      setExportSuccessToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Efek lifecycle: auth, tema, hidrasi, ref-sync, auto-save, online/offline, ack ekstensi
  usePageLifecycle({
    mode,
    catatan,
    catatanRef,
    lastSavedCatatanRef,
    triggerToast,
    setCurrentUserProfile,
    setStudentProfile,
    setCurrentFbUser,
    setIsAuthLoading,
    setIsDarkMode,
    setUsedQuota,
    setIsPro,
    setLicenseDetails,
    setHistory,
    setSelectedPreset,
    setMentorAdminData,
    setSksCoursesContext,
    setTemplateSnippets,
    setCatatan,
    setLastAutoSavedAt,
    setStorageInfo,
    setOfflineDrafts,
    setIsHydrated,
    setIsOnline,
    setExtensionSyncAck,
  });




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



  const remainingQuota = Math.max(0, MAX_FREE_QUOTA - usedQuota);
  const isQuotaExhausted = !isPro && usedQuota >= MAX_FREE_QUOTA;

  const currentProgramConfig =
    PROGRAM_OPTIONS.find((item) => item.value === tipeKegiatan) ||
    PROGRAM_OPTIONS[0];




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


  const {
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
  } = useProfileImageHandlers({
    studentProfile,
    setStudentProfile,
    peran,
    setPeran,
    currentProgramConfig,
    tipeKegiatan,
    enableWatermark,
    rawUploadedFile,
    setEnableWatermark,
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
  });

  const {
    handleGenerateDaily,
    handleGenerateWeekly,
    handleGenerateMonthly,
    handleExportMonthlyDocx,
    handleProcessOfflineDrafts,
    handleClearOfflineDrafts,
  } = useGenerateHandlers({
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
    studentProfile,
    monthlyResult,
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
  });

  const {
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
  } = useExportHandlers({
    isBulkSelectionActive,
    selectedExportEntryIds,
    studentProfile,
    selectedPreset,
    mentorAdminData,
    tipeKegiatan,
    peran,
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
  });

  const {
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
  } = useHistorySyncHandlers({
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
  });

  const {
    handleCopySection,
    handleCopyAll,
    handleCopySingleDayWeekly,
    handleCopyAllWeeklyMarkdown,
    handleActivateProDemo,
    handleLicenseActivated,
    handleVerifyInlineLicense,
    handleResetQuota,
  } = useCopyLicenseHandlers({
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
  });

  const getCombinedLogbookText = () =>
    buildCombinedLogbookText({
      history,
      weeklyResults,
      result,
      catatan,
      tipeKegiatan,
      peran,
    });

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
      <AppHeader
        isHydrated={isHydrated}
        isPro={isPro}
        licenseDetails={licenseDetails}
        remainingQuota={remainingQuota}
        currentUserProfile={currentUserProfile}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenWorkspaceSync={() => setIsWorkspaceSyncOpen(true)}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        mainTab={mainTab}
        setMainTab={setMainTab}
        historyCount={history.length}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-5 pb-14 space-y-6">
        {mainTab === "generator" && (
          <>
            <GeneratorBanners
              currentUserProfile={currentUserProfile}
              isHydrated={isHydrated}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              history={history}
              isPro={isPro}
              remainingQuota={remainingQuota}
              licenseDetails={licenseDetails}
              onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
              onOpenCalendarHub={(tab = "calendar") => {
                setCalendarHubTab(tab);
                setIsCalendarHubOpen(true);
              }}
              onBackfillDate={(isoDate, displayDate) => {
                setMode("daily");
                setTanggalHarian(isoDate);
                toast.info(`Form disetel untuk tanggal ${displayDate}`, {
                  description:
                    "Silakan lengkapi catatan kegiatan atau unggah foto dokumentasi.",
                });
                const formElem = document.getElementById("daily-form-card");
                if (formElem) {
                  formElem.scrollIntoView({ behavior: "smooth" });
                }
              }}
              isQuotaExhausted={isQuotaExhausted}
              paywallRef={paywallRef}
              onResetQuota={handleResetQuota}
              inlineLicenseCode={inlineLicenseCode}
              onInlineLicenseCodeChange={(code) => setInlineLicenseCode(code)}
              onVerifyInlineLicense={handleVerifyInlineLicense}
              isInlineVerifying={isInlineVerifying}
              inlineLicenseError={inlineLicenseError}
              offlineDrafts={offlineDrafts}
              isOnline={isOnline}
              onProcessOfflineDrafts={handleProcessOfflineDrafts}
              onClearOfflineDrafts={handleClearOfflineDrafts}
            />

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

      {isDriveModalOpen && (
        <DriveSyncModal
          driveSyncStep={driveSyncStep}
          exportEntryCount={getEntriesForExport().length}
          tipeKegiatan={tipeKegiatan}
          copiedSheetsTsv={copiedSheetsTsv}
          onCopySheetsRowTsv={handleCopySheetsRowTsv}
          onClose={() => setIsDriveModalOpen(false)}
        />
      )}

      {isExtensionModalOpen && (
        <ExtensionGuideModal
          onClose={() => setIsExtensionModalOpen(false)}
          onCopyExtensionJson={handleCopyExtensionJson}
          copiedExtensionJson={copiedExtensionJson}
        />
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

      <AppFooter
        storageInfo={storageInfo}
        isHydrated={isHydrated}
        usedQuota={usedQuota}
        isPro={isPro}
        onResetQuota={handleResetQuota}
      />
    </div>
  );
}
