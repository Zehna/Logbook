/**
 * imageProcessor.ts
 * Utilitas pemrosesan gambar berbasis HTML5 Canvas untuk LogMagang OS:
 * 1. Kompresi otomatis gambar ke dimensi maks 1280px (JPEG q=0.82) untuk hemat memori & ekspor cepat.
 * 2. Ekstraksi tanggal & jam dari file.lastModified untuk sinkronisasi tanggal logbook.
 * 3. Watermarking banner resmi timestamp & identitas mahasiswa (standar verifikasi MBKM/KKN).
 */

export interface WatermarkOptions {
  enableWatermark: boolean;
  tanggalText?: string;
  identitasText?: string; // misal: "Budi Santoso • NIM: 22051204001"
  instansiText?: string; // misal: "Magang MBKM • PT Telkom Indonesia"
}

export interface ProcessedImageResult {
  base64: string;
  mimeType: string;
  fileSizeKb: number;
  originalDateIso: string; // "YYYY-MM-DD"
  originalDateFormatted: string; // "14 April 2026, 14:30 WIB"
  width: number;
  height: number;
  hasWatermark: boolean;
}

const MONTH_NAMES_ID = [
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

export function formatDateIndonesian(date: Date): { iso: string; formatted: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const iso = `${year}-${month}-${day}`;
  const monthName = MONTH_NAMES_ID[date.getMonth()];
  const formatted = `${day} ${monthName} ${year}, ${hours}:${minutes} WIB`;

  return { iso, formatted };
}

/**
 * Mengompresi file foto dan opsional membubuhkan banner watermark resmi timestamp & identitas
 */
export async function compressAndWatermarkImage(
  file: File,
  options?: WatermarkOptions
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("File foto tidak ditemukan."));
      return;
    }

    // Ekstrak timestamp file
    const fileTimestamp = file.lastModified ? new Date(file.lastModified) : new Date();
    const { iso: originalDateIso, formatted: originalDateFormatted } =
      formatDateIndonesian(fileTimestamp);

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar ke canvas."));
      img.onload = () => {
        try {
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          // Hitung rasio resolusi maksimal 1280px
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Gagal menginisialisasi 2D Canvas context."));
            return;
          }

          // Gambar foto utama
          ctx.drawImage(img, 0, 0, width, height);

          let hasWatermark = false;

          // Bubuhkan watermark jika diaktifkan
          if (options?.enableWatermark) {
            hasWatermark = true;
            const bannerHeight = Math.max(52, Math.round(height * 0.085));
            const bannerY = height - bannerHeight;

            // 1. Gambar latar belakang banner semi-transparan (gelap pekat)
            ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
            ctx.fillRect(0, bannerY, width, bannerHeight);

            // 2. Garis aksen atas banner (gradien indigo ke rose)
            const accentHeight = Math.max(3, Math.round(bannerHeight * 0.06));
            const gradient = ctx.createLinearGradient(0, bannerY, width, bannerY);
            gradient.addColorStop(0, "#4f46e5"); // indigo-600
            gradient.addColorStop(0.5, "#ec4899"); // pink-500
            gradient.addColorStop(1, "#f59e0b"); // amber-500
            ctx.fillStyle = gradient;
            ctx.fillRect(0, bannerY, width, accentHeight);

            // 3. Teks Informasi Watermark
            const fontSizePrimary = Math.max(12, Math.round(bannerHeight * 0.28));
            const fontSizeSecondary = Math.max(10, Math.round(bannerHeight * 0.24));
            const paddingX = Math.max(16, Math.round(width * 0.03));

            const instansi = options.instansiText || "Program Magang / KKN Mahasiswa";
            const tanggalStr = options.tanggalText || originalDateFormatted;
            const identitas = options.identitasText || "Peserta Terverifikasi LogMagang OS";

            // Baris 1: Instansi & Timestamp
            ctx.font = `bold ${fontSizePrimary}px system-ui, -apple-system, sans-serif`;
            ctx.fillStyle = "#ffffff";
            const line1Text = `📍 ${instansi} • 🕒 ${tanggalStr}`;
            ctx.fillText(line1Text, paddingX, bannerY + accentHeight + fontSizePrimary + 4);

            // Baris 2: Identitas Mahasiswa & Validasi
            ctx.font = `normal ${fontSizeSecondary}px system-ui, -apple-system, sans-serif`;
            ctx.fillStyle = "#cbd5e1"; // slate-300
            const line2Text = `👤 ${identitas}  |  BUKTI DOKUMENTASI RESMI`;
            ctx.fillText(
              line2Text,
              paddingX,
              bannerY + accentHeight + fontSizePrimary + fontSizeSecondary + 10
            );

            // Logo Watermark kecil di pojok kanan banner
            const logoText = "LOGMAGANG OS";
            ctx.font = `bold ${Math.max(10, Math.round(fontSizeSecondary * 0.95))}px system-ui, sans-serif`;
            ctx.fillStyle = "#facc15"; // amber-400
            const logoMetrics = ctx.measureText(logoText);
            ctx.fillText(
              logoText,
              width - paddingX - logoMetrics.width,
              bannerY + accentHeight + fontSizePrimary + 4
            );
          }

          // Konversi ke format JPEG dengan kualitas 0.82
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.82);
          const head = "data:image/jpeg;base64,";
          const dataLength = compressedBase64.length - head.length;
          const fileSizeKb = Math.round((dataLength * 3) / 4 / 1024);

          resolve({
            base64: compressedBase64,
            mimeType: "image/jpeg",
            fileSizeKb,
            originalDateIso,
            originalDateFormatted,
            width,
            height,
            hasWatermark,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
