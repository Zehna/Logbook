# 🚀 LogMagang OS

> **The Ultimate All-in-One Academic & Career Platform for Indonesian Internship & KKN Students**  
> *Transform catatan harian santai menjadi laporan akademik berbobot, konversi 20 SKS CPL, resume ATS standar Harvard, dan simulasi sidang DPL interaktif bertenaga Google Gemini — model per-route, lihat Tech Stack.*

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=googlegemini&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB_Native-green?style=for-the-badge&logo=databricks&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

</div>

---

## 📌 Latar Belakang Masalah & Solusi

Mahasiswa peserta **Magang MBKM, MSIB, Praktik Kerja Lapangan (PKL/KP), dan Kuliah Kerja Nyata (KKN)** sering kali menghadapi beban administrasi ganda yang melelahkan:
- Menulis logbook harian di portal kampus/mitra secara berulang dengan kata-kata yang monoton.
- Kesulitan memetakan pekerjaan teknis sehari-hari ke **Capaian Pembelajaran Lulusan (CPL)** untuk klaim **Konversi 20 SKS**.
- Bingung menyusun **Laporan Akhir Bab I–V** sesuai pedoman kampus (Dikti, ITS, UI/UGM/IPB).
- Menghadapi **Dosen Pembimbing Lapangan (DPL)** yang kritis pada sidang pertanggungjawaban akhir tanpa persiapan mental.
- Catatan kerja magang mengendap tanpa sempat dikonversi menjadi **CV ATS** atau portofolio karier profesional.

**LogMagang OS** hadir sebagai sistem operasi akademik mahasiswa all-in-one yang mengotomatisasi seluruh siklus hidup magang—mulai dari input suara santai di lapangan hingga dokumen akademik siap sidang dan portofolio profesional siap lamar kerja.

---

## ✨ Fitur-Fitur Utama LogMagang OS

### 1. 📝 Bloom's Taxonomy Logbook Engine (Harian & 1 Pekan Borongan)
- **Multi-Tone Humanizer**: Pilihan gaya penulisan *Mahasiswa Alami* (natural, anti-robotik), *Akademik Formal* (standar kampus), atau *Korporat & Bisnis* (impact & KPI-driven).
- **Taksonomi Bloom (C3–C6)**: Setiap catatan harian otomatis diurai menjadi 5 parameter resmi:
  1. *Deskripsi Kegiatan* (Kata kerja operasional C3–C4).
  2. *Kompetensi yang Dikembangkan* (Hard skills & soft skills terukur).
  3. *Kendala yang Dihadapi* (Identifikasi objektif).
  4. *Solusi & Tindakan* (Mitigasi problem-solving nyata).
  5. *Refleksi Pembelajaran* (Evaluasi bermakna).
- **Mode Borongan 1 Pekan**: Cukup masukkan ringkasan mingguan santai, AI akan memecahnya menjadi 5 entri harian (Senin–Jumat) yang sinkron dan berkesinambungan.

### 2. 📸 Smart Ingestion Layer & Photo Watermark Stamper
- **Voice-to-Text (Web Speech API)**: Ikon mikrofon interaktif langsung di textarea dengan visual wave bar untuk mendiktekan kegiatan dalam Bahasa Indonesia (`id-ID`).
- **GitHub Commit Sync**: Tarik commit publik repositori GitHub via API (`/api/sync-github`) untuk otomatis mengubah commit teknis programmer menjadi draf logbook formal.
- **Calendar & Agenda Quick Import**: Tempel jadwal rapat harian atau unggah file `.ics` kalender.
- **Canvas Smart Photo Compressor**: Kompres otomatis foto bukti dokumentasi ke maks `1280px` (JPEG quality `0.82`), memangkas ukuran base64 (~100–180 KB) sehingga ekspor Word/PPT super cepat.
- **Official Timestamp Watermark**: Deteksi otomatis tanggal pengambilan foto (`file.lastModified`) dengan tombol sinkronisasi tanggal logbook 1-klik, serta banner semi-transparan resmi di bagian bawah foto (Tanggal, Jam WIB, Nama Mitra, Nama & NIM Mahasiswa).

### 3. 🎓 Konversi 20 SKS OBE & CPL (`app/api/map-sks`)
- Mahasiswa menginput daftar mata kuliah yang ingin dikonversi beserta bobot SKS.
- Gemini 3.8 Flash membedah seluruh riwayat logbook dan memetakannya ke Capaian Pembelajaran Lulusan (CPL) masing-masing mata kuliah.
- Menghasilkan **Matriks Justifikasi Konversi SKS**, analisis persentase kecukupan jam kerja, dan rekomendasi nilai objektif untuk DPL.

### 4. 💼 Logbook to Harvard ATS Resume & LinkedIn Branding (`app/api/generate-resume`)
- Mentransformasi riwayat kerja mentah menjadi **STAR Framework** (*Situation, Task, Action, Result*) dengan metrik kuantitatif terukur.
- **Live Editable Harvard ATS Preview**: Pratinjau lembar kertas A4 standar Harvard dengan kapabilitas inline-editing langsung pada dokumen.
- **1-Click Export Word ATS (`.docx`) & Cetak PDF**: Format 1-kolom murni, font Times New Roman, dan margin 0.75 inci yang lolos uji bot scanner recruitment HR.
- **LinkedIn Storytelling Generator**: Draf postingan personal branding (Hook, Tantangan, Capaian, Refleksi, dan Hashtags) serta Top 5 Skills rekomendasi.

### 5. 🎙️ Two-Way Interactive DPL Defense Simulator (`app/api/simulator-dpl` & `app/api/evaluate-defense`)
- **Skeptical Examiner AI**: AI membedah celah pada riwayat logbook dan mengajukan 5 pertanyaan sidang paling mematikan beserta motif penguji dan tips taktis menjawab.
- **Voice Examiner (Text-to-Speech)**: Dengarkan pertanyaan dosen secara langsung menggunakan Web Speech Synthesis (`id-ID`).
- **Interactive Practice Mode**: Mahasiswa mendiktekan/mengetik jawaban mandiri, lalu DPL AI menguji kelayakan jawaban dengan mengembalikan skor numerik (0–100), ulasan kritis, poin penting yang terlewat, dan draf jawaban revisi ideal (skor A).

### 6. 🏕️ Tim KKN Desa & Manajemen Proker Kolektif
- Dashboard tim terpadu untuk mendata Divisi, Kepala Desa, DPL, serta Proker Kelompok (Kesehatan, Pendidikan, UMKM, Infrastruktur, Teknologi).
- **Tombol "➕ Jadikan Logbook Harian"**: Anggota tim dapat langsung mengonversi progres proker kelompok menjadi entri logbook harian individu tanpa mengetik ulang.
- Ekspor Dokumen Buku Laporan Akhir KKN Kolektif.

### 7. 📘 Hub Ekspor Multi-Format & AI Bab I–V Synthesizer
- **🧠 AI Deep Academic Chapter Synthesizer (`/api/synthesize-report`)**:
  Menyintesis naskah akademik Bab I (Latar Belakang 3 paragraf mendalam & Rumusan Masalah), Bab II (Landasan Teori & Profil Mitra), Bab IV (Pembahasan Komprehensif & Analisis Problem Solving), serta Bab V (Kesimpulan & Saran Strategis) langsung ke dalam file Word.
- **3 Preset Pedoman Kampus**:
  - *Standar Nasional Dikti / Umum* (Margin 4-4-3-3 cm, Times New Roman 12pt, Spasi 1.5).
  - *Standar ITS / Politeknik* (Buku KP: Bab I–V + Lembar Pengesahan Ganda Dosen & Mentor Lapangan).
  - *Standar UI / UGM / IPB* (Executive Summary + Matriks Capaian Kompetensi).
- **Ekspor Dokumen Lainnya**:
  - Spreadsheet Rekap Excel 8 Kolom (`.xlsx`) lengkap dengan rumus jam kerja dan status validasi.
  - Slide Presentasi Sidang Akhir PowerPoint (`.pptx`) berdesain modern 16:9 lengkap dengan embedding foto dokumentasi.

### 8. 🧩 Zero-Click Chrome Extension Bridge (Manifest V3)
- Ekstensi Chrome bawaan yang dapat diunduh langsung dari aplikasi (`/api/download-extension`).
- Menginjeksi tombol *"⚡ Auto-Fill LogMagang"* pada portal Kampus Merdeka, Simaster, MyITS, dan portal kampus lainnya untuk mengisi form logbook secara instan tanpa copas manual.

### 9. 💾 IndexedDB Native Storage Engine
- Wrapper IndexedDB native berkapasitas besar untuk mencegah error kuota `localStorage` (`QuotaExceededError` 5MB), aman menampung ratusan foto bukti kegiatan beresolusi tinggi.
- Mekanisme auto-migrasi transparan saat aplikasi pertama kali dimuat.
- Indikator kapasitas dan status penyimpanan real-time.

### 10. 📊 Attendance Tracker & Quality Audit
- **Kalkulator 900 Jam MBKM**: Visualisasi progress bar menuju syarat 20 SKS MBKM (Total Hari × 8 Jam).
- **Heatmap Kehadiran 30 Hari Kerja**: Indikator hari kerja terisi vs bolong; klik tanggal kosong untuk langsung mengisi logbook yang terlewat.
- **Audit Anti-Duplikasi & Keunikan Kosakata**: Analisis persentase keunikan teks logbook untuk mencegah teguran DPL/mitra atas indikasi copas kegiatan.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Core**: [Google Gemini](https://ai.google.dev/) via `@google/genai` SDK (Structured JSON Schema). String model yang dipakai di kode: `gemini-3.8-flash` di 8 route AI (`generate`, `generate-weekly`, `generate-resume`, `map-sks`, `simulator-dpl`, `evaluate-defense`, `synthesize-report`, `sync-github`) dan `gemini-2.5-flash` di `generate-monthly`. Dua route lain (`download-extension`, `verify-license`) tidak memanggil Gemini. Pastikan string model ini cocok dengan model yang aktif di akun Google AI Studio Anda; bila API mengembalikan error model tidak ditemukan, sesuaikan di `app/api/*/route.ts`.
- **Doc Exporters**: `docx` (Word), `exceljs` (Excel), `pptxgenjs` (PowerPoint), `file-saver`
- **Speech API**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **Storage**: Browser IndexedDB Native API untuk logbook & draf offline, plus Firebase Auth + Cloud Firestore untuk profil pengguna dan sinkronisasi (lihat bagian Privasi di bawah)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing & CI**: Vitest (unit test, `npm test`), Playwright (e2e, `npm run test:e2e`), GitHub Actions (`.github/workflows/ci.yml`: lint, typecheck, unit test, build)

---

## 🏁 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat
Pastikan komputer Anda telah terinstal:
- [Node.js](https://nodejs.org/) v18.18 atau lebih baru
- [npm](https://www.npmjs.com/) atau pnpm / yarn

### 2. Clone Repositori
```bash
git clone https://github.com/Zehna/Logbook.git
cd Logbook
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variable
Buat file `.env.local` di root proyek:
```bash
cp .env.example .env.local
```
Isi file `.env.local` dengan API Key Google Gemini Anda:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```
> *Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/).*

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka browser dan navigasikan ke `http://localhost:3000`.

### 6. Build untuk Produksi
```bash
npm run build
npm start
```

---

## 🧪 Pengembangan & Pengujian

```bash
npm run dev        # development server di http://localhost:3000
npm run lint       # ESLint
npx tsc --noEmit   # typecheck TypeScript
npm test           # unit test Vitest (src/**/*.test.ts, offline/murni)
npm run test:e2e   # end-to-end Playwright
npm run build      # production build (butuh GEMINI_API_KEY, placeholder cukup untuk build)
```

CI GitHub Actions (`.github/workflows/ci.yml`) menjalankan lint, typecheck, unit test, dan build di setiap push/PR ke `main`.

**Catatan refactor fondasi (Nov 2026):** `app/page.tsx` dipecah dari 5.462 baris (±250 KB) menjadi ~4.577 baris — konfigurasi (`src/lib/config/`), formatter & selektor ekspor murni (`src/lib/utils/logbookFormatting.ts`, `exportEntries.ts`, `textSimilarity.ts`, `dates.ts`), dan tiga section hasil (`DailyResultSection`, `WeeklyResultsSection`, `MonthlyResultsSection`) dipindah ke modulnya masing-masing tanpa mengubah perilaku/UI. Kartu form input dan Hub Ekspor masih berada di `page.tsx` karena sangat terikat dengan puluhan state di dalamnya — pemecahannya ditunda ke tahap berikutnya agar tidak berisiko merusak.

## 📁 Struktur Direktori Proyek

```
Logbook/
├── app/
│   ├── api/
│   │   ├── download-extension/   # Generator zip Chrome Extension Manifest V3
│   │   ├── evaluate-defense/     # AI Two-Way Defense Evaluator
│   │   ├── generate/             # Generator Logbook Harian + Multimodal Vision
│   │   ├── generate-monthly/     # Generator Laporan Bulanan Monev
│   │   ├── generate-resume/      # Generator Harvard ATS Resume & LinkedIn
│   │   ├── generate-weekly/      # Generator Logbook Mode Borongan 1 Pekan
│   │   ├── map-sks/              # Engine Pemetaan Konversi 20 SKS CPL
│   │   ├── simulator-dpl/        # Generator Pertanyaan Sidang DPL Kritis
│   │   ├── sync-github/          # Sync Commit GitHub REST API
│   │   ├── synthesize-report/    # AI Synthesizer Bab I-V Laporan Word
│   │   └── verify-license/       # Verifikasi Lisensi Pro
│   ├── globals.css               # Styling Tailwind CSS & Print Rules
│   ├── layout.tsx                # Metadata & Root Layout
│   ├── not-found.tsx             # Halaman 404
│   └── page.tsx                  # Dashboard Utama & State Coordinator
├── src/
│   ├── components/
│   │   ├── AdminDocsTab.tsx      # Dokumen Mentor & Rubrik Penilaian
│   │   ├── AtsResumeTab.tsx      # Live Editable Harvard ATS CV Sheet & LinkedIn
│   │   ├── AttendanceTracker.tsx # Heatmap Kehadiran & Kalkulator 900 Jam
│   │   ├── AuditHistoryPanel.tsx # Panel Audit Kualitas & 1-Click AI Auto-Fix
│   │   ├── DailyResultSection.tsx    # Hasil logbook harian (5 kartu Bloom)
│   │   ├── DplSimulatorTab.tsx   # Two-Way DPL Simulator & Voice Examiner
│   │   ├── KknTeamTab.tsx        # Manajemen Tim KKN Desa & Proker
│   │   ├── MonthlyResultsSection.tsx # Hasil laporan bulanan Monev
│   │   ├── SksConversionTab.tsx  # Matriks Konversi 20 SKS & CPL
│   │   ├── WeeklyResultsSection.tsx  # Hasil logbook borongan 1 pekan
│   │   ├── VoiceDictationButton.tsx # Dikte Suara Web Speech API (id-ID)
│   │   └── ... (modal: Auth, License, LivePreview, QrScanner,
│   │        CalendarCompetency, SmartIngestion, WorkspaceSync,
│   │        TemplateLibrary)
│   ├── lib/
│   │   ├── config/               # programOptions, sections (Bloom), storageKeys
│   │   ├── exporters/            # Generator Word, Excel, PPTX, & ATS CV
│   │   ├── firebase/             # Firebase Auth + Firestore (config.ts)
│   │   ├── media/
│   │   │   └── imageProcessor.ts # Kompresi Canvas & Watermark Stamper
│   │   ├── security/
│   │   │   └── rateLimiter.ts    # Sliding-window rate limit API (20/menit/IP)
│   │   ├── storage/
│   │   │   └── indexedDbStore.ts # Mesin Penyimpanan IndexedDB Native
│   │   ├── types/                # Definisi TypeScript Data & Schema
│   │   └── utils/                # dates, exportEntries, logbookFormatting,
│   │                             # textSimilarity, indonesianHolidays
│   ├── lib/utils.ts              # cn() (clsx + tailwind-merge)
│   └── ...
├── e2e/                          # Tes end-to-end Playwright
├── extension/                    # Sumber Chrome Extension (Manifest V3)
├── .github/workflows/ci.yml      # CI: lint, typecheck, unit test, build
├── firestore.rules               # Aturan Firestore: default-deny, owner-only
├── firebase-applet-config.json   # Konfigurasi Firebase (bukan secret)
├── LICENSE                       # Lisensi MIT
└── public/                       # Aset Statis, Logo, & Icons
```

---

## 🔒 Privasi & Keamanan Data Mahasiswa
- **Penyimpanan Hibrida (bukan local-first murni)**: Riwayat logbook, draf offline, dan foto bukti tersimpan di IndexedDB browser Anda. Profil pengguna dan sinkronisasi antar-perangkat memakai Firebase Auth + Cloud Firestore (`src/lib/firebase/config.ts`, `firestore.rules` dengan default-deny dan akses owner-only per `users/{userId}`). Data yang dikirim ke Gemini hanya terjadi saat Anda menekan Generate — lewat route API server (`app/api/*`) dengan rate limit dan pemotongan panjang input.
- **Client-Side Image Compression**: Pemrosesan resolusi foto dan pembubuhan watermark dilakukan sepenuhnya pada HTML5 Canvas browser Anda sebelum dikirimkan ke model vision.

---

## 🤝 Berkontribusi
Kontribusi terbuka untuk seluruh mahasiswa dan developer Indonesia!
1. Fork repositori ini.
2. Buat feature branch baru (`git checkout -b feature/FiturBaru`).
3. Commit perubahan Anda (`git commit -m "feat: tambahkan fitur baru"`).
4. Push ke branch Anda (`git push origin feature/FiturBaru`).
5. Buat Pull Request di GitHub.

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.

<div align="center">
  <sub>Dibangun dengan dedikasi untuk mendukung kemerdekaan belajar mahasiswa Indonesia 🇮🇩</sub>
</div>
