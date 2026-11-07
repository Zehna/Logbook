import { Page, Locator, expect } from "@playwright/test";

/**
 * BasePage Class
 * Menyediakan fungsionalitas dasar yang digunakan oleh semua Page Objects:
 * - Navigasi URL dengan penantian hidrasi Next.js
 * - Pembersihan storage (localStorage, sessionStorage, IndexedDB) untuk mencegah QuotaExceeded
 * - Verifikasi Toast Sonner
 * - Penanganan loader animasi
 * - Auto-wait resilient utilities
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Buka URL halaman utama aplikasi dengan penantian hidrasi Next.js/React yang matang
   */
  async goto(path: string = "/") {
    await this.page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: 60 * 1000,
    });

    // Menunggu hingga elemen header ter-render untuk memastikan React hydration selesai
    await this.page.locator("header").waitFor({ state: "visible", timeout: 30000 });
  }

  /**
   * Membersihkan seluruh data penyimpanan aplikasi:
   * - localStorage
   * - sessionStorage
   * - IndexedDB (semua database logbook)
   * Sangat penting untuk mencegah crash error QuotaExceeded saat aplikasi pertama kali dihidrasi di browser.
   */
  async clearAppStorage() {
    try {
      await this.page.evaluate(async () => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {
          // Ignore jika akses storage dibatasi di lingkungan tertentu
        }

        // Hapus database IndexedDB jika didukung oleh browser runtime
        if (typeof indexedDB !== "undefined" && indexedDB.databases) {
          try {
            const databases = await indexedDB.databases();
            for (const db of databases) {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            }
          } catch {
            // Ignore error penghapusan IDB
          }
        }
      });
    } catch {
      // Abaikan jika dipanggil saat konteks dokumen belum memiliki origin aktif
    }
  }

  /**
   * Tunggu sampai elemen loading / loader spin hilang dari layar
   */
  async waitForLoaderToDisappear(timeoutMs: number = 30000) {
    const loader = this.page.locator(".animate-spin");
    if (await loader.first().isVisible().catch(() => false)) {
      await loader.first().waitFor({ state: "hidden", timeout: timeoutMs });
    }
  }

  /**
   * Verifikasi kemunculan pesan Toast Notifikasi (Sonner)
   */
  async expectToastMessage(messagePattern: RegExp | string, timeoutMs: number = 10000) {
    const toast = this.page.locator("[data-sonner-toast], [data-sonner-toaster], li[role='status']").filter({
      hasText: messagePattern,
    });
    await expect(toast.first()).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Scroll ke elemen tertentu dengan animasi mulus
   */
  async scrollToElement(locator: Locator) {
    await locator.scrollIntoViewIfNeeded();
  }
}
