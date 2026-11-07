import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * KonversiSksPage Class (Page Object Model)
 * Menguji fitur Pemetaan Matriks Konversi 20 SKS MBKM/MSIB ke Capaian Pembelajaran Lulusan (CPL/CPMK).
 */
export class KonversiSksPage extends BasePage {
  // Locators Preset & Input Matkul
  readonly informatikaPresetButton: Locator;
  readonly coursesTextarea: Locator;

  // Locators Bukti Aktivitas
  readonly activityTextarea: Locator;
  readonly fillSampleActivityButton: Locator;

  // Locators Aksi Generate & Hasil
  readonly generateMatrixButton: Locator;
  readonly resultTableTitle: Locator;
  readonly cplBadge: Locator;

  constructor(page: Page) {
    super(page);

    // Tombol Preset Prodi Informatika: "Ilmu Komputer / Informatika (20 SKS)"
    this.informatikaPresetButton = page.getByRole("button", {
      name: /Ilmu Komputer \/ Informatika \(20 SKS\)/i,
    });

    // Textarea daftar mata kuliah dan bobot SKS
    this.coursesTextarea = page.getByPlaceholder(/Tuliskan nama mata kuliah dan bobot SKS-nya/i);

    // Textarea bukti aktivitas mahasiswa
    this.activityTextarea = page.getByPlaceholder(/Masukkan rangkuman apa saja yang Anda kerjakan/i);

    // Tombol 1-klik "Isi Contoh Bukti"
    this.fillSampleActivityButton = page.getByRole("button", { name: /Isi Contoh Bukti/i });

    // Tombol oranye generate: "Petakan Matriks Konversi 20 SKS Sekarang"
    this.generateMatrixButton = page.getByRole("button", {
      name: /Petakan Matriks Konversi 20 SKS Sekarang/i,
    });

    // Hasil Output AI Pemetaan Matriks
    this.resultTableTitle = page.getByText(/Matriks Konversi Mata Kuliah & Pemenuhan 20 SKS/i);
    this.cplBadge = page.getByText(/Ketercapaian CPL/i).first();
  }

  /**
   * 1. Klik tombol preset prodi "Ilmu Komputer / Informatika (20 SKS)"
   */
  async selectInformatikaPreset() {
    await this.informatikaPresetButton.click();
    // Verifikasi bahwa textarea mata kuliah terisi otomatis
    await expect(this.coursesTextarea).not.toBeEmpty();
  }

  /**
   * 2. Isi textarea bukti aktivitas dengan teks dummy atau gunakan tombol sampel
   */
  async fillActivityEvidence(dummyText?: string) {
    if (dummyText) {
      await this.activityTextarea.fill(dummyText);
    } else {
      await this.fillSampleActivityButton.click();
    }
    await expect(this.activityTextarea).not.toBeEmpty();
  }

  /**
   * 3. Klik tombol oranye generate dan tunggu hingga hasil matriks konversi muncul
   */
  async clickGenerateMatrixAndWait(timeoutMs: number = 30000) {
    await this.generateMatrixButton.click();

    // Tunggu proses loading selesai dan tabel matriks konversi muncul di layar
    await expect(this.resultTableTitle).toBeVisible({ timeout: timeoutMs });
  }
}

