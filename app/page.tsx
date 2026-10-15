"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { ToneType, TONE_OPTIONS, LicenseInfo, KknProkerItem } from "@/src/lib/types/modules";
import { LicenseModal } from "@/src/components/LicenseModal";
import { VoiceDictationButton } from "@/src/components/VoiceDictationButton";
import { SmartIngestionModal } from "@/src/components/SmartIngestionModal";
import { WorkspaceSyncModal } from "@/src/components/WorkspaceSyncModal";
import { AuditHistoryPanel } from "@/src/components/AuditHistoryPanel";
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
  StorageEstimateInfo,
} from "@/src/lib/storage/indexedDbStore";

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
  const [mode, setMode] = useState<"daily" | "weekly">("daily");
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
        const [idbHistory, idbProfile, idbMentor, idbCourses] = await Promise.all([
          getStoredHistory(),
          getStoredProfile(),
          getStoredMentorData(),
          getStoredSksCourses(),
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

        const est = await getStorageUsageEstimate();
        if (isMounted) {
          setStorageInfo(est);
        }
      } catch (err) {
        console.warn("IndexedDB bootstrap warning:", err);
      }
    })();

    return () => {
      isMounted = false;
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

  // Handler Upload Foto Vision (File Reader to Base64)
  const processImageFile = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format file harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran foto maksimal 5MB. Silakan pilih foto yang lebih kecil.");
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setFotoBase64(resultStr);
      setFotoMimeType(file.type || "image/jpeg");
      setFotoFileName(file.name);
    };
    reader.onerror = () => {
      setErrorMsg("Gagal membaca file gambar. Silakan coba lagi.");
    };
    reader.readAsDataURL(file);
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

  // Daftar entri yang akan diekspor ke Excel, Word, dan PowerPoint
  const getEntriesForExport = (): LogbookEntry[] => {
    if (history.length > 0) {
      return history;
    }
    if (weeklyResults.length > 0) {
      return weeklyResults.map((day, idx) => ({
        id: `weekly-${idx}`,
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
          id: "current",
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

  const triggerToast = (msg: string) => {
    setExportSuccessToast(msg);
    setTimeout(() => {
      setExportSuccessToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleExportExcel = async () => {
    const entries = getEntriesForExport();
    if (entries.length === 0) return;
    setExportingType("excel");
    try {
      const { exportLogbookToExcel } = await import("@/src/lib/exporters/exportExcel");
      await exportLogbookToExcel(entries, studentProfile);
      triggerToast(
        `Berhasil mengunduh Rekap Excel (.xlsx) berisi ${entries.length} entri logbook!`
      );
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      setErrorMsg("Gagal mengekspor file Excel (.xlsx). Silakan coba lagi.");
    } finally {
      setExportingType(null);
    }
  };

  const handleExportWord = async () => {
    const entries = getEntriesForExport();
    if (entries.length === 0) return;
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
        `Berhasil mengunduh Laporan Resmi [${presetObj?.label}] (.docx) berisi ${entries.length} entri!`
      );
    } catch (err) {
      console.error("Gagal ekspor Word:", err);
      setErrorMsg("Gagal mengekspor dokumen Word (.docx). Silakan coba lagi.");
    } finally {
      setExportingType(null);
    }
  };

  const handleExportPowerPoint = async () => {
    const entries = getEntriesForExport();
    if (entries.length === 0) return;
    setExportingType("pptx");
    try {
      const { exportLogbookToPowerPoint } = await import("@/src/lib/exporters/exportPowerPoint");
      await exportLogbookToPowerPoint(
        entries,
        studentProfile,
        mentorAdminData || undefined
      );
      triggerToast(
        "Berhasil mengunduh Slide Presentasi Sidang Akhir (.pptx)!"
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  LogMagang <span className="text-indigo-600">OS</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                Platform Terpadu Logbook, Konversi SKS, CV ATS, & Sidang
              </p>
            </div>
          </div>

          {/* Indikator Kuota Gratis & Lisensi Pro */}
          {isHydrated && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsWorkspaceSyncOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-white text-slate-700 hover:text-indigo-600 border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                title="Sinkronisasi Data Multi-Device (HP <-> Laptop) & Cadangan JSON"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Backup & Sync</span>
              </button>

              {isPro ? (
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-sm transition cursor-pointer"
                  title="Klik untuk melihat detail Lisensi Pro Anda"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-200" />
                  <span>
                    👑 {licenseDetails?.tier === "sultan" ? "Sultan Pro Aktif" : "Member Pro Aktif"}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                    remainingQuota > 0
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 animate-pulse"
                  }`}
                  title="Klik untuk upgrade ke LogMagang Pro"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    Kuota: {remainingQuota}/{MAX_FREE_QUOTA} • <strong className="underline underline-offset-2">Upgrade Pro 🚀</strong>
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 6 Tabs Navigation Bar */}
        <div className="border-t border-slate-100 bg-slate-50/80">
          <div className="max-w-5xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setMainTab("generator")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mainTab === "generator"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Generator & Dokumen</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("sks")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mainTab === "sks"
                  ? "bg-amber-600 text-white shadow-sm shadow-amber-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Konversi 20 SKS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                OBE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("resume")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mainTab === "resume"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>CV ATS & LinkedIn</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                STAR
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("simulator")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mainTab === "simulator"
                  ? "bg-rose-600 text-white shadow-sm shadow-rose-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Simulasi Sidang DPL</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                Skeptis
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("kkn")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mainTab === "kkn"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Tent className="w-4 h-4" />
              <span>Tim KKN Desa</span>
            </button>

            <button
              type="button"
              onClick={() => setMainTab("admin")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                mainTab === "admin"
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Berkas & Penilaian</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                Docx
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-5 pb-14 space-y-6">
        {mainTab === "generator" && (
          <>
            {/* Hero Banner */}
            <section className="text-center sm:text-left bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2.5">
                <Camera className="w-3.5 h-3.5" />
                <span>Multimodal Vision • Analisis Foto Dokumentasi Kegiatan</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Ubah Catatan & Foto Lapangan Jadi{" "}
                <span className="text-indigo-600">
                  Logbook & Dokumen Sidang Resmi
                </span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Unggah foto layar kerja atau kegiatan lapanganmu, lalu AI akan
                menginspeksi bukti visual dan menyusun laporan formal berstandar
                Taksonomi Bloom.
              </p>
            </section>

        {/* Kartu Ajakan Aktivasi Langganan & Monetisasi QRIS (Ditampilkan saat kuota 3x habis) */}
        {isHydrated && isQuotaExhausted && (
          <section
            ref={paywallRef}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-7 shadow-2xl border border-indigo-500/30 space-y-5"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
                <Crown className="w-3.5 h-3.5" />
                <span>Kuota Gratis 3/3 Telah Terpakai</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLicenseModalOpen(true)}
                  className="text-xs text-amber-300 hover:text-white underline font-semibold cursor-pointer"
                >
                  Lihat Detail Paket Lengkap
                </button>
                <span className="text-slate-500">•</span>
                <button
                  type="button"
                  onClick={handleResetQuota}
                  title="Reset kuota gratis untuk keperluan pengujian"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Demo
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Upgrade ke LogMagang Pro 🚀
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-indigo-100/90 leading-relaxed max-w-2xl">
                Buka seluruh potensi akademik dan karier Anda. Pilih paket langganan yang sesuai dengan kebutuhan magang atau program MBKM Anda:
              </p>
            </div>

            {/* 2 Pilihan Kartu Paket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Paket Reguler */}
              <div className="rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/15 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                      Paket Reguler Magang
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                      Hemat Mahasiswa
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">Rp25.000</span>
                    <span className="text-xs text-indigo-200"> / 3 Bulan</span>
                  </div>
                  <p className="text-[11px] text-indigo-200 mt-1">
                    Ideal untuk logbook harian rutin dan bebas tugas nunggak.
                  </p>

                  <ul className="mt-3 space-y-1.5 text-xs text-indigo-100 border-t border-white/10 pt-2.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong>Unlimited</strong> Logbook Harian</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong>Mode Borongan</strong> 1 Pekan Sekaligus</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Tone Humanizer (Anti-Klise AI)</span>
                    </li>
                  </ul>
                </div>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    "Halo Admin LogMagang! Saya ingin beli Paket Reguler Magang (Rp25.000) via QRIS."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs text-center border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>💳 Bayar Rp25.000 via QRIS</span>
                  <ExternalLink className="w-3 h-3 text-indigo-200" />
                </a>
              </div>

              {/* Paket Sultan */}
              <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-white/10 backdrop-blur-md border border-amber-400/40 space-y-3 flex flex-col justify-between shadow-lg relative">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Paket Sultan Lulus MBKM</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-xs">
                      BESTSELLER 🏆
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">Rp49.000</span>
                    <span className="text-xs text-amber-200"> / Periode</span>
                  </div>
                  <p className="text-[11px] text-amber-100/90 mt-1">
                    Seluruh fitur OS lengkap: logbook, konversi SKS, CV ATS, hingga sidang A.
                  </p>

                  <ul className="mt-3 space-y-1.5 text-xs text-amber-50 border-t border-amber-400/20 pt-2.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Semua Fitur Reguler</strong> + Vision Foto</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Ekspor Dokumen <strong>Word, Excel & PPT</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>Matriks Konversi 20 SKS</strong> OBE</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span><strong>CV ATS Harvard</strong> & Simulasi DPL</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Ekstensi Chrome & Tim KKN Desa</span>
                    </li>
                  </ul>
                </div>

                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    "Halo Admin LogMagang! Saya ingin beli Paket Sultan Lulus MBKM (Rp49.000) via QRIS."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs text-center transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>💳 Bayar Rp49.000 via QRIS</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Form Input Kode Lisensi Langsung */}
            <div className="rounded-2xl p-4 bg-white/10 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sudah bayar? Masukkan Kode Lisensi Pro:</span>
                </span>
                <span className="text-[11px] text-indigo-200">
                  Aktivasi Instan & Validasi Server
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={inlineLicenseCode}
                  onChange={(e) => setInlineLicenseCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: LMPRO-2026-BERES"
                  className="flex-1 text-xs sm:text-sm font-mono font-bold uppercase p-2.5 rounded-xl border border-white/20 bg-slate-900/80 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyInlineLicense()}
                  disabled={isInlineVerifying}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isInlineVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      <span>Aktivasi Sekarang</span>
                    </>
                  )}
                </button>
              </div>

              {inlineLicenseError && (
                <p className="text-xs text-rose-300 bg-rose-500/20 border border-rose-500/30 p-2.5 rounded-xl leading-relaxed">
                  {inlineLicenseError}
                </p>
              )}

              {/* Preset Kode Demo Cepat untuk Pengujian */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-indigo-200 mr-1">
                  ⚡ Kode Demo Cepat:
                </span>
                {["LMPRO-2026-BERES", "LMPRO-SULTAN-99", "KKN-DESA-2026"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setInlineLicenseCode(code);
                      handleVerifyInlineLicense(code);
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono border border-white/15 transition cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Heatmap Kehadiran 30 Hari Kerja & Kalkulator 900 Jam MBKM */}
        <AttendanceTracker
          history={history}
          onSelectDateToBackfill={(isoDate, displayDate) => {
            setMode("daily");
            setTanggalHarian(isoDate);
            triggerToast(`Form disetel untuk mengisi logbook tanggal ${displayDate}`);
            const formElem = document.getElementById("daily-form-card");
            if (formElem) {
              formElem.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* Form Input Card dengan Tab Switcher di Bagian Atas */}
        <section id="daily-form-card" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
          {/* Tab Switcher: Mode Harian vs Mode Borongan (1 Pekan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setMode("daily");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === "daily"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📅 Mode Harian (1 Hari) + Vision</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("weekly");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === "weekly"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <span>⚡ Mode Borongan (1 Pekan)</span>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  mode === "weekly"
                    ? "bg-amber-400 text-slate-950"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                Populer / Anti-Nunggak
              </span>
            </button>
          </div>

          <form
            onSubmit={
              mode === "daily" ? handleGenerateDaily : handleGenerateWeekly
            }
            className="space-y-5"
          >
            {/* 1. Pilihan Program */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
                1. Pilih Program Kegiatan
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
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
                      className={`flex flex-col items-center sm:items-start text-center sm:text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25"
                          : "bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mb-1.5 ${
                          isSelected ? "text-indigo-100" : "text-indigo-600"
                        }`}
                      />
                      <span className="font-bold text-xs sm:text-sm leading-tight">
                        {prog.label}
                      </span>
                      <span
                        className={`hidden sm:block text-[11px] mt-0.5 leading-tight ${
                          isSelected ? "text-indigo-100" : "text-slate-500"
                        }`}
                      >
                        {prog.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Input Peran / Posisi */}
            <div>
              <label
                htmlFor="input-peran"
                className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5"
              >
                2. Peran / Posisi
              </label>
              <div className="relative">
                <input
                  id="input-peran"
                  type="text"
                  value={peran}
                  onChange={(e) => setPeran(e.target.value)}
                  placeholder='Contoh: "Social Media Specialist", "Staff Operasional"'
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-500/15 disabled:bg-slate-100 transition"
                />
              </div>

              {/* Saran Peran Cepat */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 mr-0.5">
                  Contoh cepat:
                </span>
                {currentProgramConfig.roleExamples.map((roleSample) => (
                  <button
                    key={roleSample}
                    type="button"
                    onClick={() => setPeran(roleSample)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      peran === roleSample
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {roleSample}
                  </button>
                ))}
              </div>
            </div>

            {/* KONDISIONAL: MODE HARIAN (DENGAN AREA UNGGAH FOTO VISION) */}
            {mode === "daily" ? (
              <div className="space-y-4">
                {/* Tanggal Kegiatan Harian */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <div>
                      <label htmlFor="input-tanggal-harian" className="text-xs font-bold text-slate-800 block">
                        Tanggal Kegiatan Harian
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Pilih tanggal kegiatan (klik tanggal kosong di kalender atas untuk mengisi hari terlewat)
                      </span>
                    </div>
                  </div>
                  <input
                    id="input-tanggal-harian"
                    type="date"
                    value={tanggalHarian}
                    onChange={(e) => setTanggalHarian(e.target.value)}
                    disabled={isLoading}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Area Unggah Foto Dokumentasi (Vision-to-Logbook) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Foto Bukti Dokumentasi Kegiatan (Vision AI)</span>
                    </label>
                    {fotoBase64 && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2 cursor-pointer"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />

                  {!fotoBase64 ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDropImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 sm:p-5 bg-slate-50/70 hover:bg-indigo-50/30 transition text-center cursor-pointer space-y-2"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-800">
                          Klik untuk upload foto atau drag & drop ke sini
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Format JPG, PNG, atau WebP (Maksimal 5MB)
                        </p>
                      </div>
                      <p className="text-[11px] text-indigo-600 font-semibold bg-indigo-50/80 rounded-lg p-2 max-w-md mx-auto leading-relaxed border border-indigo-100">
                        📸 <strong>Opsional tapi sangat disarankan:</strong>{" "}
                        Unggah foto layar laptop, ruang rapat, atau kegiatan
                        lapangan. AI akan menyelaraskan laporan dengan bukti
                        fotomu!
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3 sm:p-4 flex items-center gap-3.5">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-indigo-200 bg-slate-100 shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fotoBase64}
                          alt="Pratinjau Foto Kegiatan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {fotoFileName || "Foto Kegiatan Terlampir"}
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                          Multimodal Vision Aktif: Objek & software pada foto
                          akan dianalisis otomatis oleh AI.
                        </p>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Ganti / Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Textarea Catatan Harian Santai */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="input-catatan"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      4. Catatan Harian Santai
                    </label>
                    <div className="flex items-center gap-1.5">
                      <VoiceDictationButton
                        onTranscript={(text) =>
                          setCatatan((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setIsSmartIngestionOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                        title="Tarik commit GitHub atau jadwal kalender otomatis"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>GitHub / Agenda</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleFillSample}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 cursor-pointer"
                      >
                        Contoh
                      </button>
                    </div>
                  </div>
                  <textarea
                    id="input-catatan"
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder={
                      fotoBase64
                        ? "Bisa dikosongkan atau tambahkan catatan santai pelengkap (AI akan mendeteksi dari fotomu)..."
                        : "hari ini bantu rekap nota masuk ke excel sama packing barang"
                    }
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-500/15 disabled:bg-slate-100 transition resize-y leading-relaxed"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    {fotoBase64
                      ? "Jika catatan teks kosong, AI secara mandiri mendeteksi dan menginferensikan kegiatan kerja berdasarkan analisis foto dokumentasi."
                      : "Tulis saja apa adanya dengan bahasa santai. Anda juga dapat menggunakan Dikte Suara (id-ID) atau Smart Ingestion (GitHub/Kalender)."}
                  </p>
                </div>

                {/* 5. Gaya Bahasa (Tone Humanizer) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>5. Gaya Bahasa (Tone Humanizer)</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? "bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                              : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-slate-900">
                              {opt.label}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {opt.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* KONDISIONAL: MODE BORONGAN 1 PEKAN */
              <div className="space-y-4 pt-1">
                <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span>3. Rentang Tanggal Pekan Ini (Senin – Jumat)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                      Narasi Progresif 5 Tahap
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="tanggal-mulai"
                        className="block text-[11px] font-semibold text-slate-600 mb-1"
                      >
                        Tanggal Mulai (Senin)
                      </label>
                      <input
                        id="tanggal-mulai"
                        type="date"
                        value={tanggalMulai}
                        onChange={(e) => setTanggalMulai(e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tanggal-selesai"
                        className="block text-[11px] font-semibold text-slate-600 mb-1"
                      >
                        Tanggal Selesai (Jumat)
                      </label>
                      <input
                        id="tanggal-selesai"
                        type="date"
                        value={tanggalSelesai}
                        onChange={(e) => setTanggalSelesai(e.target.value)}
                        disabled={isLoading}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label
                      htmlFor="input-ringkasan-mingguan"
                      className="block text-xs sm:text-sm font-bold text-slate-800"
                    >
                      4. Ringkasan Aktivitas Pekan Ini
                    </label>
                    <div className="flex items-center gap-1.5">
                      <VoiceDictationButton
                        onTranscript={(text) =>
                          setRingkasanMingguan((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setIsSmartIngestionOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                        title="Tarik commit GitHub atau jadwal kalender otomatis"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>GitHub / Agenda</span>
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-0.5">
                      Chip contoh tugas mingguan:
                    </span>
                    {currentProgramConfig.weeklyExamples.map((ex) => (
                      <button
                        key={ex.label}
                        type="button"
                        onClick={() => handleFillWeeklySample(ex.summary)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-900 font-semibold transition cursor-pointer"
                      >
                        {ex.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    id="input-ringkasan-mingguan"
                    rows={4}
                    value={ringkasanMingguan}
                    onChange={(e) => setRingkasanMingguan(e.target.value)}
                    placeholder="Ceritakan secara santai apa saja yang kamu kerjakan selama 1 pekan ini..."
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-500/15 disabled:bg-slate-100 transition resize-y leading-relaxed"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                    AI akan otomatis membagi ringkasanmu menjadi alur progresif:{" "}
                    <strong>Hari 1</strong> (Briefing & Perencanaan) →{" "}
                    <strong>Hari 2</strong> (Persiapan Materi/Data) →{" "}
                    <strong>Hari 3</strong> (Eksekusi Utama) →{" "}
                    <strong>Hari 4</strong> (Troubleshooting & Revisi) →{" "}
                    <strong>Hari 5</strong> (Rekapitulasi & Evaluasi).
                  </p>
                </div>
              </div>
            )}

            {/* Pesan Error (jika ada) */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-rose-700 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1">
                  <p className="font-semibold">Perhatian</p>
                  <p className="mt-0.5 text-rose-600/90">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={isLoading || isQuotaExhausted}
              className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                isQuotaExhausted
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed shadow-none"
                  : mode === "weekly"
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 active:scale-[0.99] text-white shadow-indigo-500/25"
                    : fotoBase64
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.99] text-white shadow-indigo-500/25"
                      : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white shadow-indigo-500/25"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {mode === "weekly"
                      ? "Menyusun Narasi Progresif 1 Pekan..."
                      : fotoBase64
                        ? "Menganalisis Bukti Foto & Menyusun Logbook..."
                        : "Menyusun Logbook Resmi..."}
                  </span>
                </>
              ) : isQuotaExhausted ? (
                <>
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>Kuota Gratis Habis — Aktifkan Langganan di Atas</span>
                </>
              ) : mode === "weekly" ? (
                <span>🚀 Susun Logbook 1 Pekan Sekaligus</span>
              ) : fotoBase64 ? (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Analisis Foto & Generate Logbook Resmi</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Logbook Resmi</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Loading Skeleton */}
        {isLoading && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 border border-indigo-100 shadow-xs space-y-4 animate-pulse-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {fotoBase64
                    ? "Sedang Menginspeksi Bukti Foto Kegiatan..."
                    : mode === "weekly"
                      ? "Sedang Merancang Alur Progresif 1 Pekan..."
                      : "Sedang Menganalisis & Menyusun Laporan..."}
                </h3>
                <p className="text-xs text-slate-500">
                  Mengonversi data ke standar akademik Taksonomi Bloom (C3–C6)
                </p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <div className="h-3.5 w-44 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-200/70 rounded" />
                  <div className="h-3 w-5/6 bg-slate-200/70 rounded" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAMPILAN HASIL MODE BORONGAN (1 PEKAN) */}
        {mode === "weekly" && weeklyResults.length > 0 && !isLoading && (
          <section
            ref={resultRef}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 scroll-mt-16"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Batch {weeklyResults.length} Hari Kerja</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {tipeKegiatan} • {peran}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  Hasil Logbook 1 Pekan (Narasi Progresif)
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCopyAllWeeklyMarkdown}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer ${
                  copiedWeeklyAll
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {copiedWeeklyAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Rekap Seluruh Pekan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Rekap Seluruh Pekan (Markdown/Text)</span>
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
        {/* TAMPILAN HASIL MODE HARIAN (LENGKAP DENGAN BUKTI DOKUMENTASI FOTO)*/}
        {/* ================================================================= */}
        {mode === "daily" && result && !isLoading && (
          <section
            ref={resultRef}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 scroll-mt-16"
          >
            {/* Header Hasil + Tombol Salin Semua */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {tipeKegiatan}
                  </span>
                  <span className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
                    • {peran}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
                  Hasil Logbook Harian Resmi
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCopyAll}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer ${
                  copiedAll
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Semua Bagian Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
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
          <section className="bg-gradient-to-br from-white via-indigo-50/40 to-slate-50 rounded-2xl p-5 sm:p-6 border border-indigo-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-1 rounded-full mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dokumen & Export Hub</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Hub Ekspor & Integrasi Dokumen
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Unduh seluruh riwayat logbook ke dokumen resmi atau
                  integrasikan langsung ke cloud.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 self-start sm:self-auto">
                <History className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {getEntriesForExport().length} Entri Logbook Siap Diekspor
                </span>
              </div>
            </div>

            {/* Pilihan Preset Pedoman Kampus */}
            <div className="rounded-xl bg-white border border-slate-200/90 p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Preset Pedoman Kampus (.docx & .pptx)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
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
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">
                          {preset.label}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
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

            {/* Grid Tombol Unduh Dokumen (.xlsx, .docx, .pptx) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exportingType !== null}
                className="flex flex-col items-start justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-left transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-base">📊</span>
                  {exportingType === "excel" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 opacity-85" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-extrabold leading-snug">
                  Unduh Rekap Excel (.xlsx)
                </span>
                <span className="text-[11px] font-normal text-emerald-100 mt-0.5">
                  Tabel Formal 8 Kolom
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportWord}
                disabled={exportingType !== null}
                className="flex flex-col items-start justify-between p-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-left transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-base">📘</span>
                  {exportingType === "word" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 opacity-85" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-extrabold leading-snug">
                  Unduh Laporan Word (.docx)
                </span>
                <span className="text-[11px] font-normal text-blue-100 mt-0.5">
                  TNR 12pt • Cover & Foto
                </span>
              </button>

              <button
                type="button"
                onClick={handleExportPowerPoint}
                disabled={exportingType !== null}
                className="flex flex-col items-start justify-between p-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-left transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-base">📈</span>
                  {exportingType === "pptx" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Presentation className="w-4 h-4 opacity-85" />
                  )}
                </div>
                <span className="text-xs sm:text-sm font-extrabold leading-snug">
                  Unduh Slide Sidang (.pptx)
                </span>
                <span className="text-[11px] font-normal text-amber-100 mt-0.5">
                  Slide Sidang + Foto
                </span>
              </button>
            </div>

            {/* Grid Tombol Integrasi Cloud & Canva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleOpenDriveSyncModal}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer"
              >
                <span>🔗</span>
                <Cloud className="w-4 h-4 text-indigo-600" />
                <span>Sync to Google Drive / Sheets</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCanvaPoster}
                className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
              >
                <span>🎨</span>
                <Palette className="w-4 h-4" />
                <span>Buat Poster di Canva</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-85" />
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
