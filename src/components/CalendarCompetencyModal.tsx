"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  BarChart3,
  PenTool,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  RotateCcw,
  Upload,
  Check,
  Award,
  BookOpen,
  FileCheck,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { LogbookEntry, StudentProfile } from "@/src/lib/exporters/types";
import { getIndonesianHolidayInfo } from "@/src/lib/utils/indonesianHolidays";

interface CalendarCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "calendar" | "competency" | "signature";
  history: LogbookEntry[];
  studentProfile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onSelectDateToBackfill: (dateIso: string, formattedDateStr: string) => void;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const DAY_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

interface CalendarDayCell {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isToday: boolean;
  isFuture: boolean;
  holidayName: string | null;
  matchedEntry?: LogbookEntry;
  fullFormattedDate: string;
}

export function CalendarCompetencyModal({
  isOpen,
  onClose,
  initialTab = "calendar",
  history,
  studentProfile,
  onUpdateProfile,
  onSelectDateToBackfill,
}: CalendarCompetencyModalProps) {
  const [activeTab, setActiveTab] = useState<"calendar" | "competency" | "signature">(initialTab);

  // Calendar Month State
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());
  const [selectedDayCell, setSelectedDayCell] = useState<CalendarDayCell | null>(null);

  // Signature Pad State
  const [activeSigner, setActiveSigner] = useState<"mahasiswa" | "mentor">("mahasiswa");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Initialize signature canvas when switching to signature tab
  useEffect(() => {
    if (!isOpen || activeTab !== "signature") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const existingBase64 =
      activeSigner === "mahasiswa"
        ? studentProfile.ttdMahasiswaBase64
        : studentProfile.ttdMentorBase64;

    if (existingBase64) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = existingBase64;
    }
  }, [isOpen, activeTab, activeSigner, studentProfile.ttdMahasiswaBase64, studentProfile.ttdMentorBase64]);

  // Build Calendar Grid for (viewYear, viewMonth)
  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Monday-based index (0 = Mon, ..., 6 = Sun)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;

    const cells: CalendarDayCell[] = [];

    const matchEntryForDate = (year: number, monthIdx: number, dayNum: number): LogbookEntry | undefined => {
      const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const monthNameLong = (MONTH_NAMES[monthIdx] || "").toLowerCase();
      const monthNameShort = monthNameLong.slice(0, 3);
      return history.find((h) => {
        if (!h.tanggal) return false;
        const lower = h.tanggal.toLowerCase();
        return (
          lower.includes(iso) ||
          lower.includes(`${dayNum} ${monthNameLong}`) ||
          lower.includes(`${dayNum} ${monthNameShort}`)
        );
      });
    };

    // Previous month padding days
    const prevMonthLastDate = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const dNum = prevMonthLastDate - i;
      const dObj = new Date(viewYear, viewMonth - 1, dNum);
      const y = dObj.getFullYear();
      const m = dObj.getMonth();
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      const hol = getIndonesianHolidayInfo(iso);
      cells.push({
        isoDate: iso,
        dayNumber: dNum,
        isCurrentMonth: false,
        isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
        isToday: dObj.getTime() === today.getTime(),
        isFuture: dObj.getTime() > today.getTime(),
        holidayName: hol.isHoliday ? hol.name || "Libur Nasional" : null,
        matchedEntry: matchEntryForDate(y, m, dNum),
        fullFormattedDate: `${DAY_FULL[dObj.getDay()]}, ${dNum} ${MONTH_NAMES[m]} ${y}`,
      });
    }

    // Current month days
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const dObj = new Date(viewYear, viewMonth, dNum);
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      const hol = getIndonesianHolidayInfo(iso);
      cells.push({
        isoDate: iso,
        dayNumber: dNum,
        isCurrentMonth: true,
        isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
        isToday: dObj.getTime() === today.getTime(),
        isFuture: dObj.getTime() > today.getTime(),
        holidayName: hol.isHoliday ? hol.name || "Libur Nasional" : null,
        matchedEntry: matchEntryForDate(viewYear, viewMonth, dNum),
        fullFormattedDate: `${DAY_FULL[dObj.getDay()]}, ${dNum} ${MONTH_NAMES[viewMonth]} ${viewYear}`,
      });
    }

    // Next month padding to complete 35 or 42 cells
    const totalNeeded = cells.length > 35 ? 42 : 35;
    const remaining = totalNeeded - cells.length;
    for (let dNum = 1; dNum <= remaining; dNum++) {
      const dObj = new Date(viewYear, viewMonth + 1, dNum);
      const y = dObj.getFullYear();
      const m = dObj.getMonth();
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(dNum).padStart(2, "0")}`;
      const hol = getIndonesianHolidayInfo(iso);
      cells.push({
        isoDate: iso,
        dayNumber: dNum,
        isCurrentMonth: false,
        isWeekend: dObj.getDay() === 0 || dObj.getDay() === 6,
        isToday: dObj.getTime() === today.getTime(),
        isFuture: dObj.getTime() > today.getTime(),
        holidayName: hol.isHoliday ? hol.name || "Libur Nasional" : null,
        matchedEntry: matchEntryForDate(y, m, dNum),
        fullFormattedDate: `${DAY_FULL[dObj.getDay()]}, ${dNum} ${MONTH_NAMES[m]} ${y}`,
      });
    }

    const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
    const filledInMonth = currentMonthCells.filter((c) => Boolean(c.matchedEntry));
    const missingWorkdaysInMonth = currentMonthCells.filter(
      (c) => !c.isWeekend && !c.holidayName && !c.isFuture && !c.matchedEntry
    );
    const qrVerifiedInMonth = filledInMonth.filter((c) =>
      (c.matchedEntry?.catatanAsli || "").includes("QR") ||
      (c.matchedEntry?.tahapFase || "").includes("Terverifikasi QR")
    );

    return {
      cells,
      filledInMonth,
      missingWorkdaysInMonth,
      qrVerifiedInMonth,
    };
  }, [viewYear, viewMonth, history]);

  // Competency & Bloom Taxonomy Analytics
  const competencyAnalytics = useMemo(() => {
    const domains = [
      {
        id: "technical",
        label: "Rekayasa Teknis & Implementasi Sistem",
        desc: "Pengembangan teknis, arsitektur, analisis data, dan eksekusi alat kerja profesional",
        keywords: [
          "sistem", "data", "kode", "api", "aplikasi", "teknis", "analisis", "desain",
          "implementasi", "pengujian", "fitur", "modul", "database", "konfigurasi", "arsitektur"
        ],
        count: 0,
      },
      {
        id: "problem_solving",
        label: "Pemecahan Masalah & Mitigasi Risiko (C4–C6)",
        desc: "Identifikasi akar masalah, debugging, optimasi proses, dan evaluasi solusi alternatif",
        keywords: [
          "solusi", "masalah", "kendala", "optimasi", "evaluasi", "perbaikan", "mitigasi",
          "efisiensi", "validasi", "investigasi", "troubleshooting", "strategi"
        ],
        count: 0,
      },
      {
        id: "communication",
        label: "Komunikasi Profesional & Kolaborasi Lintas Tim",
        desc: "Koordinasi pemangku kepentingan, presentasi, diskusi mentor, dan dokumentasi",
        keywords: [
          "koordinasi", "diskusi", "mentor", "tim", "presentasi", "rapat", "komunikasi",
          "kolaborasi", "dokumentasi", "laporan", "stakeholder", "bimbingan", "sinkronisasi"
        ],
        count: 0,
      },
      {
        id: "management",
        label: "Manajemen Proyek & Kepemimpinan Eksekusi",
        desc: "Perencanaan jadwal, manajemen prioritas, kemandirian kerja, dan target milestone",
        keywords: [
          "jadwal", "target", "prioritas", "manajemen", "perencanaan", "proyek", "inisiatif",
          "monitoring", "timeline", "tanggung jawab", "kepemimpinan", "agenda"
        ],
        count: 0,
      },
      {
        id: "community",
        label: "Pemberdayaan Sosial & Dampak Lapangan (KKN/Mitra)",
        desc: "Edukasi masyarakat, sosialisasi program kerja, observasi lapangan, dan pengabdian",
        keywords: [
          "masyarakat", "desa", "sosialisasi", "edukasi", "warga", "lapangan", "pelatihan",
          "observasi", "pendampingan", "program kerja", "kkn", "umkm"
        ],
        count: 0,
      },
    ];

    const bloomCounts = {
      c3: 0, // Pelaksanaan & Penerapan
      c4: 0, // Analisis & Pemetaan
      c5: 0, // Evaluasi & Validasi
      c6: 0, // Perancangan & Sintesis
    };

    history.forEach((entry) => {
      const fullText = [
        entry.deskripsiKegiatan,
        entry.kompetensiDikembangkan,
        entry.kendalaDihadapi,
        entry.solusiTindakan,
        entry.refleksiPembelajaran,
      ]
        .join(" ")
        .toLowerCase();

      domains.forEach((dom) => {
        const hit = dom.keywords.some((kw) => fullText.includes(kw));
        if (hit) dom.count += 1;
      });

      if (/melaksanakan|menerapkan|mengoperasikan|menggunakan|menjalankan|menyusun/.test(fullText)) {
        bloomCounts.c3 += 1;
      }
      if (/menganalisis|mengidentifikasi|memetakan|menelaah|mengurai|mendeteksi/.test(fullText)) {
        bloomCounts.c4 += 1;
      }
      if (/mengevaluasi|memvalidasi|menguji|menilai|memverifikasi|mengukur/.test(fullText)) {
        bloomCounts.c5 += 1;
      }
      if (/merancang|membangun|mengembangkan|mengintegrasikan|merumuskan|menciptakan/.test(fullText)) {
        bloomCounts.c6 += 1;
      }
    });

    const totalEntries = Math.max(1, history.length);
    const domainScores = domains.map((d) => ({
      ...d,
      percentage: history.length === 0 ? 0 : Math.min(100, Math.round((d.count / totalEntries) * 100)),
    }));

    // Find lowest domain for recommendation
    const sortedByWeakest = [...domainScores].sort((a, b) => a.percentage - b.percentage);
    const weakestDomain = sortedByWeakest[0];

    return {
      domainScores,
      bloomCounts,
      weakestDomain,
      totalEntries: history.length,
    };
  }, [history]);

  if (!isOpen) return null;

  // Month Navigation
  const handlePrevMonth = () => {
    setSelectedDayCell(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDayCell(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Signature Canvas Handlers
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = activeSigner === "mentor" ? "#1e3a8a" : "#09090b";
    setIsDrawing(true);
  };

  const drawMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generateAutoParafStamp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const fullName =
      activeSigner === "mahasiswa"
        ? studentProfile.namaMahasiswa || "Mahasiswa MBKM"
        : studentProfile.namaPembimbing || "Mentor Pembimbing";

    // Draw clean typographic signature & verification stamp
    ctx.save();
    ctx.strokeStyle = activeSigner === "mentor" ? "#1d4ed8" : "#18181b";
    ctx.fillStyle = activeSigner === "mentor" ? "#1d4ed8" : "#18181b";

    // Outer verification frame for mentor or flourish curve for student
    if (activeSigner === "mentor") {
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 22, 310, 96);
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("TERVERIFIKASI DIGITAL • PEMBIMBING MITRA", 200, 42);
    }

    ctx.font = "italic bold 26px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(fullName.replace(/\[|\]/g, "").slice(0, 22), 200, 78);

    // Signature underline stroke
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(90, 92);
    ctx.quadraticCurveTo(200, 106, 310, 88);
    ctx.stroke();

    ctx.font = "10px monospace";
    ctx.fillText(
      `E-PARAF ID: #${Math.abs(fullName.length * 1937).toString(16).toUpperCase()}`,
      200,
      110
    );
    ctx.restore();
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    const updatedProfile: StudentProfile = {
      ...studentProfile,
      ...(activeSigner === "mahasiswa"
        ? { ttdMahasiswaBase64: dataUrl }
        : { ttdMentorBase64: dataUrl }),
    };
    onUpdateProfile(updatedProfile);
    toast.success(
      activeSigner === "mahasiswa"
        ? "Tanda tangan digital Mahasiswa berhasil disimpan ke dokumen!"
        : "E-Paraf / Tanda tangan Mentor berhasil disimpan ke dokumen!"
    );
  };

  const handleRemoveSignature = () => {
    clearCanvas();
    const updatedProfile: StudentProfile = {
      ...studentProfile,
      ...(activeSigner === "mahasiswa"
        ? { ttdMahasiswaBase64: undefined }
        : { ttdMentorBase64: undefined }),
    };
    onUpdateProfile(updatedProfile);
    toast.info("Tanda tangan digital telah dihapus.");
  };

  const handleUploadSignatureImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const resultDataUrl = ev.target?.result as string;
      if (!resultDataUrl) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = resultDataUrl;
      }
      const updatedProfile: StudentProfile = {
        ...studentProfile,
        ...(activeSigner === "mahasiswa"
          ? { ttdMahasiswaBase64: resultDataUrl }
          : { ttdMentorBase64: resultDataUrl }),
      };
      onUpdateProfile(updatedProfile);
      toast.success("Gambar tanda tangan berhasil diunggah dan disimpan!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const activeDayCell =
    selectedDayCell ||
    calendarData.cells.find((c) => c.isToday) ||
    calendarData.missingWorkdaysInMonth[0] ||
    calendarData.cells.find((c) => c.isCurrentMonth) ||
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/75 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Kalender Kehadiran, Analitik Kompetensi & E-Paraf"
    >
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col gap-3 bg-zinc-50/70 dark:bg-zinc-900/80 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pusat Kendali Kehadiran, Peta Kompetensi &amp; E-Paraf Resmi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Deteksi hari kerja terlewat (bolong), pantau distribusi kompetensi laporan akhir, dan kelola tanda tangan digital.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer shrink-0"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-800 text-xs w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("calendar")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Kalender &amp; Hari Bolong</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("competency")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === "competency"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Peta Kompetensi</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("signature")}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                activeTab === "signature"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>E-Paraf Digital</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: INTERACTIVE CALENDAR HEATMAP & MISSING WORKDAYS DETECTOR */}
          {activeTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 7 Cols: Monthly Calendar Grid */}
              <div className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {calendarData.filledInMonth.length} hari terisi ·{" "}
                      {calendarData.missingWorkdaysInMonth.length} hari kerja belum diisi
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      title="Bulan Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        setViewYear(now.getFullYear());
                        setViewMonth(now.getMonth());
                      }}
                      className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Bulan Ini
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      title="Bulan Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center mb-1.5">
                  {DAY_HEADERS.map((d, i) => (
                    <div
                      key={d}
                      className={`text-[11px] font-semibold py-1 ${
                        i >= 5 ? "text-rose-500 dark:text-rose-400" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarData.cells.map((cell) => {
                    const isFilled = Boolean(cell.matchedEntry);
                    const isMissingWorkday =
                      cell.isCurrentMonth &&
                      !cell.isWeekend &&
                      !cell.holidayName &&
                      !cell.isFuture &&
                      !isFilled;

                    const isSelected = activeDayCell?.isoDate === cell.isoDate;

                    let cellStyle =
                      "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 border-zinc-200/60 dark:border-zinc-800";
                    if (!cell.isCurrentMonth) {
                      cellStyle =
                        "opacity-35 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200/40 dark:border-zinc-800";
                    } else if (isFilled) {
                      cellStyle =
                        "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-semibold";
                    } else if (cell.holidayName) {
                      cellStyle =
                        "bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60";
                    } else if (isMissingWorkday) {
                      cellStyle =
                        "bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800/70 hover:bg-amber-100/80";
                    } else if (cell.isWeekend) {
                      cellStyle =
                        "bg-zinc-100/70 dark:bg-zinc-800/30 text-zinc-400 dark:text-zinc-500 border-zinc-200/60 dark:border-zinc-800";
                    }

                    return (
                      <button
                        key={cell.isoDate}
                        type="button"
                        onClick={() => setSelectedDayCell(cell)}
                        className={`h-12 sm:h-14 rounded-lg border p-1.5 flex flex-col justify-between items-start transition cursor-pointer text-left relative ${cellStyle} ${
                          isSelected ? "ring-2 ring-zinc-900 dark:ring-zinc-100" : ""
                        }`}
                      >
                        <span className="text-xs font-mono tabular-nums leading-none">
                          {cell.dayNumber}
                        </span>
                        <div className="w-full flex items-center justify-between">
                          {isFilled ? (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 truncate">
                              Terisi
                            </span>
                          ) : cell.holidayName ? (
                            <span className="text-[9px] text-rose-600 dark:text-rose-400 truncate">
                              Libur
                            </span>
                          ) : isMissingWorkday ? (
                            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 truncate">
                              Kosong
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-400 truncate">
                              {cell.isWeekend ? "Akhir Pekan" : ""}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                    Logbook Terisi
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-400 inline-block" />
                    Hari Kerja Bolong (Perlu Ditambal)
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-400 inline-block" />
                    Libur Nasional / Akhir Pekan
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Selected Day Inspector & Missing Workdays Quick Backfill List */}
              <div className="lg:col-span-5 space-y-4">
                {/* Selected Date Card */}
                {activeDayCell ? (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/60 dark:bg-zinc-900/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {activeDayCell.fullFormattedDate}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          ISO: {activeDayCell.isoDate}
                        </p>
                      </div>
                      {activeDayCell.matchedEntry ? (
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          Sudah Terisi (+8 Jam)
                        </span>
                      ) : activeDayCell.holidayName ? (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {activeDayCell.holidayName}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          Belum Ada Logbook
                        </span>
                      )}
                    </div>

                    {activeDayCell.matchedEntry ? (
                      <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 border-t border-zinc-200/80 dark:border-zinc-800 pt-2.5">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Peran: {activeDayCell.matchedEntry.peran}
                        </p>
                        <p className="line-clamp-3 leading-relaxed">
                          {activeDayCell.matchedEntry.deskripsiKegiatan}
                        </p>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDateToBackfill(
                              activeDayCell.isoDate,
                              activeDayCell.fullFormattedDate
                            );
                            onClose();
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Isi / Tambal Logbook Tanggal Ini</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Missing Workdays List */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Deteksi Hari Kerja Bolong ({calendarData.missingWorkdaysInMonth.length} Hari)
                      </span>
                    </h4>
                  </div>

                  {calendarData.missingWorkdaysInMonth.length === 0 ? (
                    <div className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Tidak Ada Hari Kerja yang Terlewat!
                      </p>
                      <p>Seluruh hari kerja efektif pada bulan ini telah memiliki logbook.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {calendarData.missingWorkdaysInMonth.map((missing) => (
                        <div
                          key={missing.isoDate}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
                        >
                          <div>
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {missing.fullFormattedDate}
                            </p>
                            <p className="text-[11px] text-zinc-500 font-mono">
                              Hari kerja efektif • Belum ada entri
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectDateToBackfill(missing.isoDate, missing.fullFormattedDate);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-[11px] font-semibold shrink-0 transition cursor-pointer"
                          >
                            Tambal
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPETENCY & BLOOM ANALYTICS */}
          {activeTab === "competency" && (
            <div className="space-y-5">
              {/* Top Metric Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">Total Entri Dianalisis</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {competencyAnalytics.totalEntries} Entri
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">C3–C4 (Eksekusi &amp; Analisis)</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {competencyAnalytics.bloomCounts.c3 + competencyAnalytics.bloomCounts.c4} Kali
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">C5–C6 (Evaluasi &amp; Sintesis)</p>
                  <p className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1">
                    {competencyAnalytics.bloomCounts.c5 + competencyAnalytics.bloomCounts.c6} Kali
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40">
                  <p className="text-xs text-zinc-500">Status E-Paraf Dokumen</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                    {studentProfile.ttdMahasiswaBase64 && studentProfile.ttdMentorBase64
                      ? "Lengkap (2/2 Aktif)"
                      : studentProfile.ttdMahasiswaBase64 || studentProfile.ttdMentorBase64
                      ? "Sebagian (1/2 Aktif)"
                      : "Belum Diatur"}
                  </p>
                </div>
              </div>

              {/* Competency Distribution Bars */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 bg-white dark:bg-zinc-900/50 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Matriks Distribusi Kompetensi Capaian Pembelajaran (OBE &amp; Kampus Merdeka)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Diekstraksi secara otomatis dari deskripsi kegiatan, kompetensi, kendala, dan solusi pada riwayat logbook Anda.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {competencyAnalytics.domainScores.map((dom) => (
                    <div key={dom.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {dom.label}
                        </span>
                        <span className="font-mono tabular-nums text-zinc-600 dark:text-zinc-400">
                          {dom.count} entri ({dom.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(4, dom.percentage)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {dom.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {competencyAnalytics.weakestDomain && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        Rekomendasi Peningkatan Laporan Akhir:{" "}
                      </span>
                      Perbanyak narasi pada aspek{" "}
                      <strong className="text-zinc-900 dark:text-zinc-100">
                        {competencyAnalytics.weakestDomain.label}
                      </strong>{" "}
                      agar matriks konversi 20 SKS Anda lebih seimbang.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DIGITAL SIGNATURE & MENTOR E-PARAF PAD */}
          {activeTab === "signature" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 7 Cols: Interactive Canvas Pad */}
              <div className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveSigner("mahasiswa")}
                      className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                        activeSigner === "mahasiswa"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      Tanda Tangan Mahasiswa
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSigner("mentor")}
                      className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                        activeSigner === "mentor"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      E-Paraf / TTD Mentor &amp; DPL
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={generateAutoParafStamp}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Buat Paraf Otomatis
                    </button>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                      title="Bersihkan Kanvas"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Drawing Canvas */}
                <div className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={drawMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawMove}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair touch-none"
                  />
                  <div className="px-3 py-1.5 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>
                      Goreskan tanda tangan di atas menggunakan mouse/layar sentuh untuk:{" "}
                      <strong className="text-zinc-800">
                        {activeSigner === "mahasiswa"
                          ? studentProfile.namaMahasiswa
                          : studentProfile.namaPembimbing}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileUploadRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUploadSignatureImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileUploadRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload PNG TTD</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      Hapus TTD
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSignature}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan ke Dokumen Logbook</span>
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Preview of Saved Signatures */}
              <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/60 dark:bg-zinc-900/50 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Pratinjau Lembar Pengesahan Aktif
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Tanda tangan di bawah ini otomatis muncul pada Live Preview A4 (Word &amp; PDF) ketika Anda mengekspor logbook.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center bg-white text-zinc-900 p-3.5 rounded-lg border border-zinc-200 text-xs">
                  <div className="space-y-2 border-r border-zinc-100 pr-2">
                    <p className="text-[10px] text-zinc-500">Pembimbing / Mentor</p>
                    <div className="h-16 flex items-center justify-center">
                      {studentProfile.ttdMentorBase64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={studentProfile.ttdMentorBase64}
                          alt="TTD Mentor"
                          className="max-h-14 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Belum ada E-Paraf</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold underline truncate">
                      {studentProfile.namaPembimbing || "Nama Mentor"}
                    </p>
                  </div>

                  <div className="space-y-2 pl-2">
                    <p className="text-[10px] text-zinc-500">Mahasiswa Peserta</p>
                    <div className="h-16 flex items-center justify-center">
                      {studentProfile.ttdMahasiswaBase64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={studentProfile.ttdMahasiswaBase64}
                          alt="TTD Mahasiswa"
                          className="max-h-14 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Belum ada TTD</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold underline truncate">
                      {studentProfile.namaMahasiswa || "Nama Mahasiswa"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
