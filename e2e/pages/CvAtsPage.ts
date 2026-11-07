import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * CvAtsPage Class (Page Object Model)
 * Menguji fitur Transformasi Logbook menjadi Resume ATS Berstandar Harvard dan Konten Storytelling LinkedIn.
 */
export class CvAtsPage extends BasePage {
  // Locators Form Input
  readonly targetRoleInput: Locator;
  readonly activityContextTextarea: Locator;
  readonly fillSampleExperienceButton: Locator;
  readonly generateResumeButton: Locator;

  // Locators Hasil Output
  readonly starAnalysisTabButton: Locator;
  readonly previewSheetTabButton: Locator;
  readonly harvardPrintArea: Locator;
  readonly atsScoreBadge: Locator;

  constructor(page: Page) {
    super(page);

    // Input target posisi karier impian
    this.targetRoleInput = page.getByPlaceholder(/Junior Product Manager, Frontend Developer/i);

    // Textarea riwayat logbook/pengalaman kerja
    this.activityContextTextarea = page.getByPlaceholder(/Ketik atau biarkan terisi dari riwayat logbook/i);

    // Tombol "Isi Contoh Pengalaman"
    this.fillSampleExperienceButton = page.getByRole("button", { name: /Isi Contoh Pengalaman/i });

    // Tombol submit utama: "Generate ATS Resume & LinkedIn Story"
    this.generateResumeButton = page.getByRole("button", {
      name: /Generate ATS Resume & LinkedIn Story/i,
    });

    // Output Hasil
    this.starAnalysisTabButton = page.getByRole("button", { name: /Analisis STAR & LinkedIn/i });
    this.previewSheetTabButton = page.getByRole("button", { name: /Pratinjau Lembar Harvard CV/i });
    this.harvardPrintArea = page.locator("#harvard-cv-print-area");
    this.atsScoreBadge = page.getByText(/Skor Kesiapan ATS|Kesiapan ATS/i).first();
  }

  /**
   * Mengisi form input profil ATS
   */
  async fillResumeForm(targetRole: string, experienceText?: string) {
    await this.targetRoleInput.fill(targetRole);

    if (experienceText) {
      await this.activityContextTextarea.fill(experienceText);
    } else {
      await this.fillSampleExperienceButton.click();
    }
  }

  /**
   * Klik tombol generate dan verifikasi kemunculan hasil (Analisis STAR / Skor ATS)
   */
  async generateResumeAndWait(timeoutMs: number = 30000) {
    await this.generateResumeButton.click();

    // Verifikasi tombol toggle view muncul (menandakan hasil telah berhasil di-generate)
    await expect(this.starAnalysisTabButton).toBeVisible({ timeout: timeoutMs });

    // Verifikasi lembar pratinjau Harvard CV juga tersedia
    await this.previewSheetTabButton.click();
    await expect(this.harvardPrintArea).toBeVisible();
  }
}

