import { test, expect } from "@playwright/test";
import { HeaderFooterPage } from "../pages/HeaderFooterPage";
import { GeneratorDokumenPage } from "../pages/GeneratorDokumenPage";
import { KonversiSksPage } from "../pages/KonversiSksPage";
import { CvAtsPage } from "../pages/CvAtsPage";
import { SimulasiDplPage } from "../pages/SimulasiDplPage";
import { TimKknPage } from "../pages/TimKknPage";
import { BerkasPenilaianPage } from "../pages/BerkasPenilaianPage";
import { TEST_DATA } from "../utils/test-data";

/**
 * End-to-End (E2E) Test Suite Komprehensif — LogMagang OS
 * Arsitektur: Page Object Model (POM)
 * Meliputi 7 Fitur Utama:
 * 1. Global Header & Footer
 * 2. Tab Generator & Dokumen (Logbook AI)
 * 3. Tab Konversi 20 SKS
 * 4. Tab CV ATS & LinkedIn
 * 5. Tab Simulasi Sidang DPL
 * 6. Tab Tim KKN Desa
 * 7. Tab Berkas & Penilaian
 */
test.describe("LogMagang OS — Full Application E2E Test Suite", () => {
  let headerFooter: HeaderFooterPage;
  let generatorDokumen: GeneratorDokumenPage;
  let konversiSks: KonversiSksPage;
  let cvAts: CvAtsPage;
  let simulasiDpl: SimulasiDplPage;
  let timKkn: TimKknPage;
  let berkasPenilaian: BerkasPenilaianPage;

  test.beforeEach(async ({ page }) => {
    // Inisialisasi seluruh Page Object
    headerFooter = new HeaderFooterPage(page);
    generatorDokumen = new GeneratorDokumenPage(page);
    konversiSks = new KonversiSksPage(page);
    cvAts = new CvAtsPage(page);
    simulasiDpl = new SimulasiDplPage(page);
    timKkn = new TimKknPage(page);
    berkasPenilaian = new BerkasPenilaianPage(page);

    // 1. Injeksi inisialisasi script pembersih storage sebelum dokumen dimuat
    await page.addInitScript(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {}
    });

    // 2. Evaluasi pembersihan storage secara langsung (dilindungi try/catch terhadap security sandbox about:blank)
    try {
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {}
      });
    } catch {
      // Pada about:blank, akses storage dibatasi browser sampai navigasi pertama ke origin
    }

    // 3. Buka aplikasi di http://localhost:3000 setelah storage dipersiapkan
    await headerFooter.goto("/");

    // 4. Bersihkan juga database IndexedDB untuk mencegah crash QuotaExceeded
    await headerFooter.clearAppStorage();
  });

  test("1. GLOBAL HEADER & FOOTER: Verifikasi Logo, Kuota, Modal Login, Dark Mode, & Footer Engine", async () => {
    // 1.1 Verifikasi Teks Logo
    await headerFooter.verifyLogoVisible();

    // 1.2 Verifikasi Tombol Backup & Sync serta Status Kuota
    await headerFooter.verifyBackupAndQuota();

    // 1.3 Verifikasi Modal Login Akun (buka lalu tutup kembali)
    await headerFooter.testLoginModalOpenAndClose();

    // 1.4 Verifikasi Toggle Tema Dark/Light Mode
    await headerFooter.toggleThemeMode();

    // 1.5 Verifikasi Status Mesin Penyimpanan Footer (IndexedDB Engine Aktif)
    await headerFooter.verifyFooterEngineStatus();
  });

  test("2. TAB 'Generator & Dokumen': Pengisian Catatan Logbook & Generasi Dokumen AI", async () => {
    // Beralih ke tab Generator & Dokumen
    await headerFooter.navigateToTab("Generator & Dokumen");

    // Mengisi catatan kegiatan harian
    await generatorDokumen.fillDailyLogbook(TEST_DATA.dailyLogbook.catatan);

    // Klik tombol generate dan tunggu sampai hasil Taksonomi Bloom & Hub Ekspor muncul
    await generatorDokumen.clickGenerateAndWaitForResult(30000);
  });

  test("3. TAB 'Konversi 20 SKS': Pemilihan Preset Informatika & Pemetaan Matriks CPL", async () => {
    // Beralih ke tab Konversi 20 SKS
    await headerFooter.navigateToTab("Konversi 20 SKS");

    // Klik preset Ilmu Komputer / Informatika (20 SKS)
    await konversiSks.selectInformatikaPreset();

    // Isi bukti aktivitas logbook dummy
    await konversiSks.fillActivityEvidence(TEST_DATA.konversiSks.dummyActivity);

    // Klik tombol oranye generate matriks dan tunggu hasil tabel CPL muncul
    await konversiSks.clickGenerateMatrixAndWait(30000);
  });

  test("4. TAB 'CV ATS & LinkedIn': Transformasi Catatan Magang ke Resume Standar Harvard", async () => {
    // Beralih ke tab CV ATS & LinkedIn
    await headerFooter.navigateToTab("CV ATS & LinkedIn");

    // Mengisi profil target karier dan pengalaman kerja
    await cvAts.fillResumeForm(
      TEST_DATA.atsResume.targetRole,
      TEST_DATA.atsResume.dummyExperience
    );

    // Klik tombol generate dan verifikasi hasil analisis STAR serta lembar Harvard CV
    await cvAts.generateResumeAndWait(30000);
  });

  test("5. TAB 'Simulasi Sidang DPL': Uji Sidang DPL & Evaluasi Interaktif Jawaban Mahasiswa", async () => {
    // Beralih ke tab Simulasi Sidang DPL
    await headerFooter.navigateToTab("Simulasi Sidang DPL");

    // Siapkan data laporan contoh
    await simulasiDpl.setupSimulationData();

    // Mulai simulasi dan tunggu bank pertanyaan dari DPL AI
    await simulasiDpl.startSimulationAndWait(30000);

    // Berikan jawaban mahasiswa pada pertanyaan dan lakukan pengujian evaluasi dua arah
    await simulasiDpl.answerQuestionAndEvaluate(
      TEST_DATA.simulasiDpl.dummyAnswer,
      25000
    );
  });

  test("6. TAB 'Tim KKN Desa': Tambah Program Kerja Baru Lintas Divisi & Verifikasi Daftar", async () => {
    // Beralih ke tab Tim KKN Desa
    await headerFooter.navigateToTab("Tim KKN Desa");

    // Tambah proker baru
    await timKkn.addNewProgramKerja(
      TEST_DATA.timKkn.namaProker,
      TEST_DATA.timKkn.sasaranWarga,
      TEST_DATA.timKkn.output
    );
  });

  test("7. TAB 'Berkas & Penilaian': Unggah Logo Perusahaan, Isi Evaluasi Mentor, & Unduh Berkas", async () => {
    // Beralih ke tab Berkas & Penilaian
    await headerFooter.navigateToTab("Berkas & Penilaian");

    // Uji upload logo mitra (menggunakan memory image buffer)
    await berkasPenilaian.uploadCompanyLogo();

    // Isi catatan naratif ulasan mentor
    await berkasPenilaian.fillMentorReview(
      TEST_DATA.berkasPenilaian.catatanEvaluasi
    );

    // Unduh lembar penilaian resmi (.docx) dan verifikasi notifikasi toast
    await berkasPenilaian.downloadEvaluationDocxAndVerify();
  });
});

