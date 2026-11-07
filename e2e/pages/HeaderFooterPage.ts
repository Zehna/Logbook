import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export type AppTabName =
  | "Generator & Dokumen"
  | "Konversi 20 SKS"
  | "CV ATS & LinkedIn"
  | "Simulasi Sidang DPL"
  | "Tim KKN Desa"
  | "Berkas & Penilaian";

/**
 * HeaderFooterPage Class (Page Object Model)
 * Menguji seluruh komponen Header navigasi atas, modal login akun, toggle tema, dan footer aplikasi.
 */
export class HeaderFooterPage extends BasePage {
  // Locators Header
  readonly logoTitle: Locator;
  readonly backupSyncButton: Locator;
  readonly quotaBadge: Locator;
  readonly loginButton: Locator;
  readonly themeToggleButton: Locator;

  // Locators Modal Autentikasi
  readonly authModalTitle: Locator;
  readonly authModalCloseButton: Locator;
  readonly localGuestButton: Locator;

  // Locators Footer
  readonly footerIndexedDbBadge: Locator;
  readonly footerCopyrightText: Locator;

  // Locators 6-Tab Navigation Bar
  readonly tabButtons: Locator;

  constructor(page: Page) {
    super(page);

    // Asumsi UI: Logo di pojok kiri atas bertuliskan "LogMagang OS"
    this.logoTitle = page.locator("header").getByText("LogMagang OS", { exact: false });

    // Tombol Backup & Sync di header
    this.backupSyncButton = page.locator("header").getByRole("button", { name: /Backup & Sync/i });

    // Status Kuota Penggunaan (e.g., "Kuota: 3/3" atau "Quota: 3/3")
    this.quotaBadge = page.locator("header").getByText(/Kuota:\s*\d+\/\d+|Quota/i);

    // Tombol Masuk Akun / Profil Mahasiswa
    this.loginButton = page.locator("header").getByRole("button", { name: /Masuk Akun/i });

    // Tombol Dark / Light Mode Toggle (memiliki aria-label="Toggle Dark Mode")
    this.themeToggleButton = page.locator("button[aria-label='Toggle Dark Mode']");

    // Modal Login
    this.authModalTitle = page.getByRole("heading", { name: /Masuk ke LogMagang OS|Akun Mahasiswa/i });
    this.authModalCloseButton = page.locator(".animate-scaleIn").getByRole("button").filter({
      has: page.locator("svg"),
    }).first();
    this.localGuestButton = page.getByRole("button", { name: /Mode Profil Lokal/i });

    // Footer Locators
    this.footerIndexedDbBadge = page.locator("footer").getByText(/IndexedDB Engine Aktif/i);
    this.footerCopyrightText = page.locator("footer").getByText(/LogMagang OS — Ekosistem Terpadu MBKM, MSIB & KKN/i);

    // 6-Tab Navigation
    this.tabButtons = page.locator("header div.border-t button");
  }

  /**
   * 1. Verifikasi teks logo "LogMagang OS" muncul di header
   */
  async verifyLogoVisible() {
    await expect(this.logoTitle.first()).toBeVisible();
  }

  /**
   * 2. Cek tombol "Backup & Sync" dan pastikan status kuota terlihat
   */
  async verifyBackupAndQuota() {
    await expect(this.backupSyncButton).toBeVisible();
    await expect(this.quotaBadge).toBeVisible();
  }

  /**
   * 3. Klik tombol "Masuk Akun", verifikasi modal terbuka, lalu tutup kembali
   */
  async testLoginModalOpenAndClose() {
    // Jika tombol "Masuk Akun" ada, klik untuk membuka modal
    if (await this.loginButton.isVisible()) {
      await this.loginButton.click();
      await expect(this.authModalTitle).toBeVisible({ timeout: 5000 });

      // Tutup modal dengan menekan tombol close (X) atau tombol Escape keyboard
      await this.page.keyboard.press("Escape");
      await expect(this.authModalTitle).toBeHidden({ timeout: 5000 });
    }
  }

  /**
   * 4. Uji tombol Dark / Light Mode Toggle dan pastikan class "dark" berubah pada <html>
   */
  async toggleThemeMode() {
    const htmlElement = this.page.locator("html");
    const wasDarkInitially = await htmlElement.evaluate((el) => el.classList.contains("dark"));

    // Klik tombol toggle
    await this.themeToggleButton.click();

    // Verifikasi perubahan class pada root HTML
    if (wasDarkInitially) {
      await expect(htmlElement).not.toHaveClass(/dark/);
    } else {
      await expect(htmlElement).toHaveClass(/dark/);
    }

    // Klik sekali lagi untuk mengembalikan ke tema awal
    await this.themeToggleButton.click();
  }

  /**
   * 5. Verifikasi status storage engine di footer
   */
  async verifyFooterEngineStatus() {
    await this.scrollToElement(this.footerIndexedDbBadge);
    await expect(this.footerIndexedDbBadge).toBeVisible();
    await expect(this.footerCopyrightText).toBeVisible();
  }

  /**
   * Beralih ke salah satu dari 6 Tab utama aplikasi
   */
  async navigateToTab(tabName: AppTabName) {
    const tabButton = this.page.locator("header").getByRole("button", { name: new RegExp(tabName, "i") });
    await tabButton.click();
    // Beri jeda micro-task agar transisi komponen selesai
    await this.page.waitForTimeout(300);
  }
}

