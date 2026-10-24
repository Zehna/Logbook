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
  Award,
  AlertTriangle,
  Wrench,
  Lightbulb,
  Loader2,
  Crown,
  RotateCcw,
  CheckCircle2,
  GraduationCap,
  Users,
  ChevronRight,
  ShieldCheck,
  Zap,
  FileSpreadsheet,
  Presentation,
  Cloud,
  Palette,
  X,
  ExternalLink,
  UserCheck,
  ChevronDown,
  ChevronUp,
  History,
  Calendar,
  Layers,
  Camera,
  UploadCloud,
  ImageIcon,
  Puzzle,
  Download,
  FileJson,
  HelpCircle,
  Mic,
  Tent,
  Sprout,
  GitBranch,
  ArrowRightLeft,
  ImagePlus,
  ClipboardCheck,
  Trash2,
  BarChart3,
  Search,
  FileCheck,
  RefreshCw,
  Sun,
  Moon,
  Bookmark,
  User,
  CheckSquare,
  Square,
  ListFilter,
  CheckCheck,
} from "lucide-react";
import {
  getIndonesianHolidayInfo,
  checkRangeForHolidays,
} from "@/src/lib/utils/indonesianHolidays";
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
import { ToneType, TONE_OPTIONS, LicenseInfo, KknProkerItem, LogbookTemplateSnippet } from "@/src/lib/types/modules";
import { LicenseModal } from "@/src/components/LicenseModal";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";
import { SmartIngestionModal } from "@/src/components/SmartIngestionModal";
import { WorkspaceSyncModal } from "@/src/components/WorkspaceSyncModal";
import { AuditHistoryPanel } from "@/src/components/AuditHistoryPanel";
import { TemplateLibraryModal } from "@/src/components/TemplateLibraryModal";
import { AuthLoginModal } from "@/src/components/AuthLoginModal";
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
  OfflineDraftItem,
  StorageEstimateInfo,
} from "@/src/lib/storage/indexedDbStore";
import { MonthlyReportOutput } from "@/src/lib/types/monthlyReport";

const MAX_FREE_QUOTA = 3;
const STORAGE_QUOTA_KEY = "logmagang_free_usage_count";
const STORAGE_PRO_KEY = "logmagang_is_pro_active";
const STORAGE_LICENSE_KEY = "logmagang_license_info";
const STORAGE_HISTORY_KEY = "logmagang_entries_history";
const STORAGE_PROFILE_KEY = "logmagang_student_profile";

function getCurrentWeekMondayAndFriday(): { monday: string; friday: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + diffToMonday);

  const fridayDate = new Date(mondayDate);
  fridayDate.setDate(mondayDate.getDate() + 4);

  const toIsoDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const dt = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${dt}`;
  };

  return {
    monday: toIsoDate(mondayDate),
    friday: toIsoDate(fridayDate),
  };
}

const PROGRAM_OPTIONS: {
  value: TipeKegiatan;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  roleExamples: string[];
  noteExample: string;
  weeklyExamples: { label: string; summary: string }[];
}[] = [
  {
    value: "Magang MBKM",
    label: "Magang MBKM",
    subtitle: "Magang Bersertifikat / Mandiri",
    icon: Briefcase,
    roleExamples: [
      "Social Media Specialist",
      "Staff Operasional",
      "Software Engineer Intern",
      "Finance & Admin Intern",
    ],
    noteExample:
      "hari ini bantu rekap nota masuk ke excel sama packing barang, tadi sempet ada 2 nota yang nominalnya gak sinkron sama mutasi tapi udah dicek ulang bareng supervisor",
    weeklyExamples: [
      {
        label: "📱 Kampanye Konten Medsos",
        summary:
          "pekan ini garap konten feeds & reels instagram buat kampanye produk baru, mulai dari riset tren kompetitor, bikin content calendar, take video & desain di canva, revisi copywriting dari mentor, sampai jadwalin posting & rekap insight mingguan",
      },
      {
        label: "📦 Rekap Operasional & Gudang",
        summary:
          "minggu ini beresin audit stok barang gudang dan rekap nota transaksi bulanan ke excel, sempet nemu selisih stok 5 item terus dicek ulang bareng tim gudang dan akhirnya bikin template kontrol stok baru",
      },
      {
        label: "💻 Pengembangan Fitur Web",
        summary:
          "pekan ini ngerjain fitur halaman dashboard laporan user, mulai dari baca dokumentasi API, slicing komponen tabel dan filter di Next.js, integrasi endpoint backend, benerin bug pagination, sampai code review bareng senior",
      },
    ],
  },
  {
    value: "MSIB",
    label: "MSIB",
    subtitle: "Studi Independen Bersertifikat",
    icon: GraduationCap,
    roleExamples: [
      "Fullstack Web Track",
      "Data Analytics Mentee",
      "UI/UX Product Design",
      "AI & Cloud Computing",
    ],
    noteExample:
      "hari ini ikut sesi mentoring live bahas REST API dan lanjut ngerjain tugas kelompok bikin endpoint autentikasi, sempet error CORS pas disambungin ke frontend tapi berhasil beres",
    weeklyExamples: [
      {
        label: "🚀 Sprint Capstone Project",
        summary:
          "pekan ini sprint 2 capstone project bareng kelompok: senin ikut sesi ILT mentor, selasa bikin rancangan database & wireframe, rabu coding modul autentikasi & CRUD, kamis testing bug bareng tim QA, jumat presentasi progres mingguan ke mentor",
      },
      {
        label: "📊 Eksplorasi & Visualisasi Data",
        summary:
          "minggu ini belajar materi data cleaning & visualisasi pakai Python dan Looker Studio, bersihin dataset transaksi yang banyak missing value, bikin dashboard interaktif, lalu kumpulin tugas hands-on tepat waktu",
      },
    ],
  },
  {
    value: "KKN",
    label: "KKN",
    subtitle: "Kuliah Kerja Nyata Pengabdian",
    icon: Users,
    roleExamples: [
      "Koordinator Divisi Pendidikan",
      "Divisi Ekonomi Kreatif UMKM",
      "Humas & Publikasi Desa",
      "Sekretaris Posko KKN",
    ],
    noteExample:
      "hari ini sosialisasi pembuatan katalog digital sama foto produk keripik ibu-ibu PKK di balai desa, awalnya terkendala pencahayaan kurang terang jadi pindah ke teras balai desa",
    weeklyExamples: [
      {
        label: "🏪 Pendampingan Digitalisasi UMKM Desa",
        summary:
          "pekan ini jalankan proker pendampingan UMKM warga desa: mulai dari survei 8 pelaku usaha keripik & batik, menyiapkan materi modul katalog digital & QRIS, praktik foto produk di balai desa, pendaftaran akun Google Maps & e-commerce, sampai evaluasi bareng perangkat desa",
      },
      {
        label: "📚 Bimbingan Belajar & Literasi Anak",
        summary:
          "minggu ini ngadain program pojok baca dan bimbel sore untuk anak SD di posko desa, koordinasi dengan kepala sekolah, merapikan buku donasi, ngajarin calistung & bahasa inggris dasar pakai kuis interaktif, dan evaluasi antusiasme peserta",
      },
    ],
  },
];

const SECTIONS_CONFIG: {
  key: keyof LogbookResult;
  weeklyKey: keyof Pick<
    WeeklyLogbookDayItem,
    | "deskripsi_kegiatan"
    | "kompetensi_dikembangkan"
    | "kendala_dihadapi"
    | "solusi_tindakan"
    | "refleksi_pembelajaran"
  >;
  number: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  bgClass: string;
  borderClass: string;
}[] = [
  {
    key: "deskripsiKegiatan",
    weeklyKey: "deskripsi_kegiatan",
    number: "01",
    title: "Deskripsi Kegiatan",
    badge: "C3–C4 • Pelaksanaan & Analisis",
    icon: FileText,
    accentClass: "text-indigo-600 bg-indigo-50 border-indigo-200",
    bgClass: "bg-indigo-50/40",
    borderClass: "border-indigo-100",
  },
  {
    key: "kompetensiDikembangkan",
    weeklyKey: "kompetensi_dikembangkan",
    number: "02",
    title: "Kompetensi yang Dikembangkan",
    badge: "Hard Skills & Soft Skills",
    icon: Award,
    accentClass: "text-emerald-600 bg-emerald-50 border-emerald-200",
    bgClass: "bg-emerald-50/40",
    borderClass: "border-emerald-100",
  },
  {
    key: "kendalaDihadapi",
    weeklyKey: "kendala_dihadapi",
    number: "03",
    title: "Kendala yang Dihadapi",
    badge: "C4 • Identifikasi Masalah",
    icon: AlertTriangle,
    accentClass: "text-amber-600 bg-amber-50 border-amber-200",
    bgClass: "bg-amber-50/40",
    borderClass: "border-amber-100",
  },
  {
    key: "solusiTindakan",
    weeklyKey: "solusi_tindakan",
    number: "04",
    title: "Solusi & Tindakan",
    badge: "C5–C6 • Problem Solving",
    icon: Wrench,
    accentClass: "text-blue-600 bg-blue-50 border-blue-200",
    bgClass: "bg-blue-50/40",
    borderClass: "border-blue-100",
  },
  {
    key: "refleksiPembelajaran",
    weeklyKey: "refleksi_pembelajaran",
    number: "05",
    title: "Refleksi Pembelajaran",
    badge: "C5 • Evaluasi & Tindak Lanjut",
    icon: Lightbulb,
    accentClass: "text-purple-600 bg-purple-50 border-purple-200",
    bgClass: "bg-purple-50/40",
    borderClass: "border-purple-100",
  },
];

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
    "excel" | "word" | "pptx" | null
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

  // Listener Autentikasi Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentFbUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserFromFirestore(fbUser.uid);
          if (profile) {
            setCurrentUserProfile(profile);
            setStudentProfile((prev) => ({
              ...prev,
              namaMahasiswa: profile.displayName || prev.namaMahasiswa,
              nim: profile.nim || prev.nim,
              perguruanTinggi: profile.campus || prev.perguruanTinggi,
              programStudi: profile.prodi || prev.programStudi,
            }));
          } else {
            setCurrentUserProfile({
              uid: fbUser.uid,
              displayName: fbUser.displayName || "Mahasiswa MBKM",
              email: fbUser.email || "",
              photoURL: fbUser.photoURL || "",
            });
          }
        } catch (e) {
          console.warn("Gagal fetch user profile dari Firestore:", e);
        }
      } else {
        setCurrentUserProfile(null);
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
        const [idbHistory, idbProfile, idbMentor, idbCourses, idbTemplates] = await Promise.all([
          getStoredHistory(),
          getStoredProfile(),
          getStoredMentorData(),
          getStoredSksCourses(),
          getStoredTemplates(),
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
  const handleGenerateDaily = async (e: React.FormEvent) => {
    e.preventDefault();
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
  const handleGenerateWeekly = async (e: React.FormEvent) => {
    e.preventDefault();
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
  const getEntriesForExport = (): LogbookEntry[] => {
    if (history.length > 0) {
      return history.map((entry, idx) => ({
        ...entry,
        id: entry.id || `hist-${idx}-${entry.tanggal || "entry"}`,
      }));
    }
    if (weeklyResults.length > 0) {
      return weeklyResults.map((day, idx) => ({
        id: `weekly-${idx}-${day.tanggal || idx}`,
        tanggal: day.tanggal,
        hari: day.hari,
        tahapFase: day.tahap_fase,
        tipeKegiatan,
        peran: peran || "Mahasiswa Peserta Program",
        deskripsiKegiatan: day.deskripsi_kegiatan,
        kompetensiDikembangkan: day.kompetensi_dikembangkan,
        kendalaDihadapi: day.kendala_dihadapi,
        solusiTindakan: day.solusi_tindakan,
        refleksiPembelajaran: day.refleksi_pembelajaran,
      }));
    }
    if (result) {
      return [
        {
          id: "current-result",
          tanggal: new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          tipeKegiatan,
          peran: peran || "Mahasiswa Peserta Program",
          fotoBase64: resultPhoto || undefined,
          fotoMimeType: resultPhoto ? fotoMimeType : undefined,
          ...result,
        },
      ];
    }
    return [];
  };

  // Mendapatkan entri yang terpilih (baik seluruhnya atau subset hasil bulk selection)
  const getSelectedEntriesForExport = (): LogbookEntry[] => {
    const all = getEntriesForExport();
    if (!isBulkSelectionActive) {
      return all;
    }
    const filtered = all.filter((entry, idx) => {
      const entryId = entry.id || `entry-${idx}`;
      return selectedExportEntryIds.includes(entryId);
    });
    return filtered;
  };

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
      alert(msg);
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

  // Audit Kualitas & Anti-Duplikasi Logbook Helpers
  const getWordList = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);
  };

  const getWordSet = (text: string): Set<string> => {
    return new Set(getWordList(text));
  };

  const computeJaccardSimilarity = (textA: string, textB: string): number => {
    const setA = getWordSet(textA);
    const setB = getWordSet(textB);
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    setA.forEach((w) => {
      if (setB.has(w)) intersection++;
    });
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : Math.round((intersection / union) * 100);
  };

  const computeOverallUniqueness = (entriesList: LogbookEntry[]): number => {
    if (entriesList.length === 0) return 100;
    const allWords = entriesList.flatMap((e) =>
      getWordList(e.deskripsiKegiatan || "")
    );
    if (allWords.length === 0) return 100;
    const uniqueCount = new Set(allWords).size;
    return Math.round((uniqueCount / allWords.length) * 100);
  };

  const handleDeleteHistoryEntry = async (id: string) => {
    if (!confirm("Hapus entri logbook ini dari riwayat tersimpan?")) return;
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
    triggerToast("Entri logbook berhasil dihapus dari riwayat.");
  };

  const handleClearAllHistory = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus SELURUH riwayat logbook tersimpan? Tindakan ini tidak dapat dibatalkan."
      )
    )
      return;
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch {
      // ignore
    }
    await saveStoredHistory([]);
    const est = await getStorageUsageEstimate();
    setStorageInfo(est);
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
    const header = [
      "No",
      "Tanggal",
      "Peran",
      "Deskripsi Kegiatan",
      "Kompetensi",
      "Kendala",
      "Solusi",
      "Refleksi Pembelajaran",
    ].join("\t");
    const rows = entries.map((e, i) =>
      [
        i + 1,
        e.tanggal,
        e.peran,
        e.deskripsiKegiatan.replace(/\s+/g, " "),
        e.kompetensiDikembangkan.replace(/\s+/g, " "),
        e.kendalaDihadapi.replace(/\s+/g, " "),
        e.solusiTindakan.replace(/\s+/g, " "),
        e.refleksiPembelajaran.replace(/\s+/g, " "),
      ].join("\t")
    );
    try {
      await navigator.clipboard.writeText([header, ...rows].join("\n"));
      setCopiedSheetsTsv(true);
      setTimeout(() => setCopiedSheetsTsv(false), 2500);
    } catch {
      // Abaikan
    }
  };

  const buildCanvaPosterDraft = (): string => {
    const entries = getEntriesForExport();
    const active = entries[0];
    if (!active) return "";
    return [
      `🎯 POSTER PUBLIKASI / LUARAN KEGIATAN ${tipeKegiatan.toUpperCase()}`,
      `👤 Penyusun: ${studentProfile.namaMahasiswa} (${studentProfile.nim})`,
      `🏢 Peran & Mitra: ${active.peran} — ${studentProfile.namaMitra}`,
      "",
      "📌 RINGKASAN AKTIVITAS UTAMA:",
      active.deskripsiKegiatan,
      "",
      "🏆 CAPAIAN KOMPETENSI:",
      active.kompetensiDikembangkan,
      "",
      "💡 INOVASI & SOLUSI PEMECAHAN MASALAH:",
      active.solusiTindakan,
      "",
      "🌟 REFLEKSI & DAMPAK KEGIATAN:",
      active.refleksiPembelajaran,
    ].join("\n");
  };

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
    window.open(
      "https://www.canva.com/id_id/buat/poster/",
      "_blank",
      "noopener,noreferrer"
    );
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
    const formattedAll = [
      `LOGBOOK HARIAN ${tipeKegiatan.toUpperCase()}`,
      `Peran / Posisi: ${peran}`,
      `Tanggal: ${new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
      "",
      `1. Deskripsi Kegiatan:`,
      result.deskripsiKegiatan,
      "",
      `2. Kompetensi yang Dikembangkan:`,
      result.kompetensiDikembangkan,
      "",
      `3. Kendala yang Dihadapi:`,
      result.kendalaDihadapi,
      "",
      `4. Solusi & Tindakan:`,
      result.solusiTindakan,
      "",
      `5. Refleksi Pembelajaran:`,
      result.refleksiPembelajaran,
    ].join("\n");

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
    const formattedDay = [
      `LOGBOOK HARIAN ${tipeKegiatan.toUpperCase()} — ${day.tanggal.toUpperCase()}`,
      `Peran / Posisi: ${peran}`,
      `Fase Kegiatan: ${day.tahap_fase}`,
      "",
      `1. Deskripsi Kegiatan:`,
      day.deskripsi_kegiatan,
      "",
      `2. Kompetensi yang Dikembangkan:`,
      day.kompetensi_dikembangkan,
      "",
      `3. Kendala yang Dihadapi:`,
      day.kendala_dihadapi,
      "",
      `4. Solusi & Tindakan:`,
      day.solusi_tindakan,
      "",
      `5. Refleksi Pembelajaran:`,
      day.refleksi_pembelajaran,
    ].join("\n");

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

    const blocks = weeklyResults.map((day, idx) =>
      [
        `## Hari Ke-${idx + 1}: ${day.tanggal} (${day.tahap_fase})`,
        `- **Program & Peran:** ${tipeKegiatan} — ${peran}`,
        `- **1. Deskripsi Kegiatan:**\n  ${day.deskripsi_kegiatan}`,
        `- **2. Kompetensi yang Dikembangkan:**\n  ${day.kompetensi_dikembangkan}`,
        `- **3. Kendala yang Dihadapi:**\n  ${day.kendala_dihadapi}`,
        `- **4. Solusi & Tindakan:**\n  ${day.solusi_tindakan}`,
        `- **5. Refleksi Pembelajaran:**\n  ${day.refleksi_pembelajaran}`,
      ].join("\n")
    );

    const fullMarkdown = [
      `# REKAP LOGBOOK 1 PEKAN — ${tipeKegiatan.toUpperCase()}`,
      `**Peran / Posisi:** ${peran}`,
      `**Rentang Waktu:** ${weeklyResults[0]?.tanggal} s/d ${weeklyResults[weeklyResults.length - 1]?.tanggal}`,
      "",
      ...blocks.join("\n\n---\n\n").split("\n"),
    ].join("\n");

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
    result !== null ||
    weeklyResults.length > 0;

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
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-6 overflow-x-auto no-scrollbar">
            {[
              { id: "generator", label: "Generator & Dokumen", icon: FileText },
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
                  className={`inline-flex items-center gap-2 py-2.5 text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
                    isActive
                      ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-medium"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-normal"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
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
            <section id="daily-form-card" className="bg-white dark:bg-zinc-900/60 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
              {/* Segmented Mode Switcher (Harian | Borongan 1 Pekan | Laporan Bulanan Monev) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("daily");
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      mode === "daily"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Mode Harian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("weekly");
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      mode === "weekly"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Mode Borongan 1 Pekan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("monthly");
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      mode === "monthly"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Laporan Bulanan (Monev)</span>
                  </button>
                </div>

                <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:inline">
                  Standar MBKM & Taksonomi Bloom
                </span>
              </div>

              <form
                onSubmit={
                  mode === "daily"
                    ? handleGenerateDaily
                    : mode === "weekly"
                    ? handleGenerateWeekly
                    : handleGenerateMonthly
                }
                className="space-y-4"
              >
                {/* 1. Pilihan Program Kegiatan */}
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    1. Program Kegiatan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PROGRAM_OPTIONS.map((prog) => {
                      const Icon = prog.icon;
                      const isSelected = tipeKegiatan === prog.value;
                      return (
                        <button
                          key={prog.value}
                          type="button"
                          onClick={() => {
                            setTipeKegiatan(prog.value);
                            setErrorMsg(null);
                          }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs font-medium"
                              : "bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-white dark:text-zinc-900" : "text-zinc-500 dark:text-zinc-400"
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate">{prog.label}</div>
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400 dark:text-zinc-500"
                              }`}
                            >
                              {prog.subtitle}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Input Peran / Posisi */}
                <div>
                  <label
                    htmlFor="input-peran"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                  >
                    2. Peran / Posisi
                  </label>
                  <input
                    id="input-peran"
                    type="text"
                    value={peran}
                    onChange={(e) => setPeran(e.target.value)}
                    placeholder='Contoh: "Social Media Specialist", "Staff Operasional"'
                    disabled={isLoading}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 disabled:opacity-60 transition"
                  />

                  {/* Saran Peran Cepat */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400 mr-0.5">
                      Contoh:
                    </span>
                    {currentProgramConfig.roleExamples.map((roleSample) => (
                      <button
                        key={roleSample}
                        type="button"
                        onClick={() => setPeran(roleSample)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          peran === roleSample
                            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 font-medium"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                      >
                        {roleSample}
                      </button>
                    ))}
                  </div>
                </div>

                {/* KONDISIONAL: MODE HARIAN */}
                {mode === "daily" ? (
                  <div className="space-y-4">
                    {/* Tanggal Kegiatan Harian */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <div>
                          <label htmlFor="input-tanggal-harian" className="text-xs font-medium text-zinc-800 dark:text-zinc-200 block">
                            Tanggal Kegiatan Harian
                          </label>
                          <span className="text-[11px] text-zinc-400">
                            Klik titik di baris kalender atas untuk mengisi hari terlewat
                          </span>
                        </div>
                      </div>
                      <input
                        id="input-tanggal-harian"
                        type="date"
                        value={tanggalHarian}
                        suppressHydrationWarning
                        onChange={(e) => setTanggalHarian(e.target.value)}
                        disabled={isLoading}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                      />
                    </div>

                    {/* Deteksi Hari Libur Nasional & Akhir Pekan Indonesia */}
                    {isHydrated && (() => {
                      const holidayInfo = getIndonesianHolidayInfo(tanggalHarian);
                      if (!holidayInfo.isHoliday && !holidayInfo.isWeekend) return null;
                      return (
                        <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs animate-fadeIn">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span><strong>Catatan Kalender:</strong> {holidayInfo.formattedDate} adalah <u>{holidayInfo.description}</u>.</span>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                              Pastikan terdapat lembur kerja atau penugasan resmi pada tanggal ini.
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Hidden File Input for Image Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />

                    {/* Compact Attached Photo Card (if photo selected) */}
                    {fotoBase64 && (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-2.5 flex items-center justify-between gap-3 animate-fadeIn">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                            {isCompressingPhoto ? (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            ) : (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={fotoBase64}
                                alt="Pratinjau Foto"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {fotoFileName || "Foto Kegiatan Terlampir"}
                              </span>
                            </div>
                            <label className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={enableWatermark}
                                onChange={(e) => handleToggleWatermark(e.target.checked)}
                                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
                              />
                              <span>Watermark Timestamp & Identitas Resmi</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {detectedPhotoDate && detectedPhotoDate.iso !== tanggalHarian && (
                            <button
                              type="button"
                              onClick={() => {
                                setTanggalHarian(detectedPhotoDate.iso);
                                toast.info(`Tanggal logbook diselaraskan ke tanggal foto: ${detectedPhotoDate.iso}`);
                              }}
                              className="text-[11px] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer"
                            >
                              Samakan ({detectedPhotoDate.iso})
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-1 text-zinc-400 hover:text-rose-500 transition cursor-pointer"
                            title="Hapus Foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Textarea Catatan Harian with Floating Action Toolbar */}
                    <div>
                      <label
                        htmlFor="input-catatan"
                        className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                      >
                        3. Catatan Kegiatan
                      </label>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropImage}
                        className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all"
                      >
                        <textarea
                          id="input-catatan"
                          rows={4}
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder={
                            fotoBase64
                              ? "Catatan santai pelengkap (AI juga akan menganalisis dari fotomu)..."
                              : "Tuliskan aktivitas santaimu hari ini (misal: bantu rekap nota excel dan bereskan packing)..."
                          }
                          disabled={isLoading}
                          className="w-full bg-transparent p-3.5 pb-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed border-0"
                        />

                        {/* Floating Action Toolbar at bottom inside textarea */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
                          <div className="flex items-center gap-1.5">
                            <VoiceDictationButton
                              onTranscript={(text) =>
                                setCatatan((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                              }
                            />

                            {/* Upload Foto Action Button */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${
                                fotoBase64
                                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700"
                                  : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              }`}
                              title="Unggah Foto Bukti Kegiatan (Vision AI)"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {fotoBase64 ? "Ganti Foto" : "Unggah Foto"}
                              </span>
                            </button>

                            {/* Smart Import Button */}
                            <button
                              type="button"
                              onClick={() => setIsSmartIngestionOpen(true)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Tarik commit GitHub atau jadwal kalender otomatis"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">GitHub / Agenda</span>
                            </button>

                            {/* Template Snippet Library Button */}
                            <button
                              type="button"
                              onClick={() => setIsTemplateLibraryOpen(true)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800 transition cursor-pointer"
                              title="Buka Library Templat Snippet (1-Click Insert)"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Templat</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleFillSample}
                            className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
                          >
                            Isi Contoh
                          </button>
                        </div>
                      </div>

                      {/* Quick 1-Click Snippet Pills Strip */}
                      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 shrink-0 font-medium">
                          <Bookmark className="w-3 h-3 text-indigo-500" />
                          Snippets:
                        </span>

                        {templateSnippets
                          .filter(
                            (t) =>
                              t.category === tipeKegiatan ||
                              t.category === "Umum / Rutinitas" ||
                              t.isCustom
                          )
                          .slice(0, 4)
                          .map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                handleSelectTemplateSnippet(t.content, "replace");
                                toast.success(`Templat "${t.title}" disisipkan!`);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-700 transition shrink-0 cursor-pointer"
                              title={`Klik untuk menyisipkan: "${t.content.slice(0, 70)}..."`}
                            >
                              <span>{t.title}</span>
                            </button>
                          ))}

                        <button
                          type="button"
                          onClick={() => setIsTemplateLibraryOpen(true)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-dashed border-indigo-300 dark:border-indigo-700 transition shrink-0 cursor-pointer"
                          title="Buka semua koleksi templat snippet"
                        >
                          <span>+ Semua ({templateSnippets.length})</span>
                        </button>

                        {catatan.trim() && (
                          <button
                            type="button"
                            onClick={() => setIsTemplateLibraryOpen(true)}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition shrink-0 cursor-pointer"
                            title="Simpan catatan yang sedang kamu ketik ke library templat"
                          >
                            <span>⭐ Simpan Catatan Ini</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Gaya Bahasa (Tone Humanizer) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          4. Gaya Bahasa (Tone Humanizer)
                        </label>
                        <span className="text-[10px] text-zinc-400">
                          Anti-Klise AI
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {TONE_OPTIONS.map((opt) => {
                          const isSelected = tone === opt.value;
                          return (
                            <div
                              key={opt.value}
                              onClick={() => setTone(opt.value)}
                              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                                isSelected
                                  ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 shadow-2xs"
                                  : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                                  {opt.label}
                                </span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                    isSelected
                                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                  }`}
                                >
                                  {opt.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                                {opt.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : mode === "weekly" ? (
                  /* KONDISIONAL: MODE BORONGAN 1 PEKAN */
                  <div className="space-y-4">
                    <div className="rounded-lg bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Rentang Tanggal Pekan Ini (Senin – Jumat)</span>
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Narasi Progresif 5 Tahap
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label
                            htmlFor="tanggal-mulai"
                            className="block text-[11px] text-zinc-500 mb-1"
                          >
                            Tanggal Mulai (Senin)
                          </label>
                          <input
                            id="tanggal-mulai"
                            type="date"
                            value={tanggalMulai}
                            suppressHydrationWarning
                            onChange={(e) => setTanggalMulai(e.target.value)}
                            disabled={isLoading}
                            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="tanggal-selesai"
                            className="block text-[11px] text-zinc-500 mb-1"
                          >
                            Tanggal Selesai (Jumat)
                          </label>
                          <input
                            id="tanggal-selesai"
                            type="date"
                            value={tanggalSelesai}
                            suppressHydrationWarning
                            onChange={(e) => setTanggalSelesai(e.target.value)}
                            disabled={isLoading}
                            className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                          />
                        </div>
                      </div>

                      {/* Deteksi Hari Libur Nasional Mode Borongan */}
                      {isHydrated && (() => {
                        const weeklyHolidays = checkRangeForHolidays(tanggalMulai, tanggalSelesai);
                        if (weeklyHolidays.length === 0) return null;
                        return (
                          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-[11px]">
                            <strong>Catatan Kalender:</strong> Terdapat {weeklyHolidays.length} hari libur dalam rentang ini ({weeklyHolidays.map((h) => h.formattedDate).join(", ")}).
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="input-ringkasan-mingguan"
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Ringkasan Aktivitas Pekan Ini
                        </label>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-400 mr-1">Contoh:</span>
                          {currentProgramConfig.weeklyExamples.slice(0, 2).map((ex) => (
                            <button
                              key={ex.label}
                              type="button"
                              onClick={() => handleFillWeeklySample(ex.summary)}
                              className="text-[11px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer"
                            >
                              {ex.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all">
                        <textarea
                          id="input-ringkasan-mingguan"
                          rows={4}
                          value={ringkasanMingguan}
                          onChange={(e) => setRingkasanMingguan(e.target.value)}
                          placeholder="Ceritakan secara santai apa saja yang kamu kerjakan selama 1 pekan ini..."
                          disabled={isLoading}
                          className="w-full bg-transparent p-3.5 pb-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed border-0"
                        />

                        {/* Floating Toolbar inside weekly textarea */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
                          <div className="flex items-center gap-1.5">
                            <VoiceDictationButton
                              onTranscript={(text) =>
                                setRingkasanMingguan((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                              }
                            />
                            <button
                              type="button"
                              onClick={() => setIsSmartIngestionOpen(true)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                              title="Tarik commit GitHub atau jadwal kalender otomatis"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">GitHub / Agenda</span>
                            </button>
                          </div>

                          <span className="text-[11px] text-zinc-400">
                            Alur 5 hari otomatis disusun AI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* KONDISIONAL: MODE LAPORAN BULANAN (MONEV) */
                  <div className="space-y-4">
                    <div className="rounded-lg bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Pilih Target Periode Bulan Pelaporan</span>
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Standar Monev MBKM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          "Bulan 1 (Pekan 1-4)",
                          "Bulan 2 (Pekan 5-8)",
                          "Mid-term (Tengah Periode)",
                          "Bulan 3 (Pekan 9-12)",
                          "Bulan 4 (Pekan 13-16)",
                        ].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBulan(b)}
                            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                              selectedBulan === b
                                ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-2xs"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/60"
                            }`}
                          >
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                              {b.split(" ")[0]} {b.split(" ")[1] || ""}
                            </span>
                            <span className="text-[10px] text-zinc-500 mt-1">
                              {b.includes("(") ? b.substring(b.indexOf("(") + 1, b.indexOf(")")) : "Evaluasi"}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-[11px] text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-zinc-500" />
                          <span>
                            <strong>Basis Data Historis:</strong> Menyintesis {history.length} entri riwayat logbook aktif.
                          </span>
                        </div>
                        {history.length === 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            (Belum ada riwayat harian tersimpan)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label
                          htmlFor="input-catatan-bulanan"
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Fokus Utama / Catatan Tambahan Laporan Kemajuan (Opsional)
                        </label>
                        <span className="text-[11px] text-zinc-400">
                          Milestone & Target IKU
                        </span>
                      </div>

                      <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-600 transition-all">
                        <textarea
                          id="input-catatan-bulanan"
                          rows={4}
                          value={monthlyNotes}
                          onChange={(e) => setMonthlyNotes(e.target.value)}
                          placeholder="Tambahkan catatan khusus, misal: 'Fokus bulan ini menyelesaikan modul backend dan integrasi gateway' atau biarkan kosong agar AI merangkum seluruh logbook..."
                          disabled={isLoading}
                          className="w-full bg-transparent p-3.5 pb-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none resize-y leading-relaxed border-0"
                        />

                        {/* Floating Toolbar inside monthly textarea */}
                        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs">
                          <div className="flex items-center gap-1.5">
                            <VoiceDictationButton
                              onTranscript={(text) =>
                                setMonthlyNotes((prev) =>
                                  prev ? `${prev} ${text}` : text
                                )
                              }
                            />
                          </div>
                          <span className="text-[11px] text-zinc-400">
                            Merangkum IKU, Milestone, Evaluasi & Target 4 Pekan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pesan Error */}
                {errorMsg && (
                  <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <div className="flex-1">
                      <p className="font-medium">Perhatian</p>
                      <p className="mt-0.5 text-rose-600 dark:text-rose-400/90">{errorMsg}</p>
                    </div>
                  </div>
                )}

                {/* Tombol Generate Logbook: Solid Monokromatik Bergaya Vercel / Linear */}
                <button
                  type="submit"
                  disabled={isLoading || isQuotaExhausted}
                  className={`w-full font-medium px-5 py-2.5 rounded-lg shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm ${
                    isQuotaExhausted
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed shadow-none"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {mode === "monthly"
                          ? "Menyintesis Laporan Bulanan..."
                          : mode === "weekly"
                            ? "Menyusun Narasi 1 Pekan..."
                            : fotoBase64
                              ? "Menganalisis Foto & Menyusun Logbook..."
                              : "Menyusun Logbook..."}
                      </span>
                    </>
                  ) : isQuotaExhausted ? (
                    <>
                      <Crown className="w-4 h-4 text-zinc-400" />
                      <span>Kuota Gratis Habis — Upgrade ke Pro</span>
                    </>
                  ) : mode === "monthly" ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Sintesis Laporan Bulanan (Monev)</span>
                    </>
                  ) : mode === "weekly" ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Logbook 1 Pekan</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Logbook Resmi</span>
                    </>
                  )}
                </button>
              </form>
            </section>

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
          <section
            ref={resultRef}
            className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 scroll-mt-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Batch {weeklyResults.length} Hari Kerja</span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    {tipeKegiatan} • {peran}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  Hasil Logbook 1 Pekan
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCopyAllWeeklyMarkdown}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs"
              >
                {copiedWeeklyAll ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Rekap Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Rekap (Markdown)</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {weeklyResults.map((dayItem, idx) => {
                const isSelected = expandedDayIdx === idx;
                return (
                  <button
                    key={`${dayItem.tanggal}-${idx}`}
                    type="button"
                    onClick={() => setExpandedDayIdx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Hari {idx + 1}: {dayItem.hari}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {weeklyResults.map((dayItem, idx) => {
                const isExpanded = expandedDayIdx === idx;
                const isDayCopied = copiedDayIdx === idx;

                return (
                  <div
                    key={`${dayItem.tanggal}-acc-${idx}`}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? "border-indigo-300 bg-white shadow-xs"
                        : "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                    }`}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDayIdx(isExpanded ? -1 : idx)
                        }
                        className="flex-1 flex items-start sm:items-center gap-3 text-left cursor-pointer"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            isExpanded
                              ? "bg-indigo-600 text-white"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          H-{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              {dayItem.tanggal}
                            </span>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                              {dayItem.tahap_fase}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {dayItem.deskripsi_kegiatan}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopySingleDayWeekly(dayItem, idx)
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isDayCopied
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isDayCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Hari Ini</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedDayIdx(isExpanded ? -1 : idx)
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                        {SECTIONS_CONFIG.map((sec) => {
                          const Icon = sec.icon;
                          const content = dayItem[sec.weeklyKey];
                          return (
                            <div
                              key={sec.key}
                              className={`rounded-xl p-3.5 border ${sec.bgClass} ${sec.borderClass}`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <div
                                  className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 ${sec.accentClass}`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-slate-900">
                                    {sec.number}. {sec.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block">
                                    {sec.badge}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-0 sm:pl-9">
                                {content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAMPILAN HASIL MODE BULANAN (MONEV KEMAJUAN MBKM)                 */}
        {/* ================================================================= */}
        {mode === "monthly" && monthlyResult && !isLoading && (
          <section
            ref={resultRef}
            className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5 scroll-mt-16"
          >
            {/* Header Hasil Bulanan + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{monthlyResult.periodeBulan}</span>
                  </span>
                  <span className="text-xs text-zinc-500">
                    {tipeKegiatan} • {peran.trim() || "Mahasiswa"}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  Hasil Sintesis Laporan Kemajuan Bulanan (Monev)
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={async () => {
                    const fullText = [
                      `# ${monthlyResult.periodeBulan}`,
                      `**Nama Mahasiswa**: ${studentProfile.namaMahasiswa} (${studentProfile.nim})`,
                      `**Mitra**: ${studentProfile.namaMitra} | **Program**: ${tipeKegiatan}`,
                      `**Peran**: ${peran.trim() || "Peserta"}`,
                      "",
                      "## 1. Ringkasan Pencapaian IKU (Capaian Pembelajaran)",
                      monthlyResult.ringkasanPencapaianIKU,
                      "",
                      "## 2. Milestone & Progres Proyek Utama",
                      monthlyResult.milestoneProyekUtama,
                      "",
                      "## 3. Evaluasi Hambatan & Solusi Mitigasi",
                      monthlyResult.evaluasiHambatanDanSolusi,
                      "",
                      "## 4. Rencana Kerja Strategis 4 Pekan ke Depan",
                      monthlyResult.rencanaEmpatPekanKedepan,
                      "",
                      "## 5. Refleksi Pembelajaran Bermakna & Saran Kolaborasi",
                      monthlyResult.rekomendasiDanRefleksi,
                    ].join("\n");
                    try {
                      await navigator.clipboard.writeText(fullText);
                      setCopiedMonthlyField("all");
                      setTimeout(() => setCopiedMonthlyField(null), 2000);
                      toast.success("Seluruh naskah laporan bulanan tersalin!");
                    } catch {
                      // ignore
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-xs"
                >
                  {copiedMonthlyField === "all" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Semua Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua (MD)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportMonthlyDocx}
                  disabled={isExportingMonthlyDocx}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs disabled:opacity-50"
                >
                  {isExportingMonthlyDocx ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengekspor Word...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Dokumen (.docx)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 5 Kartu Bagian Laporan Bulanan */}
            <div className="space-y-4">
              {[
                {
                  id: "iku",
                  title: "Ringkasan Pencapaian IKU & Capaian Pembelajaran",
                  badge: "Indikator Kinerja Utama (IKU MBKM / CPL Kurikulum OBE)",
                  icon: Award,
                  content: monthlyResult.ringkasanPencapaianIKU,
                },
                {
                  id: "milestone",
                  title: "Milestone & Progres Proyek Utama",
                  badge: "Deliverables & Progres Kerja Industri",
                  icon: CheckCircle2,
                  content: monthlyResult.milestoneProyekUtama,
                },
                {
                  id: "evaluasi",
                  title: "Evaluasi Hambatan, Tantangan, & Solusi Mitigasi",
                  badge: "Problem Solving & Kendala Teratasi",
                  icon: AlertTriangle,
                  content: monthlyResult.evaluasiHambatanDanSolusi,
                },
                {
                  id: "rencana",
                  title: "Rencana Kerja Strategis & Target 4 Pekan ke Depan",
                  badge: "Action Plan & Timeline Kerja Lanjutan",
                  icon: Calendar,
                  content: monthlyResult.rencanaEmpatPekanKedepan,
                },
                {
                  id: "refleksi",
                  title: "Refleksi Pembelajaran Bermakna & Evaluasi",
                  badge: "Pengembangan Diri & Rekomendasi Sinergi Mitra",
                  icon: Lightbulb,
                  content: monthlyResult.rekomendasiDanRefleksi,
                },
              ].map((section, idx) => {
                const IconComponent = section.icon;
                const isCopied = copiedMonthlyField === section.id;

                return (
                  <div
                    key={section.id}
                    className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 transition hover:border-zinc-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-200/70 dark:bg-zinc-700 flex items-center justify-center shrink-0 text-zinc-800 dark:text-zinc-200">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {idx + 1}. {section.title}
                          </h3>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                            {section.badge}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(section.content);
                            setCopiedMonthlyField(section.id);
                            setTimeout(() => setCopiedMonthlyField(null), 2000);
                            toast.success(`Bagian ${idx + 1} berhasil disalin!`);
                          } catch {
                            // ignore
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer shrink-0"
                        title="Salin teks bagian ini"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line pl-0 sm:pl-9.5">
                      {section.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* TAMPILAN HASIL MODE HARIAN (LENGKAP DENGAN BUKTI DOKUMENTASI FOTO)*/}
        {/* ================================================================= */}
        {mode === "daily" && result && !isLoading && (
          <section
            ref={resultRef}
            className="bg-white dark:bg-zinc-900 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 scroll-mt-16"
          >
            {/* Header Hasil + Tombol Salin Semua */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {tipeKegiatan}
                  </span>
                  <span className="text-xs text-zinc-500 truncate max-w-[200px]">
                    • {peran}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  Hasil Logbook Harian Resmi
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Semua Bagian Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Semua</span>
                  </>
                )}
              </button>
            </div>

            {/* Bukti Dokumentasi Kegiatan (Jika ada foto yang dianalisis) */}
            {resultPhoto && (
              <div className="rounded-xl p-3.5 bg-indigo-50/50 border border-indigo-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border border-indigo-200 bg-white shrink-0 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultPhoto}
                    alt="Bukti Dokumentasi Kegiatan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1 text-center sm:text-left">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Bukti Dokumentasi Kegiatan Terverifikasi</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Narasi di bawah ini telah disinkronkan secara multimodal
                    berdasarkan pengamatan visual foto dokumentasimu. Foto ini
                    juga akan otomatis tersemat di Laporan Word (.docx) & Slide
                    Sidang (.pptx).
                  </p>
                </div>
              </div>
            )}

            {/* 5 Kartu Bagian Logbook */}
            <div className="space-y-3.5">
              {SECTIONS_CONFIG.map((sec) => {
                const Icon = sec.icon;
                const isCopied = copiedSection === sec.key;
                const content = result[sec.key];

                return (
                  <div
                    key={sec.key}
                    className={`rounded-xl p-4 border transition ${sec.bgClass} ${sec.borderClass}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${sec.accentClass}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-400">
                              {sec.number}.
                            </span>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                              {sec.title}
                            </h3>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 block">
                            {sec.badge}
                          </span>
                        </div>
                      </div>

                      {/* Tombol Salin per Bagian */}
                      <button
                        type="button"
                        onClick={() => handleCopySection(sec.key, sec.title)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 cursor-pointer ${
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Bagian</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-0 sm:pl-10">
                      {content}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* PANEL AKSI: HUB EKSPOR & INTEGRASI DOKUMEN */}
        {hasAnyOutput && !isLoading && (
          <section className="bg-white dark:bg-zinc-900/60 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md mb-1">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Hub Ekspor Dokumen</span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Ekspor & Integrasi Dokumen Resmi
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Unduh seluruh riwayat logbook ke format resmi kampus atau sinkronkan ke cloud.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleToggleBulkSelectionMode}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    isBulkSelectionActive
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isBulkSelectionActive ? "Tutup Mode Seleksi" : "Pilih Entri Kustom (Bulk Select)"}</span>
                  {isBulkSelectionActive && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 dark:bg-zinc-900/20">
                      {getSelectedEntriesForExport().length}/{getEntriesForExport().length}
                    </span>
                  )}
                </button>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {isBulkSelectionActive
                      ? `${getSelectedEntriesForExport().length} Terpilih`
                      : `${getEntriesForExport().length} Entri Siap Diekspor`}
                  </span>
                </div>
              </div>
            </div>

            {/* Pilihan Preset Pedoman Kampus */}
            <div className="rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    Preset Pedoman Kampus (.docx & .pptx)
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                  {KAMPUS_PRESETS.find((p) => p.value === selectedPreset)?.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {KAMPUS_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.value;
                  return (
                    <div
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-800 shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {preset.label}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel Bulk Selection & Filter Entri Logbook */}
            <div className="rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        Seleksi Entri Logbook (Bulk Select)
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {isBulkSelectionActive
                          ? `${getSelectedEntriesForExport().length} dari ${getEntriesForExport().length} dipilih`
                          : `Semua (${getEntriesForExport().length}) entri`}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Pilih beberapa entri spesifik dari riwayat untuk digabungkan menjadi satu file Word (.docx) atau Excel (.xlsx) resmi.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleBulkSelectionMode}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${
                      isBulkSelectionActive
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>{isBulkSelectionActive ? "Sembunyikan Daftar Entri" : "Buka & Kustomisasi Entri"}</span>
                  </button>
                </div>
              </div>

              {/* Detail Kontrol & Tabel Seleksi Entri saat Mode Aktif */}
              {isBulkSelectionActive && (
                <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800/80 space-y-2.5">
                  {/* Bar Pencarian & Tombol Aksi Cepat */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Cari entri berdasarkan tanggal, kegiatan, atau kata kunci..."
                        value={bulkExportSearchQuery}
                        onChange={(e) => setBulkExportSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                      />
                      {bulkExportSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setBulkExportSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllExportEntries}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                      >
                        Pilih Semua ({getEntriesForExport().length})
                      </button>
                      <button
                        type="button"
                        onClick={handleDeselectAllExportEntries}
                        className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                      >
                        Batal Semua
                      </button>
                      {getEntriesForExport().length > 7 && (
                        <button
                          type="button"
                          onClick={() => handleSelectRecentExportEntries(7)}
                          className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                        >
                          7 Terakhir
                        </button>
                      )}
                      {getEntriesForExport().length > 30 && (
                        <button
                          type="button"
                          onClick={() => handleSelectRecentExportEntries(30)}
                          className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-medium transition cursor-pointer"
                        >
                          30 Terakhir
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Kategori Tipe Kegiatan */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
                    <span className="text-zinc-400 dark:text-zinc-500 font-medium shrink-0">Filter:</span>
                    {[
                      { id: "all", label: "Semua Program" },
                      { id: "Magang MBKM", label: "Magang" },
                      { id: "KKN Tematik", label: "KKN" },
                      { id: "Studi Independen", label: "Studi Independen" },
                      { id: "Praktik Kerja Lapangan (PKL)", label: "PKL" },
                    ].map((tab) => {
                      const count =
                        tab.id === "all"
                          ? getEntriesForExport().length
                          : getEntriesForExport().filter((e) => e.tipeKegiatan === tab.id).length;
                      if (count === 0 && tab.id !== "all") return null;
                      const isActive = bulkExportFilterType === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setBulkExportFilterType(tab.id)}
                          className={`px-2 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 ${
                            isActive
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                          }`}
                        >
                          {tab.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Daftar Entri Scrollable dengan Checkbox */}
                  <div className="max-h-64 sm:max-h-72 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900/60 shadow-2xs">
                    {(() => {
                      const all = getEntriesForExport();
                      const query = bulkExportSearchQuery.toLowerCase().trim();
                      const filtered = all.filter((item) => {
                        const matchesQuery =
                          !query ||
                          item.tanggal?.toLowerCase().includes(query) ||
                          item.hari?.toLowerCase().includes(query) ||
                          item.deskripsiKegiatan?.toLowerCase().includes(query) ||
                          item.kompetensiDikembangkan?.toLowerCase().includes(query) ||
                          item.tipeKegiatan?.toLowerCase().includes(query) ||
                          item.tahapFase?.toLowerCase().includes(query);

                        const matchesType =
                          bulkExportFilterType === "all" ||
                          item.tipeKegiatan === bulkExportFilterType;

                        return matchesQuery && matchesType;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                            Tidak ada entri logbook yang cocok dengan filter atau kata kunci.
                          </div>
                        );
                      }

                      return filtered.map((entry, idx) => {
                        const entryId = entry.id || `entry-${idx}`;
                        const isSelected = selectedExportEntryIds.includes(entryId);
                        return (
                          <div
                            key={entryId}
                            onClick={() => handleToggleBulkSelectEntry(entryId)}
                            className={`p-3 flex items-start gap-3 transition cursor-pointer select-none ${
                              isSelected
                                ? "bg-zinc-50/90 dark:bg-zinc-800/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70"
                                : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition ${
                                  isSelected
                                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                                    : "border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                  {entry.tanggal || `Entri #${idx + 1}`}
                                </span>
                                {entry.hari && (
                                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                    • {entry.hari}
                                  </span>
                                )}
                                {entry.tipeKegiatan && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
                                    {entry.tipeKegiatan}
                                  </span>
                                )}
                                {entry.tahapFase && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                                    {entry.tahapFase}
                                  </span>
                                )}
                                {entry.qualityScore && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                                    ★ {entry.qualityScore}/100
                                  </span>
                                )}
                                {entry.fotoBase64 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                                    <Camera className="w-2.5 h-2.5" />
                                    <span>Foto Lampiran</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                {entry.deskripsiKegiatan || entry.kendalaDihadapi || "Tidak ada detail kegiatan."}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    })()}
                  </div>

                  {/* Ringkasan & Tombol Aksi Cepat Unduh Langsung */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        Dokumen akan menggabungkan <strong>{getSelectedEntriesForExport().length}</strong> entri logbook terpilih secara kronologis ke 1 file tunggal.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleExportWord}
                        disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ekspor Word ({getSelectedEntriesForExport().length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportExcel}
                        disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Ekspor Excel ({getSelectedEntriesForExport().length})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pengaturan Opsional Biodata Cover Word & Slide Sidang */}
            <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowProfileEditor((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>
                    Identitas Cover Laporan & Slide Sidang (Nama, NIM, Mitra, Logo)
                  </span>
                </span>
                {showProfileEditor ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showProfileEditor && (
                <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Lengkap Mahasiswa
                    </label>
                    <input
                      type="text"
                      value={studentProfile.namaMahasiswa}
                      onChange={(e) =>
                        handleUpdateProfile("namaMahasiswa", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      NIM Mahasiswa
                    </label>
                    <input
                      type="text"
                      value={studentProfile.nim}
                      onChange={(e) =>
                        handleUpdateProfile("nim", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Program Studi
                    </label>
                    <input
                      type="text"
                      value={studentProfile.programStudi}
                      onChange={(e) =>
                        handleUpdateProfile("programStudi", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Perguruan Tinggi
                    </label>
                    <input
                      type="text"
                      value={studentProfile.perguruanTinggi}
                      onChange={(e) =>
                        handleUpdateProfile("perguruanTinggi", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Mitra / Instansi / Desa KKN
                    </label>
                    <input
                      type="text"
                      value={studentProfile.namaMitra}
                      onChange={(e) =>
                        handleUpdateProfile("namaMitra", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dosen Pembimbing / Mentor
                    </label>
                    <input
                      type="text"
                      value={studentProfile.namaPembimbing}
                      onChange={(e) =>
                        handleUpdateProfile("namaPembimbing", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  {/* Upload Logo Kampus */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-700">
                        Logo Kampus / Universitas (PNG/JPG)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Otomatis disematkan di Cover Laporan Word (.docx) dan Slide Judul PowerPoint (.pptx).
                      </p>
                    </div>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />

                    {studentProfile.logoKampusBase64 ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={studentProfile.logoKampusBase64}
                            alt="Logo Kampus"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                        >
                          Hapus Logo
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Logo Kampus</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifikasi Toast Sukses Ekspor */}
            {exportSuccessToast && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exportSuccessToast}</span>
              </div>
            )}

            {/* Tombol Utama: Sintesis AI Bab I-V Laporan Lengkap */}
            <button
              type="button"
              onClick={handleSynthesizeAndExportWord}
              disabled={isSynthesizingReport || exportingType !== null}
              className="w-full flex items-center justify-between p-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-medium text-left transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center shrink-0">
                  {isSynthesizingReport ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white dark:text-zinc-900" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white dark:text-zinc-900" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold">
                      Sintesis Bab I–V + Unduh Laporan Lengkap (.docx)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-800 dark:bg-zinc-200 text-zinc-100 dark:text-zinc-900">
                      Academic
                    </span>
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-indigo-500/30 text-indigo-200 dark:text-indigo-800 border border-indigo-400/40">
                        {getSelectedEntriesForExport().length} Entri Tergabung
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                    Menyusun Bab I (Latar Belakang), Bab II (Teori), Bab IV (Pembahasan), dan Bab V (Saran) langsung ke Word dari {getSelectedEntriesForExport().length} entri.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-2.5 py-1 rounded-md">
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </div>
            </button>

            {/* Grid Tombol Unduh Dokumen (.xlsx, .docx, .pptx) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                className="flex flex-col items-start justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex items-center gap-1.5">
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {getSelectedEntriesForExport().length} Entri
                      </span>
                    )}
                    {exportingType === "excel" && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  Rekap Excel (.xlsx)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isBulkSelectionActive
                    ? `${getSelectedEntriesForExport().length} Entri Tergabung`
                    : "Tabel Formal 8 Kolom"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportWord}
                disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                className="flex flex-col items-start justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="flex items-center gap-1.5">
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {getSelectedEntriesForExport().length} Entri
                      </span>
                    )}
                    {exportingType === "word" && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  Laporan Word (.docx)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isBulkSelectionActive
                    ? `${getSelectedEntriesForExport().length} Entri Tergabung`
                    : "TNR 12pt • Cover & Foto"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportPowerPoint}
                disabled={exportingType !== null || getSelectedEntriesForExport().length === 0}
                className="flex flex-col items-start justify-between p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer disabled:opacity-50 text-left"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <Presentation className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div className="flex items-center gap-1.5">
                    {isBulkSelectionActive && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {getSelectedEntriesForExport().length} Entri
                      </span>
                    )}
                    {exportingType === "pptx" && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  Slide Sidang (.pptx)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  {isBulkSelectionActive
                    ? `${getSelectedEntriesForExport().length} Entri Tergabung`
                    : "Slide Sidang + Foto"}
                </span>
              </button>
            </div>

            {/* Grid Tombol Integrasi Cloud & Canva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenDriveSyncModal}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium text-xs transition cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-zinc-500" />
                <span>Sync to Google Drive / Sheets</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCanvaPoster}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 font-medium text-xs transition cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-zinc-500" />
                <span>Buat Poster di Canva</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

            {/* Panel Draf Teks Luaran Canva */}
            {canvaBannerOpen && (
              <div className="rounded-xl bg-violet-50/90 border border-violet-200 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-violet-900 flex items-center gap-1.5">
                      🎨 Draf Teks Luaran Poster Siap Di-Paste ke Canva!
                    </span>
                    <p className="text-[11px] text-violet-700 mt-0.5">
                      Tab Canva telah dibuka. Draf ringkasan poster di bawah ini
                      sudah otomatis disalin ke clipboard Anda (tinggal tekan{" "}
                      <strong>Ctrl+V</strong> di desain Canva).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCanvaBannerOpen(false)}
                    className="text-violet-500 hover:text-violet-800 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <pre className="text-[11px] bg-white/90 border border-violet-200 rounded-lg p-3 text-slate-700 whitespace-pre-wrap font-sans max-h-44 overflow-y-auto">
                  {buildCanvaPosterDraft()}
                </pre>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        buildCanvaPosterDraft()
                      );
                      setCopiedCanvaDraft(true);
                      setTimeout(() => setCopiedCanvaDraft(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    {copiedCanvaDraft ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Draf Poster Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Ulang Draf Poster</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Kartu Integrasi Ekstensi Browser Auto-Fill Portal Kampus */}
            <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-700/50 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shrink-0">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white">
                        Ekstensi Auto-Fill Portal Kampus
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Chrome / Edge / Opera V3
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      Isi form logbook di portal Kampus Merdeka / SIM KKN secara otomatis dengan 1x klik.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsExtensionModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold cursor-pointer self-start sm:self-auto"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Panduan Pasang (3 Langkah)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. Sync Langsung ke Ekstensi (Zero-Click Bridge) */}
                <button
                  type="button"
                  onClick={handleSyncDirectToExtension}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-200" />
                  <span>⚡ Kirim ke Ekstensi (1-Click Sync)</span>
                </button>

                {/* 2. Unduh Ekstensi Auto-Fill */}
                <button
                  type="button"
                  onClick={handleDownloadExtension}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>🧩 Unduh Ekstensi (.zip)</span>
                </button>

                {/* 3. Salin Data untuk Ekstensi */}
                <button
                  type="button"
                  onClick={handleCopyExtensionJson}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs transition cursor-pointer"
                >
                  {copiedExtensionJson ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Data JSON Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <FileJson className="w-4 h-4 text-indigo-300" />
                      <span>📋 Salin Data Manual</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
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

      {/* Modal Smart Ingestion (GitHub Commit Sync & Agenda Kalender) */}
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
            setStudentProfile((prev) => ({
              ...prev,
              namaMahasiswa: user.displayName || prev.namaMahasiswa,
              nim: user.nim || prev.nim,
              perguruanTinggi: user.campus || prev.perguruanTinggi,
              programStudi: user.prodi || prev.programStudi,
            }));
          }
        }}
        initialName={studentProfile.namaMahasiswa || ""}
        initialNim={studentProfile.nim || ""}
        initialCampus={studentProfile.perguruanTinggi || ""}
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
