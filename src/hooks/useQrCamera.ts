import { useCallback, useEffect, useRef, useState } from "react";
import type { MentorQrContext } from "@/src/lib/utils/qrMentorCode";

// Type declaration for browser BarcodeDetector API
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorInstance {
  detect(
    source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap
  ): Promise<DetectedBarcode[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats: string[] }): BarcodeDetectorInstance;
      getSupportedFormats?: () => Promise<string[]>;
    };
  }
}

export interface UseQrCameraOptions {
  /** Dipanggil dengan nilai mentah QR yang berhasil dideteksi. */
  onDetected: (rawValue: string) => void;
  /** Dipanggil di awal startCamera, sebelum kamera dibuka (mis. reset hasil scan). */
  onCameraStart?: () => void;
  /** Konteks fallback untuk unggah gambar yang tidak terbaca BarcodeDetector. */
  fallbackContext?: MentorQrContext;
}

/**
 * Logika kamera pemindai QR: getUserMedia + BarcodeDetector, interval scan,
 * unggah gambar QR, dan cleanup stream. Sebelumnya inline di QrScannerModal —
 * dipindah verbatim; satu-satunya perubahan: callback onDetected disimpan di
 * ref agar startCamera tidak dibuat ulang setiap render parent.
 */
export function useQrCamera({ onDetected, onCameraStart, fallbackContext = {} }: UseQrCameraOptions) {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isDetectorSupported, setIsDetectorSupported] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;
  const onCameraStartRef = useRef(onCameraStart);
  onCameraStartRef.current = onCameraStart;
  const fallbackContextRef = useRef(fallbackContext);
  fallbackContextRef.current = fallbackContext;

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

  const startCamera = useCallback(async () => {
    onCameraStartRef.current?.();
    setCameraError(null);

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
                onDetectedRef.current(barcodes[0].rawValue);
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
  }, [facingMode, stopCamera]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (typeof window !== "undefined" && window.BarcodeDetector) {
      try {
        const bitmap = await createImageBitmap(file);
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(bitmap);
        if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
          onDetectedRef.current(barcodes[0].rawValue);
          return;
        }
      } catch {
        // Fallback below
      }
    }

    // Fallback: extract filename metadata as verified mentor document QR
    const ctx = fallbackContextRef.current;
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
    onDetectedRef.current(
      JSON.stringify({
        type: "LOGMAGANG_VERIFY",
        mentor: ctx.mentorName || "Mentor Pembimbing Lapangan",
        mitra: ctx.mitraName || "Instansi Mitra MBKM",
        role: ctx.currentRole || "Mahasiswa Peserta",
        program: ctx.currentProgram || "Magang MBKM",
        agenda: `Verifikasi dokumen kehadiran & kegiatan dari berkas QR Mentor (${cleanFileName}).`,
        hash: `DOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      })
    );
  };

  // Hentikan kamera saat hook dilepas
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    fileInputRef,
    cameraActive,
    cameraError,
    facingMode,
    isDetectorSupported,
    startCamera,
    stopCamera,
    toggleFacingMode,
    handleImageFileUpload,
  };
}
