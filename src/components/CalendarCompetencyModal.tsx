"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  BarChart3,
  PenTool,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { LogbookEntry, StudentProfile } from "@/src/lib/exporters/types";

import {
  buildCalendarData,
  computeCompetencyAnalytics,
  type CalendarDayCell,
} from "@/src/lib/utils/calendarData";
import { CalendarTabSection } from "./CalendarTabSection";
import { CompetencyTabSection } from "./CompetencyTabSection";
import { SignatureTabSection } from "./SignatureTabSection";

interface CalendarCompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "calendar" | "competency" | "signature";
  history: LogbookEntry[];
  studentProfile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onSelectDateToBackfill: (dateIso: string, formattedDateStr: string) => void;
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

  // Grid kalender & analitik kompetensi (logika di src/lib/utils/calendarData.ts)
  const calendarData = useMemo(
    () => buildCalendarData(viewYear, viewMonth, history),
    [viewYear, viewMonth, history]
  );

  const competencyAnalytics = useMemo(
    () => computeCompetencyAnalytics(history),
    [history]
  );

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
          {activeTab === "calendar" && <CalendarTabSection activeDayCell={activeDayCell} calendarData={calendarData} handleNextMonth={handleNextMonth} handlePrevMonth={handlePrevMonth} onClose={onClose} onSelectDateToBackfill={onSelectDateToBackfill} setSelectedDayCell={setSelectedDayCell} setViewMonth={setViewMonth} setViewYear={setViewYear} viewMonth={viewMonth} viewYear={viewYear} />}

          {/* TAB 2: COMPETENCY & BLOOM ANALYTICS */}
          {activeTab === "competency" && <CompetencyTabSection competencyAnalytics={competencyAnalytics} studentProfile={studentProfile} />}

          {/* TAB 3: DIGITAL SIGNATURE & MENTOR E-PARAF PAD */}
          {activeTab === "signature" && <SignatureTabSection activeSigner={activeSigner} canvasRef={canvasRef} clearCanvas={clearCanvas} drawMove={drawMove} fileUploadRef={fileUploadRef} generateAutoParafStamp={generateAutoParafStamp} handleRemoveSignature={handleRemoveSignature} handleSaveSignature={handleSaveSignature} handleUploadSignatureImage={handleUploadSignatureImage} setActiveSigner={setActiveSigner} startDrawing={startDrawing} stopDrawing={stopDrawing} studentProfile={studentProfile} />}
        </div>
      </div>
    </div>
  );
}
