import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * BerkasPenilaianPage Class (Page Object Model)
 * Menguji fitur Administrasi Berkas, Unggah Logo Perusahaan (File Upload), Input Rubrik Nilai Mentor, dan Ekspor Lembar Penilaian (.docx).
 */
export class BerkasPenilaianPage extends BasePage {
  // Locators Header Tab
  readonly headerTitle: Locator;

  // Locators File Upload Logo Perusahaan
  readonly fileUploadInput: Locator;
  readonly uploadedLogoPreview: Locator;

  // Locators Form Penilaian Mentor
  readonly mentorNameInput: Locator;
  readonly mentorTitleInput: Locator;
  readonly mentorReviewTextarea: Locator;

  // Locators Aksi Unduh / Simpan Berkas
  readonly downloadEvaluationDocxButton: Locator;

  constructor(page: Page) {
    super(page);

    this.headerTitle = page.getByText(/Kop Surat Resmi & Berkas Administrasi Mitra/i);

    // Input file upload tersembunyi (hidden file input) untuk logo perusahaan
    this.fileUploadInput = page.locator("input[type='file'][accept*='image']").first();
    this.uploadedLogoPreview = page.getByText(/Logo Terpasang di Kop Surat/i);

    // Form input data mentor
    this.mentorNameInput = page.locator("input").filter({
      has: page.locator("xpath=preceding-sibling::label[contains(., 'Nama Lengkap Mentor')]"),
    }).or(page.locator("input").filter({ hasText: /Mentor|Pembimbing/i })).first();

    this.mentorTitleInput = page.locator("input").filter({
      has: page.locator("xpath=preceding-sibling::label[contains(., 'Jabatan')]"),
    }).first();

    this.mentorReviewTextarea = page.locator("textarea").filter({
      has: page.locator("xpath=preceding-sibling::p[contains(., 'Ulasan naratif')]"),
    }).or(page.getByPlaceholder(/Tuliskan catatan kualitatif performa/i)).first();

    // Tombol aksi unduh lembar penilaian .docx
    this.downloadEvaluationDocxButton = page.getByRole("button", {
      name: /Unduh Lembar Penilaian \(\.docx\)/i,
    });
  }

  /**
   * 1. Menguji fungsionalitas unggah file (file upload logo mitra) menggunakan memory buffer
   */
  async uploadCompanyLogo() {
    // 1x1 pixel PNG buffer untuk mock pengujian upload yang aman tanpa file eksternal
    const dummyImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    await this.fileUploadInput.setInputFiles({
      name: "company-logo.png",
      mimeType: "image/png",
      buffer: dummyImageBuffer,
    });

    // Verifikasi pesan sukses toast upload logo
    await this.expectToastMessage(/Logo kop surat berhasil dipasang/i);

    // Verifikasi indikator logo terpasang muncul di UI
    await expect(this.uploadedLogoPreview).toBeVisible();
  }

  /**
   * 2. Mengisi form ulasan evaluasi mentor dengan data dummy
   */
  async fillMentorReview(reviewText: string) {
    if (await this.mentorReviewTextarea.isVisible()) {
      await this.mentorReviewTextarea.fill(reviewText);
    }
  }

  /**
   * 3. Klik tombol unduh lembar penilaian dan verifikasi notifikasi sukses
   */
  async downloadEvaluationDocxAndVerify() {
    await this.downloadEvaluationDocxButton.click();

    // Verifikasi toast notifikasi berhasil diunduh muncul
    await this.expectToastMessage(/Lembar Penilaian Kinerja Mentor \(\.docx\) berhasil diunduh/i);
  }
}

