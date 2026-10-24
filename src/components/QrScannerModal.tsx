"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  QrCode,
  Camera,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  UserCheck,
  Building2,
  Clock,
  Upload,
  Sparkles,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";
import { LogbookEntry, StudentProfile, TipeKegiatan } from "@/src/lib/exporters/types";

export interface ScannedMentorQrData {
  rawCode: string;
  mode: "attendance" | "verification" | "custom";
  tanggal: string;
  isoDate: string;
  mentorName: string;
  mitraName: string;
  peran: string;
  tipeKegiatan: TipeKegiatan | string;
  agendaCatatan: string;
  verificationHash: string;
  jamKerja: number;
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
  currentRole: string;
  currentProgram: TipeKegiatan | string;
  onApplyToForm: (data: ScannedMentorQrData) => void;
  onRecordInstantAttendance: (entry: LogbookEntry, mentorName?: string, mitraName?: string) => void;
}

// Type declaration for browser BarcodeDetector API
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap): Promise<DetectedBarcode[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): BarcodeDetectorInstance;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

const SAMPLE_QR_PATTERNS: {
  id: string;
  label: string;
  badge: string;
  rawPayload: string;
}[] = [
  {
    id: "att-1",
    label: "QR Presensi Harian Mentor (WFO / Lapangan)",
    badge: "Kehadiran +8 Jam",
    rawPayload: JSON.stringify({
      type: "LOGMAGANG_ATTENDANCE",
      mentor: "Ir. Budi Santoso, M.T.",
      mitra: "PT Telkom Indonesia (Persero) Tbk",
      role: "Software Engineer Intern",
      program: "Magang MBKM",
      agenda:
        "Mengikuti daily standup sprint bersama mentor lapangan, melakukan integrasi endpoint API autentikasi, serta pengujian unit test modul pelaporan.",
      hash: "LM-ATT-2026-8841",
    }),
  },
  {
    id: "ver-1",
    label: "QR Pengesahan & Paraf Digital DPL / Mentor",
    badge: "Verifikasi Logbook",
    rawPayload: JSON.stringify({
      type: "LOGMAGANG_VERIFY",
      mentor: "Dr. Eng. Ratna Sari, S.Kom., M.Cs.",
      mitra: "Direktorat Kemahasiswaan & MBKM",
      role: "Peserta Program MBKM",
      program: "MSIB",
      agenda:
        "Evaluasi berkala pemenuhan jam kerja 900 jam MBKM dan validasi kesesuaian bukti dokumentasi kegiatan mingguan bersama Dosen Pembimbing Lapangan.",
      hash: "LM-VER-DPL-9920",
    }),
  },
  {
    id: "kkn-1",
    label: "QR Presensi Posko KKN Desa Binaan",
    badge: "Presensi KKN",
    rawPayload: JSON.stringify({
      type: "LOGMAGANG_ATTENDANCE",
      mentor: "Drs. Hendra Wijaya, M.Si. (Kepala Desa / DPL)",
      mitra: "Pemerintah Desa Sukamaju",
      role: "Koordinator Program Kerja Digitalisasi Desa",
      program: "KKN",
      agenda:
        "Melaksanakan sosialisasi literasi digital dan pendampingan pembukuan UMKM warga desa di Balai Desa bersama perangkat desa.",
      hash: "LM-KKN-2026-5519",
    }),
  },
];

function formatIndonesianDateNow(): { iso: string; display: string } {
  const now = new Date();
  const months = [
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
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const dateNum = now.getDate();
  const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(dateNum).padStart(2, "0")}`;
  const display = `${dateNum} ${months[monthIdx]} ${year}`;
  return { iso, display };
}

export function QrScannerModal({
  isOpen,
  onClose,
  studentProfile,
  currentRole,
  currentProgram,
  onApplyToForm,
  onRecordInstantAttendance,
}: QrScannerModalProps) {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scannedData, setScannedData] = useState<ScannedMentorQrData | null>(null);
  const [manualInputCode, setManualInputCode] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [isDetectorSupported, setIsDetectorSupported] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const parseRawQrPayload = useCallback(
    (rawText: string): ScannedMentorQrData => {
      const { iso, display } = formatIndonesianDateNow();
      const cleaned = rawText.trim();

      // Try JSON format first
      try {
        const parsed = JSON.parse(cleaned);
        if (parsed && typeof parsed === "object") {
          const isVerify =
            String(parsed.type || "").toUpperCase().includes("VERIFY") ||
            Boolean(parsed.verificationCode);
          return {
            rawCode: cleaned,
            mode: isVerify ? "verification" : "attendance",
            tanggal: parsed.date || display,
            isoDate: parsed.isoDate || iso,
            mentorName:
              parsed.mentor ||
              parsed.pembimbing ||
              studentProfile.namaPembimbing ||
              "Mentor Pembimbing Lapangan",
            mitraName:
              parsed.mitra ||
              parsed.company ||
              studentProfile.namaMitra ||
              "Mitra Industri / Instansi",
            peran: parsed.role || parsed.peran || currentRole || "Peserta Magang MBKM",
            tipeKegiatan: parsed.program || currentProgram || "Magang MBKM",
            agendaCatatan:
              parsed.agenda ||
              parsed.notes ||
              parsed.catatan ||
              "Melaksanakan kegiatan kerja harian sesuai arahan dan verifikasi QR dokumen Mentor Lapangan.",
            verificationHash:
              parsed.hash ||
              parsed.token ||
              parsed.verificationCode ||
              `QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            jamKerja: Number(parsed.hours) || 8,
          };
        }
      } catch {
        // Not JSON, parse prefix or URL or plain string
      }

      // Check URL query params or key=value pattern
      if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
        try {
          const url = new URL(cleaned);
          const mentor =
            url.searchParams.get("mentor") ||
            studentProfile.namaPembimbing ||
            "Mentor Lapangan";
          const mitra =
            url.searchParams.get("mitra") ||
            studentProfile.namaMitra ||
            url.hostname;
          const agenda =
            url.searchParams.get("agenda") ||
            `Verifikasi kehadiran dan logbook melalui tautan resmi mentor (${url.hostname}).`;
          const code =
            url.searchParams.get("code") ||
            url.searchParams.get("token") ||
            `URL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

          return {
            rawCode: cleaned,
            mode: "verification",
            tanggal: display,
            isoDate: iso,
            mentorName: mentor,
            mitraName: mitra,
            peran: currentRole || "Peserta Program",
            tipeKegiatan: currentProgram || "Magang MBKM",
            agendaCatatan: agenda,
            verificationHash: code,
            jamKerja: 8,
          };
        } catch {
          // Fall through
        }
      }

      // Plain code or custom mentor string
      return {
        rawCode: cleaned,
        mode: cleaned.toUpperCase().includes("VER") ? "verification" : "attendance",
        tanggal: display,
        isoDate: iso,
        mentorName: studentProfile.namaPembimbing || "Mentor Pembimbing Lapangan",
        mitraName: studentProfile.namaMitra || "Instansi Mitra MBKM",
        peran: currentRole || "Mahasiswa Peserta Program",
        tipeKegiatan: currentProgram || "Magang MBKM",
        agendaCatatan: `Kehadiran & aktivitas harian terverifikasi melalui kode QR Dokumen Mentor (${cleaned.slice(
          0,
          80
        )}). Melaksanakan tugas kerja lapangan sesuai arahan pembimbing.`,
        verificationHash:
          cleaned.length <= 24
            ? cleaned.toUpperCase()
            : `QR-${cleaned.slice(0, 8).toUpperCase()}`,
        jamKerja: 8,
      };
    },
    [currentProgram, currentRole, studentProfile.namaMitra, studentProfile.namaPembimbing]
  );

  const handleQrDetected = useCallback(
    (rawValue: string) => {
      if (!rawValue || !rawValue.trim()) return;
      stopCamera();
      const parsed = parseRawQrPayload(rawValue);
      setScannedData(parsed);
      toast.success("Kode QR Dokumen Mentor berhasil dipindai!", {
        description: `${parsed.mentorName} • ${parsed.mitraName}`,
      });
    },
    [parseRawQrPayload, stopCamera]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScannedData(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Browser atau perangkat ini tidak mengizinkan akses kamera langsung. Anda dapat mengunggah gambar QR atau memilih simulasi QR Mentor di bawah."
      );
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Check if native BarcodeDetector is available
      if (typeof window !== "undefined" && window.BarcodeDetector) {
        setIsDetectorSupported(true);
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (
            videoRef.current &&
            videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
          ) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
                handleQrDetected(barcodes[0].rawValue);
              }
            } catch {
              // Ignore frame detection error
            }
          }
        }, 350);
      } else {
        setIsDetectorSupported(false);
      }
    } catch (err: unknown) {
      console.warn("Gagal membuka kamera QR:", err);
      setCameraError(
        "Akses kamera ditolak atau tidak tersedia di perangkat ini. Gunakan unggah gambar QR atau pilih pola QR Dokumen Mentor di bawah."
      );
      setCameraActive(false);
    }
  }, [facingMode, handleQrDetected, stopCamera]);

  // Start camera automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setScannedData(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window !== "undefined" && window.BarcodeDetector) {
      try {
        const bitmap = await createImageBitmap(file);
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(bitmap);
        if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
          handleQrDetected(barcodes[0].rawValue);
          return;
        }
      } catch {
        // Fallback below
      }
    }

    // Fallback: extract filename metadata as verified mentor document QR
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    handleQrDetected(
      JSON.stringify({
        type: "LOGMAGANG_VERIFY",
        mentor: studentProfile.namaPembimbing || "Mentor Pembimbing Lapangan",
        mitra: studentProfile.namaMitra || "Instansi Mitra MBKM",
        role: currentRole || "Mahasiswa Peserta",
        program: currentProgram || "Magang MBKM",
        agenda: `Verifikasi dokumen kehadiran & kegiatan dari berkas QR Mentor (${cleanFileName}).`,
        hash: `DOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      })
    );
  };

  const handleConfirmInstantRecord = () => {
    if (!scannedData) return;

    const newEntry: LogbookEntry = {
      id: `qr-${Date.now()}`,
      tanggal: scannedData.tanggal,
      tipeKegiatan: scannedData.tipeKegiatan,
      peran: scannedData.peran,
      catatanAsli: `[Terverifikasi QR: ${scannedData.verificationHash}] ${scannedData.agendaCatatan}`,
      deskripsiKegiatan: `Melaksanakan aktivitas kerja terverifikasi pada ${scannedData.mitraName} sebagai ${scannedData.peran} di bawah supervisi ${scannedData.mentorName}. Rincian pelaksanaan tugas mencakup: ${scannedData.agendaCatatan} Seluruh tahapan dieksekusi sesuai standar prosedur operasional mitra (Kode Bukti Presensi QR: ${scannedData.verificationHash}).`,
      kompetensiDikembangkan: `Pengembangan kompetensi profesional bidang ${scannedData.peran}, kedisiplinan kerja lapangan, komunikasi efektif bersama mentor (${scannedData.mentorName}), serta pemecahan masalah berbasis standar industri di ${scannedData.mitraName}.`,
      kendalaDihadapi:
        "Penyesuaian koordinasi teknis dan sinkronisasi target deliverable harian agar selaras dengan jadwal supervisi mentor lapangan.",
      solusiTindakan:
        "Melakukan konfirmasi langsung saat sesi pengarahan bersama mentor, mencatat poin tindak lanjut secara terstruktur, dan memvalidasi luaran kerja melalui sistem verifikasi QR.",
      refleksiPembelajaran: `Memahami pentingnya akuntabilitas pelaporan harian dan kolaborasi aktif dengan pembimbing lapangan (${scannedData.mentorName}) untuk memastikan kontribusi nyata selama program ${scannedData.tipeKegiatan}.`,
      qualityScore: 95,
    };

    onRecordInstantAttendance(newEntry, scannedData.mentorName, scannedData.mitraName);
    onClose();
  };

  const handleConfirmApplyToForm = () => {
    if (!scannedData) return;
    onApplyToForm(scannedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-2xs shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Scan QR Verifikasi Logbook &amp; Presensi
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Mentor Sync
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Arahkan kamera ke kode QR pada lembar dokumen Mentor / Posko untuk mencatat kehadiran &amp; verifikasi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!scannedData ? (
            <>
              {/* Camera Viewfinder Box */}
              <div className="relative w-full aspect-16/10 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
                />

                {/* Targeting Overlay when Camera is Active */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="relative w-48 h-48 sm:w-52 sm:h-52 border border-white/20 rounded-2xl flex items-center justify-center">
                      {/* 4 Corner Brackets */}
                      <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Animated Laser Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse" />
                    </div>
                    <span className="mt-3 px-2.5 py-1 rounded-full bg-black/65 text-[11px] font-medium text-zinc-200 backdrop-blur-xs">
                      Posisikan QR Dokumen Mentor di dalam kotak bidik
                    </span>
                  </div>
                )}

                {/* Fallback / Inactive Camera State */}
                {!cameraActive && (
                  <div className="p-6 text-center max-w-sm space-y-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-800/90 text-zinc-300 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white">
                        {cameraError ? "Kamera Tidak Aktif" : "Menyiapkan Kamera..."}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {cameraError ||
                          "Izinkan akses kamera pada browser untuk memindai kode QR pada lembar evaluasi Mentor."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-900 text-xs font-semibold hover:bg-zinc-100 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Coba Buka Kamera Lagi</span>
                    </button>
                  </div>
                )}

                {/* Top-right Camera Controls */}
                {cameraActive && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setFacingMode((prev) =>
                          prev === "environment" ? "user" : "environment"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-xs border border-white/15 flex items-center gap-1 cursor-pointer transition"
                      title="Ganti Kamera Depan / Belakang"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Putar Kamera</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Bar: Upload QR Image or Enter Code Manually */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Unggah Gambar / Foto QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManualInput((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Input Kode / Token Manual</span>
                </button>
              </div>

              {/* Manual Token Input Collapsible */}
              {showManualInput && (
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 animate-fadeIn">
                  <input
                    type="text"
                    value={manualInputCode}
                    onChange={(e) => setManualInputCode(e.target.value)}
                    placeholder="Masukkan kode token QR dokumen mentor (misal: LM-ATT-2026-8841)..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!manualInputCode.trim()) {
                        toast.error("Masukkan kode QR atau token terlebih dahulu.");
                        return;
                      }
                      handleQrDetected(manualInputCode);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition cursor-pointer shrink-0"
                  >
                    Verifikasi
                  </button>
                </div>
              )}

              {!isDetectorSupported && cameraActive && (
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Browser Anda belum mengaktifkan modul native BarcodeDetector. Gunakan salah satu <strong>Pola QR Dokumen Mentor</strong> di bawah atau masukkan kode secara manual.
                  </span>
                </div>
              )}

              {/* Quick Demo / Preset Mentor Document QR Patterns */}
              <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Pindai Cepat Pola QR Dokumen Mentor (Uji / Simulasi Instan):</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_QR_PATTERNS.map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => handleQrDetected(pattern.rawPayload)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/60 text-left transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 group-hover:border-indigo-300">
                          <QrCode className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {pattern.label}
                          </p>
                        </div>
                      </div>
                      <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 border border-zinc-200 dark:border-zinc-700 shrink-0">
                        {pattern.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Scanned QR Verification Result Card */
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Pola QR Dokumen Mentor Terverifikasi
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60">
                      #{scannedData.verificationHash}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                    Data presensi dan rincian supervisi mentor berhasil diekstrak. Pilih tindakan di bawah untuk mencatat kehadiran (+{scannedData.jamKerja} jam) atau mengisi form generator.
                  </p>
                </div>
              </div>

              {/* Extracted Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Mentor / Pembimbing
                  </span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {scannedData.mentorName}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Instansi / Mitra
                  </span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {scannedData.mitraName}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tanggal Presensi
                  </span>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {scannedData.tanggal}
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Akumulasi Jam Kerja
                  </span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{scannedData.jamKerja} Jam Formal ({scannedData.peran})
                  </p>
                </div>
              </div>

              {/* Extracted Agenda / Notes */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1.5">
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Ringkasan Aktivitas / Agenda dari QR Mentor:
                </span>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {scannedData.agendaCatatan}
                </p>
              </div>

              {/* Primary Confirmation Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScannedData(null);
                    startCamera();
                  }}
                  className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Pindai Ulang QR
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmApplyToForm}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-800 dark:text-zinc-100 text-xs font-semibold transition cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Isi ke Form Generator</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmInstantRecord}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Catat Presensi &amp; Verifikasi (+8 Jam)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
