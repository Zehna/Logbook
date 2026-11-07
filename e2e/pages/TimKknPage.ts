import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * TimKknPage Class (Page Object Model)
 * Menguji fitur Manajemen Tim KKN Desa, Program Kerja Antar-Divisi, dan Penyusunan Laporan Kolektif.
 */
export class TimKknPage extends BasePage {
  // Locators Header Tab KKN
  readonly headerTitle: Locator;

  // Locators Tambah Proker / Anggota Baru
  readonly addProkerButton: Locator;
  readonly prokerNameInput: Locator;
  readonly prokerDivisionSelect: Locator;
  readonly prokerTargetInput: Locator;
  readonly prokerOutputTextarea: Locator;
  readonly saveProkerButton: Locator;

  // Locators List Program Kerja
  readonly prokerListContainer: Locator;

  constructor(page: Page) {
    super(page);

    this.headerTitle = page.getByText(/Pusat Komando Tim KKN Desa/i);

    // Tombol pemicu form: "Tambah Proker Baru"
    this.addProkerButton = page.getByRole("button", { name: /Tambah Proker Baru/i });

    // Input form proker
    this.prokerNameInput = page.getByPlaceholder(/Pelatihan Pemasaran Digital UMKM Desa/i);
    this.prokerDivisionSelect = page.locator("select").first();
    this.prokerTargetInput = page.getByPlaceholder(/40 Petani Kopi Dusun 1/i);
    this.prokerOutputTextarea = page.getByPlaceholder(/Tuliskan luaran nyata/i);

    // Tombol simpan
    this.saveProkerButton = page.getByRole("button", { name: /Simpan Proker/i });

    // List container
    this.prokerListContainer = page.locator(".space-y-3");
  }

  /**
   * Menambahkan Program Kerja / Kegiatan Tim KKN baru
   */
  async addNewProgramKerja(namaProker: string, sasaran: string, output: string) {
    await this.addProkerButton.click();

    await this.prokerNameInput.fill(namaProker);
    await this.prokerTargetInput.fill(sasaran);
    await this.prokerOutputTextarea.fill(output);

    await this.saveProkerButton.click();

    // Verifikasi pesan notifikasi sukses muncul
    await this.expectToastMessage(/Program kerja baru berhasil ditambahkan/i);

    // Verifikasi proker baru langsung muncul di daftar kartu/tabel
    const newlyAddedItem = this.page.getByText(namaProker, { exact: false });
    await expect(newlyAddedItem.first()).toBeVisible();
  }
}

