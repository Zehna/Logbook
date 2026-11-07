import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * GeneratorDokumenPage Class (Page Object Model)
 * Menguji fungsionalitas Tab "Generator & Dokumen" (Logbook Harian, AI Prompting, dan Ekspor Dokumen).
 */
export class GeneratorDokumenPage extends BasePage {
  // Locators Form Harian
  readonly catatanTextarea: Locator;
  readonly fillSampleButton: Locator;
  readonly generateButton: Locator;

  // Locators Mode Tabs (Harian, 1 Pekan, Bulanan)
  readonly modeDailyButton: Locator;
  readonly modeWeeklyButton: Locator;

  // Locators Hasil Output AI
  readonly bloomTaxonomyHeading: Locator;
  readonly exportHubSection: Locator;
  readonly downloadWordButton: Locator;

  constructor(page: Page) {
    super(page);

    // Textarea input catatan santai kegiatan
    this.catatanTextarea = page.getByPlaceholder(/Tuliskan aktivitas santaimu hari ini|Catatan santai/i);

    // Tombol "Isi Contoh" untuk autocompletion data cepat
    this.fillSampleButton = page.getByRole("button", { name: /Isi Contoh/i }).first();

    // Tombol aksi utama "Generate Logbook Resmi"
    this.generateButton = page.getByRole("button", { name: /Generate Logbook Resmi/i });

    // Mode buttons
    this.modeDailyButton = page.getByRole("button", { name: /Harian \(1 Hari\)/i });
    this.modeWeeklyButton = page.getByRole("button", { name: /Borongan 1 Pekan/i });

    // Output Hasil Generasi AI
    this.bloomTaxonomyHeading = page.getByText(/Refleksi Evaluatif \(Bloom's Taxonomy\)|1\. Ringkasan Pekerjaan Teknis/i).first();
    this.exportHubSection = page.getByText(/Hub Ekspor Dokumen Resmi & Otomasi Kampus/i).first();
    this.downloadWordButton = page.getByRole("button", { name: /Unduh Laporan Magang Resmi/i }).first();
  }

  /**
   * Mengisi form logbook harian dengan catatan teks custom
   */
  async fillDailyLogbook(catatan: string) {
    await this.catatanTextarea.fill(catatan);
  }

  /**
   * Menggunakan fitur "Isi Contoh" bawaan aplikasi
   */
  async clickFillSample() {
    await this.fillSampleButton.click();
    // Pastikan textarea terisi teks contoh
    await expect(this.catatanTextarea).not.toBeEmpty();
  }

  /**
   * Menekan tombol Generate dan menunggu hingga AI selesai menyusun dokumen (dengan timeout adaptif AI)
   */
  async clickGenerateAndWaitForResult(timeoutMs: number = 30000) {
    await this.generateButton.click();

    // Verifikasi bahwa indikator loading / kartu hasil AI muncul
    await expect(this.bloomTaxonomyHeading).toBeVisible({ timeout: timeoutMs });

    // Verifikasi bahwa Hub Ekspor Dokumen siap diakses
    await expect(this.exportHubSection).toBeVisible({ timeout: timeoutMs });
  }
}

