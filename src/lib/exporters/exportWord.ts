import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  PageBreak,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import {
  LogbookEntry,
  StudentProfile,
  DEFAULT_STUDENT_PROFILE,
  KampusPreset,
} from "./types";
import { MentorAdminData } from "./exportAdminDocs";

const FONT_FAMILY = "Times New Roman";
const SIZE_12PT = 24; // 24 half-points = 12pt
const SIZE_14PT = 28; // 14pt
const SIZE_16PT = 32; // 16pt
const LINE_SPACING_1_5 = 360; // 240 * 1.5 = 360 twips

function createAcademicParagraph(
  text: string,
  options?: {
    bold?: boolean;
    italics?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    after?: number;
    before?: number;
  }
): Paragraph {
  return new Paragraph({
    alignment: options?.alignment ?? AlignmentType.JUSTIFIED,
    spacing: {
      line: LINE_SPACING_1_5,
      before: options?.before ?? 0,
      after: options?.after ?? 120,
    },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: options?.size ?? SIZE_12PT,
        bold: options?.bold ?? false,
        italics: options?.italics ?? false,
      }),
    ],
  });
}

function createImageParagraph(base64Data: string, width = 140, height = 95): Paragraph | null {
  try {
    const isPng = base64Data.includes("image/png");
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const binaryString =
      typeof atob !== "undefined"
        ? atob(cleanBase64)
        : Buffer.from(cleanBase64, "base64").toString("binary");
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_SPACING_1_5, before: 120, after: 120 },
      children: [
        new ImageRun({
          data: bytes,
          type: isPng ? "png" : "jpg",
          transformation: {
            width,
            height,
          },
        }),
      ],
    });
  } catch (err) {
    console.error("Gagal memproses gambar untuk Word:", err);
    return null;
  }
}

function createBioRow(label: string, value: string): TableRow {
  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: "FFFFFF",
  };

  return new TableRow({
    children: [
      new TableCell({
        width: { size: 32, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder,
          bottom: noBorder,
          left: noBorder,
          right: noBorder,
        },
        children: [
          createAcademicParagraph(label, {
            bold: true,
            alignment: AlignmentType.LEFT,
            after: 60,
          }),
        ],
      }),
      new TableCell({
        width: { size: 3, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder,
          bottom: noBorder,
          left: noBorder,
          right: noBorder,
        },
        children: [
          createAcademicParagraph(":", {
            bold: true,
            alignment: AlignmentType.CENTER,
            after: 60,
          }),
        ],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder,
          bottom: noBorder,
          left: noBorder,
          right: noBorder,
        },
        children: [
          createAcademicParagraph(value, {
            alignment: AlignmentType.LEFT,
            after: 60,
          }),
        ],
      }),
    ],
  });
}

export async function exportLogbookToWord(
  entries: LogbookEntry[],
  profile: Partial<StudentProfile> = {},
  selectedPreset?: KampusPreset,
  mentorAdminData?: Partial<MentorAdminData>
): Promise<void> {
  const student: StudentProfile = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const preset: KampusPreset = selectedPreset || student.kampusPreset || "dikti";
  const primaryEntry = entries[0];
  const programName = primaryEntry?.tipeKegiatan || "Magang MBKM";
  const roleName = primaryEntry?.peran || "Mahasiswa Peserta Program";

  // Margin Twips Calculation: 1 cm ≈ 567 twips
  // Standar Dikti: Atas 4 cm (2268), Kiri 4 cm (2268), Bawah 3 cm (1701), Kanan 3 cm (1701)
  // Standar ITS: Atas 3 cm (1701), Kiri 4 cm (2268), Bawah 3 cm (1701), Kanan 3 cm (1701)
  // Standar UI/UGM/IPB: Atas 2.54 cm (1440), Kiri 3 cm (1701), Bawah 2.54 cm (1440), Kanan 2.54 cm (1440)
  const pageMargins =
    preset === "dikti"
      ? { top: 2268, left: 2268, bottom: 1701, right: 1701 }
      : preset === "its"
      ? { top: 1701, left: 2268, bottom: 1701, right: 1701 }
      : { top: 1440, left: 1701, bottom: 1440, right: 1440 };

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "94A3B8",
  };

  const headerBgColor =
    preset === "its" ? "003366" : preset === "ui_ugm_ipb" ? "0F766E" : "1E1B4B";

  // Tabel Logbook Harian Formal
  const logbookTableHeader = new TableRow({
    tableHeader: true,
    children: [
      { title: "No", width: 5 },
      { title: "Tanggal & Peran", width: 15 },
      { title: "Deskripsi & Dokumentasi", width: 28 },
      { title: "Kompetensi", width: 18 },
      { title: "Kendala & Solusi", width: 18 },
      { title: "Refleksi", width: 16 },
    ].map(
      (col) =>
        new TableCell({
          width: { size: col.width, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          shading: {
            fill: headerBgColor,
            type: ShadingType.CLEAR,
            color: "auto",
          },
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { line: LINE_SPACING_1_5, before: 80, after: 80 },
              children: [
                new TextRun({
                  text: col.title,
                  font: FONT_FAMILY,
                  size: SIZE_12PT,
                  bold: true,
                  color: "FFFFFF",
                }),
              ],
            }),
          ],
        })
    ),
  });

  const logbookTableRows = entries.map((entry, idx) => {
    const descChildren: Paragraph[] = [
      createAcademicParagraph(entry.deskripsiKegiatan, {
        alignment: AlignmentType.LEFT,
        after: entry.fotoBase64 ? 60 : 120,
      }),
    ];

    if (entry.fotoBase64) {
      const imgP = createImageParagraph(entry.fotoBase64, 130, 85);
      if (imgP) {
        descChildren.push(imgP);
        descChildren.push(
          createAcademicParagraph("[Bukti Dokumentasi Kegiatan]", {
            italics: true,
            size: 20, // 10pt
            alignment: AlignmentType.CENTER,
            after: 60,
          })
        );
      }
    }

    return new TableRow({
      children: [
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createAcademicParagraph(String(idx + 1), {
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createAcademicParagraph(entry.tanggal, {
              bold: true,
              alignment: AlignmentType.LEFT,
              after: 40,
            }),
            createAcademicParagraph(`(${entry.peran})`, {
              italics: true,
              alignment: AlignmentType.LEFT,
              after: entry.tahapFase ? 40 : 60,
            }),
            ...(entry.tahapFase
              ? [
                  createAcademicParagraph(`[${entry.tahapFase}]`, {
                    bold: true,
                    size: 20,
                    alignment: AlignmentType.LEFT,
                    after: 60,
                  }),
                ]
              : []),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: descChildren,
        }),
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createAcademicParagraph(entry.kompetensiDikembangkan, {
              alignment: AlignmentType.LEFT,
            }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createAcademicParagraph(`Kendala: ${entry.kendalaDihadapi}`, {
              alignment: AlignmentType.LEFT,
              after: 80,
            }),
            createAcademicParagraph(`Solusi: ${entry.solusiTindakan}`, {
              alignment: AlignmentType.LEFT,
            }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.TOP,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createAcademicParagraph(entry.refleksiPembelajaran, {
              alignment: AlignmentType.LEFT,
            }),
          ],
        }),
      ],
    });
  });

  // Uraian Rinci
  const detailedNarrativeParagraphs: Paragraph[] = [];
  entries.forEach((entry, index) => {
    detailedNarrativeParagraphs.push(
      createAcademicParagraph(
        `Catatan Kegiatan #${index + 1} — ${entry.tanggal} (${entry.peran})`,
        {
          bold: true,
          before: 200,
          after: 80,
          alignment: AlignmentType.LEFT,
        }
      ),
      createAcademicParagraph(
        `1. Deskripsi Kegiatan: ${entry.deskripsiKegiatan}`,
        { after: 80 }
      )
    );

    if (entry.fotoBase64) {
      const imgP = createImageParagraph(entry.fotoBase64, 250, 160);
      if (imgP) {
        detailedNarrativeParagraphs.push(imgP);
        detailedNarrativeParagraphs.push(
          createAcademicParagraph(
            `Gambar 1.${index + 1}: Bukti Pelaksanaan Aktivitas (${entry.tanggal})`,
            {
              italics: true,
              size: 20,
              alignment: AlignmentType.CENTER,
              after: 100,
            }
          )
        );
      }
    }

    detailedNarrativeParagraphs.push(
      createAcademicParagraph(
        `2. Kompetensi yang Dikembangkan: ${entry.kompetensiDikembangkan}`,
        { after: 80 }
      ),
      createAcademicParagraph(
        `3. Kendala yang Dihadapi: ${entry.kendalaDihadapi}`,
        { after: 80 }
      ),
      createAcademicParagraph(`4. Solusi & Tindakan: ${entry.solusiTindakan}`, {
        after: 80,
      }),
      createAcademicParagraph(
        `5. Refleksi Pembelajaran: ${entry.refleksiPembelajaran}`,
        { after: 160 }
      )
    );
  });

  // Logo Kampus jika ada
  let logoParagraph: Paragraph | null = null;
  if (student.logoKampusBase64) {
    logoParagraph = createImageParagraph(student.logoKampusBase64, 110, 110);
  }

  // Cover Judul berdasarkan Preset
  const coverTitle =
    preset === "its"
      ? "BUKU LAPORAN KERJA PRAKTIK (KP)"
      : preset === "ui_ugm_ipb"
      ? "EXECUTIVE SUMMARY & LOGBOOK MAGANG"
      : "LAPORAN KEGIATAN HARIAN (LOGBOOK)";

  // Subtitle Cover
  const coverSubtitle =
    preset === "its"
      ? `DEPARTEMEN / PROGRAM STUDI ${student.programStudi.toUpperCase()}`
      : `PROGRAM ${programName.toUpperCase()}`;

  // Konstruksi Halaman Dokumen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docChildren: any[] = [
    // ==================== COVER LAPORAN ====================
    createAcademicParagraph(coverTitle, {
      bold: true,
      size: SIZE_16PT,
      alignment: AlignmentType.CENTER,
      before: 300,
      after: 100,
    }),
    createAcademicParagraph(coverSubtitle, {
      bold: true,
      size: SIZE_14PT,
      alignment: AlignmentType.CENTER,
      after: 240,
    }),
    createAcademicParagraph(`Peran / Posisi: ${roleName}`, {
      bold: true,
      size: SIZE_12PT,
      alignment: AlignmentType.CENTER,
      after: 60,
    }),
    createAcademicParagraph(`Mitra / Lokasi: ${student.namaMitra}`, {
      italics: true,
      size: SIZE_12PT,
      alignment: AlignmentType.CENTER,
      after: logoParagraph ? 240 : 700,
    }),
  ];

  if (logoParagraph) {
    docChildren.push(logoParagraph);
  }

  docChildren.push(
    createAcademicParagraph("Disusun Oleh:", {
      alignment: AlignmentType.CENTER,
      before: logoParagraph ? 240 : 400,
      after: 100,
    }),
    createAcademicParagraph(student.namaMahasiswa, {
      bold: true,
      size: SIZE_14PT,
      alignment: AlignmentType.CENTER,
      after: 40,
    }),
    createAcademicParagraph(`NIM: ${student.nim}`, {
      bold: true,
      size: SIZE_12PT,
      alignment: AlignmentType.CENTER,
      after: 800,
    }),
    createAcademicParagraph(student.programStudi.toUpperCase(), {
      bold: true,
      size: SIZE_14PT,
      alignment: AlignmentType.CENTER,
      after: 60,
    }),
    createAcademicParagraph(student.perguruanTinggi.toUpperCase(), {
      bold: true,
      size: SIZE_14PT,
      alignment: AlignmentType.CENTER,
      after: 60,
    }),
    createAcademicParagraph(student.periodeKegiatan.toUpperCase(), {
      bold: true,
      size: SIZE_12PT,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ==================== LEMBAR PENGESAHAN PRESET ITS / POLITEKNIK ====================
  if (preset === "its") {
    docChildren.push(
      createAcademicParagraph("LEMBAR PENGESAHAN LAPORAN KERJA PRAKTIK", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.CENTER,
        before: 200,
        after: 300,
      }),
      createAcademicParagraph(
        `Laporan Kerja Praktik dengan judul pelaksanaan kegiatan di ${student.namaMitra} ini telah diperiksa, disetujui, dan disahkan oleh Dosen Pembimbing Kerja Praktik dan Pembimbing Lapangan.`,
        { after: 360 }
      ),
      // Tabel Tanda Tangan Ganda
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  createAcademicParagraph("Menyetujui,", { alignment: AlignmentType.CENTER, after: 40 }),
                  createAcademicParagraph("Dosen Pembimbing KP,", { bold: true, alignment: AlignmentType.CENTER, after: 850 }),
                  createAcademicParagraph(`(${student.namaPembimbing})`, { bold: true, alignment: AlignmentType.CENTER }),
                  createAcademicParagraph("NIP. ___________________", { italics: true, size: 20, alignment: AlignmentType.CENTER }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                },
                children: [
                  createAcademicParagraph("Menyetujui,", { alignment: AlignmentType.CENTER, after: 40 }),
                  createAcademicParagraph("Pembimbing Lapangan / Mentor Mitra,", { bold: true, alignment: AlignmentType.CENTER, after: 850 }),
                  createAcademicParagraph(`( Mentor ${student.namaMitra} )`, { bold: true, alignment: AlignmentType.CENTER }),
                  createAcademicParagraph("NIP / ID. _______________", { italics: true, size: 20, alignment: AlignmentType.CENTER }),
                ],
              }),
            ],
          }),
        ],
      }),
      createAcademicParagraph("Mengetahui,", { alignment: AlignmentType.CENTER, before: 600, after: 40 }),
      createAcademicParagraph("Koordinator Kerja Praktik / Ketua Departemen", {
        bold: true,
        alignment: AlignmentType.CENTER,
        after: 800,
      }),
      createAcademicParagraph("( ____________________________________ )", {
        bold: true,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // ==================== STRUKTUR BAB ====================
  if (preset === "its") {
    // FORMAT BUKU KP ITS: Bab I - Bab V
    docChildren.push(
      // BAB I
      createAcademicParagraph("BAB I: PENDAHULUAN & PROFIL INSTANSI", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        after: 160,
      }),
      createAcademicParagraph(
        `Kerja Praktik dilaksanakan di ${student.namaMitra} sebagai bagian dari pemenuhan kurikulum akademik program studi ${student.programStudi}, ${student.perguruanTinggi}. Mahasiswa berperan aktif sebagai ${roleName} pada periode ${student.periodeKegiatan}.`,
        { after: 200 }
      ),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createBioRow("Nama Mahasiswa", student.namaMahasiswa),
          createBioRow("NIM", student.nim),
          createBioRow("Departemen / Prodi", student.programStudi),
          createBioRow("Perguruan Tinggi", student.perguruanTinggi),
          createBioRow("Perusahaan / Mitra", student.namaMitra),
          createBioRow("Dosen Pembimbing", student.namaPembimbing),
        ],
      }),
      // BAB II
      createAcademicParagraph("BAB II: LINGKUP PENUGASAN & RENCANA KERJA", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        before: 300,
        after: 160,
      }),
      createAcademicParagraph(
        `Lingkup penugasan difokuskan pada perancangan, eksekusi teknis, dan verifikasi alur kerja operasional. Mahasiswa mengintegrasikan kompetensi teoritis perkuliahan dengan praktik standar industri di lapangan.`,
        { after: 240 }
      ),
      // BAB III
      createAcademicParagraph("BAB III: REKAPITULASI BUKU HARIAN KERJA PRAKTIK (LOGBOOK)", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        before: 300,
        after: 160,
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [logbookTableHeader, ...logbookTableRows],
      }),
      // BAB IV
      createAcademicParagraph("BAB IV: ANALISIS MASALAH, PROBLEM SOLVING & CAPAIAN", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        before: 360,
        after: 160,
      }),
      ...detailedNarrativeParagraphs,
      // BAB V
      createAcademicParagraph("BAB V: KESIMPULAN & REKOMENDASI PEMBELAJARAN", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        before: 360,
        after: 160,
      }),
      createAcademicParagraph(
        `Berdasarkan pelaksanaan Kerja Praktik yang telah diselesaikan, disimpulkan bahwa target penugasan operasional telah tercapai dengan baik. Mahasiswa berhasil mengasah kemampuan problem solving, adaptasi budaya kerja profesional, dan penguasaan perkakas teknis secara menyeluruh.`,
        { after: 200 }
      )
    );
  } else if (preset === "ui_ugm_ipb") {
    // FORMAT EKSEKUTIF UI / UGM / IPB
    docChildren.push(
      createAcademicParagraph("EXECUTIVE SUMMARY (RINGKASAN EKSEKUTIF)", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        after: 140,
      }),
      createAcademicParagraph(
        `Laporan ini merangkum ketercapaian program ${programName} oleh ${student.namaMahasiswa} (${student.nim}) di ${student.namaMitra}. Program ini dirancang untuk mengonversi hingga 20 SKS melalui pemenuhan Capaian Pembelajaran Lulusan (CPL) berbasis Taksonomi Bloom ranah C3–C6.`,
        { after: 200 }
      ),
      createAcademicParagraph("MATRIKS IDENTITAS MAHASISWA & MITRA", {
        bold: true,
        size: SIZE_12PT,
        alignment: AlignmentType.LEFT,
        after: 120,
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createBioRow("Nama Mahasiswa", student.namaMahasiswa),
          createBioRow("NIM", student.nim),
          createBioRow("Program Studi", student.programStudi),
          createBioRow("Mitra Kolaborasi", student.namaMitra),
          createBioRow("Pembimbing Akademik", student.namaPembimbing),
        ],
      }),
      createAcademicParagraph("TABEL LOGBOOK HARIAN & MATRIKS CAPAIAN KOMPETENSI", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        before: 300,
        after: 160,
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [logbookTableHeader, ...logbookTableRows],
      }),
      createAcademicParagraph("DOKUMENTASI CAPAIAN & ANALISIS REFLEKSI BERKALA", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        before: 360,
        after: 160,
      }),
      ...detailedNarrativeParagraphs
    );
  } else {
    // STANDAR NASIONAL DIKTI / UMUM
    docChildren.push(
      createAcademicParagraph("I. IDENTITAS MAHASISWA & MITRA KEGIATAN", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.LEFT,
        after: 200,
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          createBioRow("Nama Mahasiswa", student.namaMahasiswa),
          createBioRow("Nomor Induk Mahasiswa (NIM)", student.nim),
          createBioRow("Program Studi", student.programStudi),
          createBioRow("Perguruan Tinggi", student.perguruanTinggi),
          createBioRow("Jenis Program", programName),
          createBioRow("Peran / Posisi", roleName),
          createBioRow("Instansi / Mitra Kegiatan", student.namaMitra),
          createBioRow("Dosen Pembimbing / Mentor", student.namaPembimbing),
          createBioRow("Periode Pelaksanaan", student.periodeKegiatan),
        ],
      }),
      createAcademicParagraph(
        "II. REKAPITULASI TABEL LOGBOOK HARIAN (BERBASIS TAKSONOMI BLOOM)",
        {
          bold: true,
          size: SIZE_14PT,
          alignment: AlignmentType.LEFT,
          before: 360,
          after: 200,
        }
      ),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [logbookTableHeader, ...logbookTableRows],
      }),
      createAcademicParagraph(
        "III. URAIAN RINCI KEGIATAN & LAMPIRAN DOKUMENTASI",
        {
          bold: true,
          size: SIZE_14PT,
          alignment: AlignmentType.LEFT,
          before: 400,
          after: 160,
        }
      ),
      ...detailedNarrativeParagraphs,
      createAcademicParagraph("Mengetahui dan Menyetujui,", {
        alignment: AlignmentType.RIGHT,
        before: 480,
        after: 60,
      }),
      createAcademicParagraph("Dosen Pembimbing / Mentor Lapangan", {
        bold: true,
        alignment: AlignmentType.RIGHT,
        after: 960,
      }),
      createAcademicParagraph(`(${student.namaPembimbing})`, {
        bold: true,
        alignment: AlignmentType.RIGHT,
      })
    );
  }

  // ==================== LAMPIRAN NILAI & CATATAN MENTOR INDUSTRI ====================
  if (mentorAdminData && mentorAdminData.scores && mentorAdminData.scores.length > 0) {
    const totalWeighted = Math.round(
      mentorAdminData.scores.reduce((acc, curr) => acc + (curr.nilai * curr.bobot) / 100, 0) * 10
    ) / 10;
    const mentorName = mentorAdminData.namaMentor || student.namaPembimbing || "Mentor Mitra";
    const mentorRole = mentorAdminData.jabatanMentor || "Supervisor / Pembimbing Lapangan";

    docChildren.push(
      new Paragraph({ children: [new PageBreak()] }),
      createAcademicParagraph("LAMPIRAN: LEMBAR EVALUASI KINERJA OLEH MENTOR LAPANGAN", {
        bold: true,
        size: SIZE_14PT,
        alignment: AlignmentType.CENTER,
        before: 200,
        after: 200,
      }),
      createAcademicParagraph(
        `Berikut adalah hasil penilaian evaluasi kinerja mahasiswa selama melaksanakan program di ${student.namaMitra}:`,
        { after: 200 }
      ),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph("No", { bold: true, alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                width: { size: 52, type: WidthType.PERCENTAGE },
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph("Aspek Penilaian Evaluasi", { bold: true })],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph("Bobot", { bold: true, alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph("Nilai (0-100)", { bold: true, alignment: AlignmentType.CENTER })],
              }),
            ],
          }),
          ...mentorAdminData.scores.map(
            (sc, sIdx) =>
              new TableRow({
                children: [
                  new TableCell({ children: [createAcademicParagraph(String(sIdx + 1), { alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [createAcademicParagraph(sc.aspek, { bold: true }), createAcademicParagraph(sc.keterangan, { italics: true, size: 20 })] }),
                  new TableCell({ children: [createAcademicParagraph(`${sc.bobot}%`, { alignment: AlignmentType.CENTER })] }),
                  new TableCell({ children: [createAcademicParagraph(String(sc.nilai), { bold: true, alignment: AlignmentType.CENTER })] }),
                ],
              })
          ),
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                shading: { fill: "E2E8F0", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph("NILAI AKHIR TERBOBOT (SKALA 100)", { bold: true, alignment: AlignmentType.RIGHT })],
              }),
              new TableCell({
                shading: { fill: "E2E8F0", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph("100%", { bold: true, alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                shading: { fill: "E2E8F0", type: ShadingType.CLEAR, color: "auto" },
                children: [createAcademicParagraph(`${totalWeighted} (${mentorAdminData.predikat || (totalWeighted >= 85 ? "A" : "B")})`, { bold: true, alignment: AlignmentType.CENTER })],
              }),
            ],
          }),
        ],
      }),
      createAcademicParagraph("Catatan Kualitatif Mentor:", { bold: true, before: 240, after: 60 }),
      createAcademicParagraph(mentorAdminData.catatanEvaluasi || "Mahasiswa menunjukkan dedikasi dan performa yang sangat baik.", { italics: true, after: 360 }),
      createAcademicParagraph("Disahkan oleh Mentor Lapangan,", { alignment: AlignmentType.RIGHT, after: 60 }),
      createAcademicParagraph(`( ${mentorName} )`, { bold: true, alignment: AlignmentType.RIGHT, before: 700 }),
      createAcademicParagraph(mentorRole, { italics: true, alignment: AlignmentType.RIGHT })
    );
  }

  const doc = new Document({
    creator: "LogMagang — Dokumen & Export Hub",
    title: `Laporan Kegiatan Resmi ${programName}`,
    description: `Laporan Logbook Harian Berformat ${preset.toUpperCase()} Berbasis Taksonomi Bloom`,
    sections: [
      {
        properties: {
          page: {
            margin: pageMargins,
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeProgram = programName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Laporan_${preset.toUpperCase()}_${safeProgram}_${dateStamp}.docx`);
}
