import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * SimulasiDplPage Class (Page Object Model)
 * Menguji fitur Simulator Sidang Pertanggungjawaban DPL Kampus dan Evaluasi Jawaban Interaktif Dua Arah.
 */
export class SimulasiDplPage extends BasePage {
  // Locators Form Persiapan Sidang
  readonly judulLaporanInput: Locator;
  readonly mitraInput: Locator;
  readonly activityContextTextarea: Locator;
  readonly fillSampleReportButton: Locator;
  readonly startSimulationButton: Locator;

  // Locators Hasil Bank Soal Sidang
  readonly readinessScoreCard: Locator;
  readonly firstQuestionCard: Locator;

  // Locators Latihan Jawab Interaktif Mahasiswa
  readonly studentAnswerTextarea: Locator;
  readonly evaluateAnswerButton: Locator;
  readonly feedbackSection: Locator;

  constructor(page: Page) {
    super(page);

    // Form input konfigurasi laporan sidang
    this.judulLaporanInput = page.locator("input").filter({
      has: page.locator("xpath=preceding-sibling::label[contains(., 'Judul Draf Laporan')]"),
    }).or(page.locator("input").nth(0));
    this.mitraInput = page.locator("input").filter({
      has: page.locator("xpath=preceding-sibling::label[contains(., 'Nama Mitra')]"),
    }).or(page.locator("input").nth(1));

    // Textarea riwayat kegiatan untuk dicecar dosen
    this.activityContextTextarea = page.getByPlaceholder(/Masukkan rangkuman kegiatan harian\/mingguan/i);
    this.fillSampleReportButton = page.getByRole("button", { name: /Isi Contoh Laporan/i });

    // Tombol Mulai Simulasi: "🎙️ Mulai Uji Sidang DPL Sekarang"
    this.startSimulationButton = page.getByRole("button", {
      name: /Mulai Uji Sidang DPL Sekarang/i,
    });

    // Hasil Pertanyaan Sidang
    this.readinessScoreCard = page.getByText(/PREDIKSI KESIAPAN SIDANG/i);
    this.firstQuestionCard = page.getByText(/PERTANYAAN SIDANG DPL/i).first();

    // Mode Uji Dua Arah (Mahasiswa menjawab pertanyaan)
    this.studentAnswerTextarea = page.getByPlaceholder(/Ketik atau diktekan suara jawaban Anda/i).first();
    this.evaluateAnswerButton = page.getByRole("button", {
      name: /Uji Kelayakan Jawaban Saya/i,
    }).first();
    this.feedbackSection = page.getByText(/Evaluasi & Umpan Balik Penguji|Skor Akurasi|Kelebihan Jawaban/i).first();
  }

  /**
   * Menyiapkan form simulasi sidang dan menggunakan data contoh
   */
  async setupSimulationData() {
    await this.fillSampleReportButton.click();
    await expect(this.activityContextTextarea).not.toBeEmpty();
  }

  /**
   * Memulai simulasi sidang DPL dan menunggu pertanyaan dosen muncul
   */
  async startSimulationAndWait(timeoutMs: number = 30000) {
    await this.startSimulationButton.click();

    // Verifikasi bahwa skor kesiapan dan bank pertanyaan sidang telah dibuat oleh AI
    await expect(this.readinessScoreCard).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Mengisi jawaban mahasiswa untuk pertanyaan pertama dan meminta evaluasi DPL
   */
  async answerQuestionAndEvaluate(answerText: string, timeoutMs: number = 25000) {
    await this.studentAnswerTextarea.fill(answerText);
    await this.evaluateAnswerButton.click();

    // Verifikasi DPL AI memberikan respons evaluasi (skor akurasi / feedback)
    await expect(this.feedbackSection).toBeVisible({ timeout: timeoutMs });
  }
}

