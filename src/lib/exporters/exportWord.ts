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
} from "./types";

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
    const binaryString = typeof atob !== "undefined"
      ? atob(cleanBase64)
      : Buffer.from(cleanBase64, "base64").toString("binary");
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE_SPACING_1_5, before: 60, after: 60 },
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
  profile: Partial<StudentProfile> = {}
): Promise<void> {
  const student: StudentProfile = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const primaryEntry = entries[0];
  const programName = primaryEntry?.tipeKegiatan || "Magang MBKM";
  const roleName = primaryEntry?.peran || "Mahasiswa Peserta Program";

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "94A3B8",
  };

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
            fill: "1E1B4B",
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

  // Detail Naratif per Entri
  const detailedNarrativeParagraphs: Paragraph[] = [];
  entries.forEach((entry, index) => {
    detailedNarrativeParagraphs.push(
      createAcademicParagraph(
        `Catatan Kegiatan #${index + 1} — ${entry.tanggal} (${entry.peran})`,
        {
          bold: true,
          before: 240,
          after: 100,
          alignment: AlignmentType.LEFT,
        }
      ),
      createAcademicParagraph(
        `1. Deskripsi Kegiatan: ${entry.deskripsiKegiatan}`,
        { after: 100 }
      )
    );

    if (entry.fotoBase64) {
      const imgP = createImageParagraph(entry.fotoBase64, 260, 170);
      if (imgP) {
        detailedNarrativeParagraphs.push(imgP);
        detailedNarrativeParagraphs.push(
          createAcademicParagraph(
            `Gambar 1.${index + 1}: Dokumentasi Kegiatan Lapangan (${entry.tanggal})`,
            {
              italics: true,
              size: 20,
              alignment: AlignmentType.CENTER,
              after: 120,
            }
          )
        );
      }
    }

    detailedNarrativeParagraphs.push(
      createAcademicParagraph(
        `2. Kompetensi yang Dikembangkan: ${entry.kompetensiDikembangkan}`,
        { after: 100 }
      ),
      createAcademicParagraph(
        `3. Kendala yang Dihadapi: ${entry.kendalaDihadapi}`,
        { after: 100 }
      ),
      createAcademicParagraph(`4. Solusi & Tindakan: ${entry.solusiTindakan}`, {
        after: 100,
      }),
      createAcademicParagraph(
        `5. Refleksi Pembelajaran: ${entry.refleksiPembelajaran}`,
        { after: 180 }
      )
    );
  });

  const doc = new Document({
    creator: "LogMagang — Dokumen & Export Hub",
    title: `Laporan Kegiatan Resmi ${programName}`,
    description:
      "Laporan Logbook Harian Berbasis Taksonomi Bloom dengan Bukti Dokumentasi Foto",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (2.54 cm)
              right: 1440,
              bottom: 1440,
              left: 1700, // ~3 cm margin kiri standar penjilidan akademik
            },
          },
        },
        children: [
          // ==================== COVER LAPORAN ====================
          createAcademicParagraph("LAPORAN KEGIATAN HARIAN (LOGBOOK)", {
            bold: true,
            size: SIZE_16PT,
            alignment: AlignmentType.CENTER,
            before: 400,
            after: 120,
          }),
          createAcademicParagraph(`PROGRAM ${programName.toUpperCase()}`, {
            bold: true,
            size: SIZE_14PT,
            alignment: AlignmentType.CENTER,
            after: 360,
          }),
          createAcademicParagraph(`Peran / Posisi: ${roleName}`, {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.CENTER,
            after: 80,
          }),
          createAcademicParagraph(`Mitra / Lokasi: ${student.namaMitra}`, {
            italics: true,
            size: SIZE_12PT,
            alignment: AlignmentType.CENTER,
            after: 1200,
          }),
          createAcademicParagraph("Disusun Oleh:", {
            alignment: AlignmentType.CENTER,
            after: 120,
          }),
          createAcademicParagraph(student.namaMahasiswa, {
            bold: true,
            size: SIZE_14PT,
            alignment: AlignmentType.CENTER,
            after: 60,
          }),
          createAcademicParagraph(`NIM: ${student.nim}`, {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.CENTER,
            after: 1400,
          }),
          createAcademicParagraph(student.programStudi.toUpperCase(), {
            bold: true,
            size: SIZE_14PT,
            alignment: AlignmentType.CENTER,
            after: 80,
          }),
          createAcademicParagraph(student.perguruanTinggi.toUpperCase(), {
            bold: true,
            size: SIZE_14PT,
            alignment: AlignmentType.CENTER,
            after: 80,
          }),
          createAcademicParagraph(student.periodeKegiatan.toUpperCase(), {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.CENTER,
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ==================== BAB I: BIODATA MAHASISWA & MITRA ====================
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
              createBioRow(
                "Dosen Pembimbing / Mentor",
                student.namaPembimbing
              ),
              createBioRow("Periode Pelaksanaan", student.periodeKegiatan),
            ],
          }),

          // ==================== BAB II: TABEL LOGBOOK HARIAN ====================
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

          // ==================== BAB III: URAIAN LENGKAP LOGBOOK ====================
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

          // ==================== LEMBAR PENGESAHAN SINGKAT ====================
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
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const safeProgram = programName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Laporan_Resmi_${safeProgram}_${dateStamp}.docx`);
}
