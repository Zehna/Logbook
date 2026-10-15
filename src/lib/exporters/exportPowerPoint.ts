import {
  LogbookEntry,
  StudentProfile,
  DEFAULT_STUDENT_PROFILE,
} from "./types";
import { MentorAdminData } from "./exportAdminDocs";

function truncateText(text: string, maxLength: number): string {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trimEnd() + "...";
}

function normalizeBase64DataUrl(raw: string, mimeType = "image/jpeg"): string {
  if (raw.startsWith("data:")) return raw;
  return `data:${mimeType};base64,${raw}`;
}

export async function exportLogbookToPowerPoint(
  entries: LogbookEntry[],
  profile: Partial<StudentProfile> = {},
  mentorAdminData?: Partial<MentorAdminData>
): Promise<void> {
  // Dynamic import agar aman di sisi client browser Next.js
  const PptxGenJSModule = await import("pptxgenjs");
  const PptxGenJS = PptxGenJSModule.default || PptxGenJSModule;

  const student: StudentProfile = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const primary = entries[0];
  const programName = primary?.tipeKegiatan || "Magang MBKM";
  const roleName = primary?.peran || "Mahasiswa Peserta Program";

  // Cek apakah ada entri yang memiliki foto dokumentasi
  const photoEntry = entries.find((e) => Boolean(e.fotoBase64));

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9"; // 10 x 5.625 inches
  pptx.author = student.namaMahasiswa;
  pptx.company = student.perguruanTinggi;
  pptx.subject = `Sidang Akhir ${programName}`;
  pptx.title = `Presentasi Sidang Akhir ${programName} - ${student.namaMahasiswa}`;

  // Palet Warna Profesional
  const COLOR_DARK = "1E1B4B"; // Indigo 950
  const COLOR_PRIMARY = "4F46E5"; // Indigo 600
  const COLOR_ACCENT = "F59E0B"; // Amber 500
  const COLOR_EMERALD = "059669"; // Emerald 600
  const COLOR_LIGHT_BG = "F8FAFC"; // Slate 50
  const COLOR_CARD_BG = "FFFFFF";
  const COLOR_TEXT_MAIN = "0F172A";
  const COLOR_TEXT_MUTED = "475569";
  const COLOR_BORDER = "E2E8F0";

  const totalSlides = photoEntry ? 8 : 7;

  const addHeaderBanner = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    slide: any,
    slideNumber: string,
    sectionBadge: string,
    title: string
  ) => {
    slide.background = { color: COLOR_LIGHT_BG };

    // Top bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 10,
      h: 0.95,
      fill: { color: COLOR_DARK },
    });

    // Badge
    slide.addText(sectionBadge.toUpperCase(), {
      x: 0.6,
      y: 0.14,
      w: 6,
      h: 0.24,
      fontSize: 9,
      bold: true,
      color: COLOR_ACCENT,
      fontFace: "Arial",
    });

    // Title
    slide.addText(title, {
      x: 0.6,
      y: 0.36,
      w: 8.2,
      h: 0.45,
      fontSize: 18,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
    });

    // Slide Number Pill
    slide.addText(`${slideNumber} / ${String(totalSlides).padStart(2, "0")}`, {
      x: 8.7,
      y: 0.28,
      w: 0.8,
      h: 0.35,
      fontSize: 10,
      bold: true,
      align: "center",
      color: "E0E7FF",
      fontFace: "Arial",
    });

    // Footer
    slide.addText(
      `Sidang Laporan ${programName} • ${student.namaMahasiswa} (${student.nim})`,
      {
        x: 0.6,
        y: 5.25,
        w: 8.8,
        h: 0.25,
        fontSize: 8.5,
        color: COLOR_TEXT_MUTED,
        fontFace: "Arial",
      }
    );
  };

  // =========================================================================
  // SLIDE 1: SLIDE JUDUL (COVER SIDANG AKHIR)
  // =========================================================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: COLOR_DARK };

  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.35,
    h: 5.625,
    fill: { color: COLOR_PRIMARY },
  });

  slide1.addText(`PRESENTASI SIDANG AKHIR • ${programName.toUpperCase()}`, {
    x: 0.8,
    y: 0.9,
    w: 7.2,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: COLOR_ACCENT,
    fontFace: "Arial",
  });

  if (student.logoKampusBase64) {
    try {
      slide1.addImage({
        data: normalizeBase64DataUrl(
          student.logoKampusBase64,
          student.logoKampusMimeType || "image/png"
        ),
        x: 8.2,
        y: 0.7,
        w: 1.1,
        h: 1.1,
      });
    } catch (err) {
      console.error("Gagal menyematkan logo kampus ke PowerPoint:", err);
    }
  }

  slide1.addText(
    `Laporan Pelaksanaan & Capaian Kompetensi\nsebagai ${roleName}`,
    {
      x: 0.8,
      y: 1.35,
      w: 8.5,
      h: 1.35,
      fontSize: 26,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
      valign: "top",
    }
  );

  slide1.addText(`Mitra Kegiatan: ${student.namaMitra}`, {
    x: 0.8,
    y: 2.8,
    w: 8.5,
    h: 0.4,
    fontSize: 14,
    italic: true,
    color: "C7D2FE",
    fontFace: "Arial",
  });

  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.55,
    w: 8.4,
    h: 1.45,
    fill: { color: "312E81" },
    line: { color: "4F46E5", width: 1 },
    rectRadius: 0.08,
  });

  slide1.addText(
    [
      {
        text: `${student.namaMahasiswa}  |  NIM: ${student.nim}\n`,
        options: { bold: true, fontSize: 14, color: "FFFFFF" },
      },
      {
        text: `${student.programStudi} — ${student.perguruanTinggi}\n`,
        options: { fontSize: 11, color: "E0E7FF" },
      },
      {
        text: `Pembimbing / Mentor: ${student.namaPembimbing} (${student.periodeKegiatan})`,
        options: { fontSize: 10.5, color: "A5B4FC" },
      },
    ],
    {
      x: 1.05,
      y: 3.72,
      w: 7.9,
      h: 1.15,
      fontFace: "Arial",
      lineSpacingMultiple: 1.3,
    }
  );

  // =========================================================================
  // SLIDE 2: PROFIL KEGIATAN & RUANG LINGKUP PERAN
  // =========================================================================
  const slide2 = pptx.addSlide();
  addHeaderBanner(
    slide2,
    "02",
    "Bagian 1 • Konteks Program",
    "Profil Kegiatan & Ruang Lingkup Peran"
  );

  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.25,
    w: 4.25,
    h: 3.75,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    rectRadius: 0.06,
  });

  slide2.addText("Identitas Pelaksanaan", {
    x: 0.85,
    y: 1.45,
    w: 3.75,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: "Arial",
  });

  slide2.addText(
    [
      { text: "Skema Program:\n", options: { bold: true, color: COLOR_TEXT_MAIN } },
      { text: `${programName}\n\n`, options: { color: COLOR_TEXT_MUTED } },
      { text: "Posisi / Peran Mahasiswa:\n", options: { bold: true, color: COLOR_TEXT_MAIN } },
      { text: `${roleName}\n\n`, options: { color: COLOR_TEXT_MUTED } },
      { text: "Mitra / Lokasi Pelaksanaan:\n", options: { bold: true, color: COLOR_TEXT_MAIN } },
      { text: `${student.namaMitra}\n\n`, options: { color: COLOR_TEXT_MUTED } },
      { text: "Periode Akademik:\n", options: { bold: true, color: COLOR_TEXT_MAIN } },
      { text: `${student.periodeKegiatan}`, options: { color: COLOR_TEXT_MUTED } },
    ],
    {
      x: 0.85,
      y: 1.9,
      w: 3.75,
      h: 2.9,
      fontSize: 11,
      fontFace: "Arial",
      valign: "top",
    }
  );

  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 5.15,
    y: 1.25,
    w: 4.25,
    h: 3.75,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    rectRadius: 0.06,
  });

  slide2.addText("Fokus & Tanggung Jawab Utama", {
    x: 5.4,
    y: 1.45,
    w: 3.75,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: COLOR_PRIMARY,
    fontFace: "Arial",
  });

  slide2.addText(truncateText(primary?.deskripsiKegiatan || "", 460), {
    x: 5.4,
    y: 1.95,
    w: 3.75,
    h: 2.8,
    fontSize: 11,
    color: COLOR_TEXT_MAIN,
    fontFace: "Arial",
    valign: "top",
    lineSpacingMultiple: 1.25,
  });

  // =========================================================================
  // SLIDE 3: MILESTONE PROGRES & DESKRIPSI KEGIATAN
  // =========================================================================
  const slide3 = pptx.addSlide();
  addHeaderBanner(
    slide3,
    "03",
    "Bagian 2 • Eksekusi Operasional (Taksonomi Bloom C3–C4)",
    "Milestone Progres & Deskripsi Kegiatan"
  );

  const milestoneEntries = entries.slice(0, 3);
  milestoneEntries.forEach((item, index) => {
    const yPos = 1.22 + index * 1.28;

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: yPos,
      w: 8.8,
      h: 1.14,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.05,
    });

    slide3.addShape(pptx.ShapeType.roundRect, {
      x: 0.78,
      y: yPos + 0.18,
      w: 0.75,
      h: 0.75,
      fill: { color: COLOR_PRIMARY },
      rectRadius: 0.05,
    });

    slide3.addText(`M-${index + 1}`, {
      x: 0.78,
      y: yPos + 0.18,
      w: 0.75,
      h: 0.75,
      fontSize: 13,
      bold: true,
      color: "FFFFFF",
      align: "center",
      valign: "middle",
      fontFace: "Arial",
    });

    slide3.addText(
      `${item.tanggal} — ${item.peran}${
        item.tahapFase ? ` [${item.tahapFase}]` : ""
      }`,
      {
        x: 1.7,
        y: yPos + 0.12,
        w: 7.4,
        h: 0.28,
        fontSize: 11,
        bold: true,
        color: COLOR_DARK,
        fontFace: "Arial",
      }
    );

    slide3.addText(truncateText(item.deskripsiKegiatan, 260), {
      x: 1.7,
      y: yPos + 0.4,
      w: 7.4,
      h: 0.65,
      fontSize: 10,
      color: COLOR_TEXT_MUTED,
      fontFace: "Arial",
      valign: "top",
    });
  });

  // =========================================================================
  // SLIDE OPSIONAL (JIKA ADA FOTO): DOKUMENTASI KEGIATAN & BUKTI VISUAL
  // =========================================================================
  if (photoEntry && photoEntry.fotoBase64) {
    const slidePhoto = pptx.addSlide();
    addHeaderBanner(
      slidePhoto,
      "04",
      "Lampiran Visual • Bukti Pelaksanaan",
      "Dokumentasi & Bukti Visual Kegiatan"
    );

    // Wadah Foto Kiri
    slidePhoto.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.25,
      w: 4.8,
      h: 3.75,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.06,
    });

    try {
      slidePhoto.addImage({
        data: normalizeBase64DataUrl(
          photoEntry.fotoBase64,
          photoEntry.fotoMimeType || "image/jpeg"
        ),
        x: 0.8,
        y: 1.45,
        w: 4.4,
        h: 3.1,
      });

      slidePhoto.addText(
        `Dokumentasi Kegiatan: ${photoEntry.tanggal} (${photoEntry.peran})`,
        {
          x: 0.8,
          y: 4.6,
          w: 4.4,
          h: 0.3,
          fontSize: 9.5,
          italic: true,
          align: "center",
          color: COLOR_TEXT_MUTED,
          fontFace: "Arial",
        }
      );
    } catch (err) {
      console.error("Gagal menyematkan foto ke PowerPoint:", err);
    }

    // Uraian Kanan
    slidePhoto.addShape(pptx.ShapeType.roundRect, {
      x: 5.65,
      y: 1.25,
      w: 3.75,
      h: 3.75,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.06,
    });

    slidePhoto.addText("Verifikasi Visual Pekerjaan", {
      x: 5.9,
      y: 1.45,
      w: 3.25,
      h: 0.35,
      fontSize: 13,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: "Arial",
    });

    slidePhoto.addText(
      [
        {
          text: "Deskripsi Terkait Visual:\n",
          options: { bold: true, color: COLOR_TEXT_MAIN },
        },
        {
          text: `${truncateText(photoEntry.deskripsiKegiatan, 280)}\n\n`,
          options: { color: COLOR_TEXT_MUTED },
        },
        {
          text: "Kompetensi Teraplikasi:\n",
          options: { bold: true, color: COLOR_TEXT_MAIN },
        },
        {
          text: `${truncateText(photoEntry.kompetensiDikembangkan, 220)}`,
          options: { color: COLOR_TEXT_MUTED },
        },
      ],
      {
        x: 5.9,
        y: 1.9,
        w: 3.25,
        h: 2.9,
        fontSize: 10.5,
        fontFace: "Arial",
        valign: "top",
        lineSpacingMultiple: 1.2,
      }
    );
  }

  // =========================================================================
  // SLIDE: ANALISIS KENDALA & SOLUSI (PROBLEM SOLVING)
  // =========================================================================
  const slideKendala = pptx.addSlide();
  addHeaderBanner(
    slideKendala,
    photoEntry ? "05" : "04",
    "Bagian 3 • Evaluasi & Problem Solving (Taksonomi Bloom C4–C6)",
    "Analisis Kendala & Tindakan Solutif"
  );

  slideKendala.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.25,
    w: 4.25,
    h: 3.75,
    fill: { color: "FFFBEB" },
    line: { color: "FCD34D", width: 1.2 },
    rectRadius: 0.06,
  });

  slideKendala.addText("Kendala yang Dihadapi (C4)", {
    x: 0.85,
    y: 1.45,
    w: 3.75,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: "B45309",
    fontFace: "Arial",
  });

  slideKendala.addText(truncateText(primary?.kendalaDihadapi || "", 450), {
    x: 0.85,
    y: 1.9,
    w: 3.75,
    h: 2.9,
    fontSize: 11,
    color: COLOR_TEXT_MAIN,
    fontFace: "Arial",
    valign: "top",
    lineSpacingMultiple: 1.25,
  });

  slideKendala.addShape(pptx.ShapeType.roundRect, {
    x: 5.15,
    y: 1.25,
    w: 4.25,
    h: 3.75,
    fill: { color: "ECFDF5" },
    line: { color: "6EE7B7", width: 1.2 },
    rectRadius: 0.06,
  });

  slideKendala.addText("Solusi & Tindakan Mitigasi (C5–C6)", {
    x: 5.4,
    y: 1.45,
    w: 3.75,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: COLOR_EMERALD,
    fontFace: "Arial",
  });

  slideKendala.addText(truncateText(primary?.solusiTindakan || "", 450), {
    x: 5.4,
    y: 1.9,
    w: 3.75,
    h: 2.9,
    fontSize: 11,
    color: COLOR_TEXT_MAIN,
    fontFace: "Arial",
    valign: "top",
    lineSpacingMultiple: 1.25,
  });

  // =========================================================================
  // SLIDE: CAPAIAN KOMPETENSI (HARD SKILLS & SOFT SKILLS)
  // =========================================================================
  const slideKompetensi = pptx.addSlide();
  addHeaderBanner(
    slideKompetensi,
    photoEntry ? "06" : "05",
    "Bagian 4 • Capaian Pembelajaran Lulusan (CPL)",
    "Capaian Kompetensi yang Dikembangkan"
  );

  slideKompetensi.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.25,
    w: 8.8,
    h: 3.75,
    fill: { color: COLOR_CARD_BG },
    line: { color: COLOR_BORDER, width: 1 },
    rectRadius: 0.06,
  });

  slideKompetensi.addText(
    "Integrasi Kompetensi Teknis (Hard Skills) & Non-Teknis (Soft Skills)",
    {
      x: 0.9,
      y: 1.5,
      w: 8.2,
      h: 0.35,
      fontSize: 13.5,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: "Arial",
    }
  );

  slideKompetensi.addText(truncateText(primary?.kompetensiDikembangkan || "", 650), {
    x: 0.9,
    y: 2.0,
    w: 8.2,
    h: 2.75,
    fontSize: 12,
    color: COLOR_TEXT_MAIN,
    fontFace: "Arial",
    valign: "top",
    lineSpacingMultiple: 1.3,
  });

  // =========================================================================
  // SLIDE: REFLEKSI PEMBELAJARAN & DAMPAK KONTRIBUSI
  // =========================================================================
  const slideRefleksi = pptx.addSlide();
  addHeaderBanner(
    slideRefleksi,
    photoEntry ? "07" : "06",
    "Bagian 5 • Evaluasi Diri & Keberlanjutan (Meaningful Learning)",
    "Refleksi Pembelajaran & Rencana Tindak Lanjut"
  );

  slideRefleksi.addShape(pptx.ShapeType.roundRect, {
    x: 0.6,
    y: 1.25,
    w: 8.8,
    h: 3.75,
    fill: { color: COLOR_CARD_BG },
    line: { color: "C4B5FD", width: 1.2 },
    rectRadius: 0.06,
  });

  slideRefleksi.addText("Sintesis Pembelajaran & Evaluasi Kinerja Mahasiswa", {
    x: 0.9,
    y: 1.5,
    w: 8.2,
    h: 0.35,
    fontSize: 13.5,
    bold: true,
    color: "6D28D9",
    fontFace: "Arial",
  });

  slideRefleksi.addText(truncateText(primary?.refleksiPembelajaran || "", 650), {
    x: 0.9,
    y: 2.0,
    w: 8.2,
    h: 2.75,
    fontSize: 12,
    color: COLOR_TEXT_MAIN,
    fontFace: "Arial",
    valign: "top",
    lineSpacingMultiple: 1.3,
  });

  // =========================================================================
  // SLIDE OPSIONAL: EVALUASI & PENILAIAN MENTOR INDUSTRI
  // =========================================================================
  if (mentorAdminData && mentorAdminData.scores && mentorAdminData.scores.length > 0) {
    const totalWeighted = Math.round(
      mentorAdminData.scores.reduce((acc, curr) => acc + (curr.nilai * curr.bobot) / 100, 0) * 10
    ) / 10;
    const mentorName = mentorAdminData.namaMentor || student.namaPembimbing || "Mentor Mitra";
    const mentorRole = mentorAdminData.jabatanMentor || "Supervisor Industri";

    const slideMentor = pptx.addSlide();
    slideMentor.background = { color: COLOR_LIGHT_BG };
    addHeaderBanner(slideMentor, "07", "EVALUASI MENTOR", "Penilaian Kinerja oleh Pembimbing Lapangan");

    // Kartu Skor Terbobot
    slideMentor.addShape(pptx.ShapeType.roundRect, {
      x: 0.8,
      y: 1.5,
      w: 3.8,
      h: 3.5,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.08,
    });

    slideMentor.addText("PREDIKAT KINERJA MENTOR", {
      x: 1.0,
      y: 1.7,
      w: 3.4,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: "Arial",
    });

    slideMentor.addText(`${totalWeighted} / 100`, {
      x: 1.0,
      y: 2.05,
      w: 3.4,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: COLOR_EMERALD,
      fontFace: "Arial",
    });

    slideMentor.addText(`Predikat: ${mentorAdminData.predikat || (totalWeighted >= 85 ? "Sangat Memuaskan (A)" : "Memuaskan (B)")}`, {
      x: 1.0,
      y: 2.7,
      w: 3.4,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: COLOR_TEXT_MAIN,
      fontFace: "Arial",
    });

    slideMentor.addText(
      `Mentor: ${mentorName}\nJabatan: ${mentorRole}\nMitra: ${student.namaMitra}`,
      {
        x: 1.0,
        y: 3.1,
        w: 3.4,
        h: 0.75,
        fontSize: 10,
        color: COLOR_TEXT_MUTED,
        fontFace: "Arial",
        lineSpacingMultiple: 1.2,
      }
    );

    slideMentor.addText(
      `"${truncateText(mentorAdminData.catatanEvaluasi || "Mahasiswa menunjukkan performa profesional dan dedikasi luar biasa.", 140)}"`,
      {
        x: 1.0,
        y: 3.9,
        w: 3.4,
        h: 0.9,
        fontSize: 9.5,
        italic: true,
        color: COLOR_TEXT_MUTED,
        fontFace: "Arial",
        lineSpacingMultiple: 1.2,
      }
    );

    // Kartu Rubrik 5 Aspek
    slideMentor.addShape(pptx.ShapeType.roundRect, {
      x: 4.8,
      y: 1.5,
      w: 4.4,
      h: 3.5,
      fill: { color: COLOR_CARD_BG },
      line: { color: COLOR_BORDER, width: 1 },
      rectRadius: 0.08,
    });

    slideMentor.addText("RINCIAN 5 ASPEK PENILAIAN", {
      x: 5.0,
      y: 1.7,
      w: 4.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: COLOR_PRIMARY,
      fontFace: "Arial",
    });

    const rubricLines = mentorAdminData.scores.map(
      (sc, idx) => `${idx + 1}. ${truncateText(sc.aspek, 36)} (${sc.bobot}%): ${sc.nilai}/100`
    ).join("\n\n");

    slideMentor.addText(rubricLines, {
      x: 5.0,
      y: 2.1,
      w: 4.0,
      h: 2.7,
      fontSize: 10,
      color: COLOR_TEXT_MAIN,
      fontFace: "Arial",
      lineSpacingMultiple: 1.2,
    });
  }

  // =========================================================================
  // SLIDE PENUTUP: TERIMA KASIH
  // =========================================================================
  const slidePenutup = pptx.addSlide();
  slidePenutup.background = { color: COLOR_DARK };

  slidePenutup.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.35,
    h: 5.625,
    fill: { color: COLOR_ACCENT },
  });

  slidePenutup.addText(
    `SLIDE ${String(totalSlides).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")} • PENUTUP SIDANG`,
    {
      x: 0.9,
      y: 1.2,
      w: 8.2,
      h: 0.3,
      fontSize: 11,
      bold: true,
      color: COLOR_ACCENT,
      fontFace: "Arial",
    }
  );

  slidePenutup.addText("Terima Kasih", {
    x: 0.9,
    y: 1.65,
    w: 8.2,
    h: 0.9,
    fontSize: 36,
    bold: true,
    color: "FFFFFF",
    fontFace: "Arial",
  });

  slidePenutup.addText(
    "Apresiasi setinggi-tingginya kepada Dosen Pembimbing, Penguji, serta jajaran Mitra atas bimbingan dan kesempatan pembelajaran selama pelaksanaan program.",
    {
      x: 0.9,
      y: 2.65,
      w: 7.8,
      h: 0.85,
      fontSize: 13,
      color: "E0E7FF",
      fontFace: "Arial",
      lineSpacingMultiple: 1.3,
    }
  );

  slidePenutup.addShape(pptx.ShapeType.roundRect, {
    x: 0.9,
    y: 3.75,
    w: 8.2,
    h: 1.1,
    fill: { color: "312E81" },
    line: { color: "4F46E5", width: 1 },
    rectRadius: 0.06,
  });

  slidePenutup.addText(
    `Sesi Diskusi & Tanya Jawab\n${student.namaMahasiswa} (${student.nim}) • ${roleName} — ${programName}`,
    {
      x: 1.15,
      y: 3.92,
      w: 7.7,
      h: 0.75,
      fontSize: 12,
      bold: true,
      color: "FFFFFF",
      fontFace: "Arial",
      lineSpacingMultiple: 1.3,
    }
  );

  const safeProgram = programName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStamp = new Date().toISOString().slice(0, 10);
  await pptx.writeFile({
    fileName: `Slide_Sidang_${safeProgram}_${dateStamp}.pptx`,
  });
}
