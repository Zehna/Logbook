import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { StudentProfile, DEFAULT_STUDENT_PROFILE } from "./types";
import { MonthlyReportOutput } from "@/app/api/generate-monthly/route";

const FONT_FAMILY = "Times New Roman";
const SIZE_12PT = 24; // 24 half-points = 12pt
const SIZE_14PT = 28; // 14pt
const SIZE_16PT = 32; // 16pt
const LINE_SPACING_1_5 = 360; // 1.5 line spacing

function renderAcademicParagraphs(text: string): Paragraph[] {
  if (!text) return [];
  return text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: LINE_SPACING_1_5, before: 0, after: 120 },
          children: [
            new TextRun({
              text: p,
              font: FONT_FAMILY,
              size: SIZE_12PT,
            }),
          ],
        })
    );
}

function createHeading(title: string, options?: { size?: number; before?: number; after?: number }): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: {
      line: LINE_SPACING_1_5,
      before: options?.before ?? 200,
      after: options?.after ?? 100,
    },
    children: [
      new TextRun({
        text: title,
        font: FONT_FAMILY,
        size: options?.size ?? SIZE_14PT,
        bold: true,
      }),
    ],
  });
}

/**
 * Ekspor Laporan Bulanan / Monev Kemajuan ke format Word (.docx)
 * Dioptimasi dengan tableLayout FIXED dan lebar sel eksplisit (dxa)
 * untuk kompatibilitas penuh dengan WPS Office dan Microsoft Word.
 */
export async function exportMonthlyReportToWord(
  report: MonthlyReportOutput,
  profile: Partial<StudentProfile> = {},
  tipeKegiatan = "Magang MBKM",
  peran = "Mahasiswa Peserta Program"
): Promise<void> {
  const student: StudentProfile = { ...DEFAULT_STUDENT_PROFILE, ...profile };

  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: "FFFFFF",
  };

  const TABLE_TOTAL_WIDTH_DXA = 8000;
  const BIO_COL_WIDTHS = [2400, 300, 5300]; // total 8000 dxa

  function createBioRow(label: string, value: string): TableRow {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: BIO_COL_WIDTHS[0], type: WidthType.DXA },
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          children: [
            new Paragraph({
              spacing: { line: 280, before: 0, after: 40 },
              children: [
                new TextRun({ text: label, font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: BIO_COL_WIDTHS[1], type: WidthType.DXA },
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { line: 280, before: 0, after: 40 },
              children: [
                new TextRun({ text: ":", font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
              ],
            }),
          ],
        }),
        new TableCell({
          width: { size: BIO_COL_WIDTHS[2], type: WidthType.DXA },
          borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
          children: [
            new Paragraph({
              spacing: { line: 280, before: 0, after: 40 },
              children: [
                new TextRun({ text: value, font: FONT_FAMILY, size: SIZE_12PT }),
              ],
            }),
          ],
        }),
      ],
    });
  }

  // Tabel Identitas Biodata Mahasiswa
  const bioTable = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: TABLE_TOTAL_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: BIO_COL_WIDTHS,
    rows: [
      createBioRow("Nama Mahasiswa", student.namaMahasiswa),
      createBioRow("Nomor Induk Mahasiswa (NIM)", student.nim),
      createBioRow("Program Studi / Jurusan", student.programStudi),
      createBioRow("Perguruan Tinggi", student.perguruanTinggi),
      createBioRow("Program Kegiatan", tipeKegiatan),
      createBioRow("Peran / Posisi Penugasan", peran),
      createBioRow("Instansi / Mitra Industri", student.namaMitra),
      createBioRow("Dosen Pembimbing Lapangan (DPL)", student.namaPembimbing),
      createBioRow("Periode Pelaporan", report.periodeBulan),
    ],
  });

  // Tabel Tanda Tangan Pengesahan Tiga Pihak (Mahasiswa, DPL, Mentor)
  const SIGN_COL_WIDTH = 2666; // 3 x 2666 ≈ 8000 dxa
  const signatureTable = new Table({
    layout: TableLayoutType.FIXED,
    width: { size: TABLE_TOTAL_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [SIGN_COL_WIDTH, SIGN_COL_WIDTH, SIGN_COL_WIDTH],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: SIGN_COL_WIDTH, type: WidthType.DXA },
            verticalAlign: VerticalAlign.BOTTOM,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 40 },
                children: [new TextRun({ text: "Disusun Oleh,", font: FONT_FAMILY, size: SIZE_12PT })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 600 },
                children: [
                  new TextRun({ text: "Mahasiswa Peserta,", font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 20 },
                children: [
                  new TextRun({ text: `( ${student.namaMahasiswa} )`, font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 240, before: 0, after: 0 },
                children: [
                  new TextRun({ text: `NIM. ${student.nim}`, font: FONT_FAMILY, size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: SIGN_COL_WIDTH, type: WidthType.DXA },
            verticalAlign: VerticalAlign.BOTTOM,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 40 },
                children: [new TextRun({ text: "Menyetujui,", font: FONT_FAMILY, size: SIZE_12PT })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 600 },
                children: [
                  new TextRun({ text: "Mentor Mitra Industri,", font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 20 },
                children: [
                  new TextRun({ text: `( Mentor ${student.namaMitra} )`, font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 240, before: 0, after: 0 },
                children: [
                  new TextRun({ text: "ID / NIK. _______________", font: FONT_FAMILY, size: 20 }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: SIGN_COL_WIDTH, type: WidthType.DXA },
            verticalAlign: VerticalAlign.BOTTOM,
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 40 },
                children: [new TextRun({ text: "Mengetahui,", font: FONT_FAMILY, size: SIZE_12PT })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 600 },
                children: [
                  new TextRun({ text: "Dosen Pembimbing Lapangan,", font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 260, before: 0, after: 20 },
                children: [
                  new TextRun({ text: `( ${student.namaPembimbing} )`, font: FONT_FAMILY, size: SIZE_12PT, bold: true }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { line: 240, before: 0, after: 0 },
                children: [
                  new TextRun({ text: "NIP. ___________________", font: FONT_FAMILY, size: 20 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: "LogMagang OS — Generator Laporan Monev",
    title: `${report.periodeBulan} - ${student.namaMahasiswa}`,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 2268, left: 2268, bottom: 1701, right: 1701 }, // Standar 4-4-3-3 cm
          },
        },
        children: [
          // JUDUL DOKUMEN
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 280, before: 0, after: 60 },
            children: [
              new TextRun({
                text: "LAPORAN KEMAJUAN BULANAN (MONEV)",
                font: FONT_FAMILY,
                size: SIZE_16PT,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 260, before: 0, after: 40 },
            children: [
              new TextRun({
                text: `PROGRAM ${tipeKegiatan.toUpperCase()} — ${student.perguruanTinggi.toUpperCase()}`,
                font: FONT_FAMILY,
                size: SIZE_12PT,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 0, after: 300 },
            children: [
              new TextRun({
                text: report.periodeBulan.toUpperCase(),
                font: FONT_FAMILY,
                size: SIZE_12PT,
                italics: true,
              }),
            ],
          }),

          // I. BIODATA MAHASISWA & MITRA
          createHeading("I. IDENTITAS PESERTA & PROGRAM", { before: 100, after: 80 }),
          bioTable,

          new Paragraph({ children: [new PageBreak()] }),

          // II. RINGKASAN CAPAIAN IKU
          createHeading("II. RINGKASAN PENCAPAIAN INDIKATOR KINERJA UTAMA (IKU & CPL)", { before: 100, after: 100 }),
          ...renderAcademicParagraphs(report.ringkasanPencapaianIKU),

          // III. MILESTONE PROYEK UTAMA
          createHeading("III. MILESTONE & PROGRES PENYELESAIAN PROYEK UTAMA", { before: 200, after: 100 }),
          ...renderAcademicParagraphs(report.milestoneProyekUtama),

          // IV. EVALUASI HAMBATAN & SOLUSI
          createHeading("IV. EVALUASI HAMBATAN, TANTANGAN, & SOLUSI MITIGASI", { before: 200, after: 100 }),
          ...renderAcademicParagraphs(report.evaluasiHambatanDanSolusi),

          // V. RENCANA 4 PEKAN KE DEPAN
          createHeading("V. RENCANA KERJA STRATEGIS & TARGET 4 PEKAN KE DEPAN", { before: 200, after: 100 }),
          ...renderAcademicParagraphs(report.rencanaEmpatPekanKedepan),

          // VI. REFLEKSI & PENGESAHAN
          createHeading("VI. REFLEKSI PEMBELAJARAN BERMAKNA & PENGESAHAN", { before: 200, after: 100 }),
          ...renderAcademicParagraphs(report.rekomendasiDanRefleksi),

          new Paragraph({
            spacing: { line: LINE_SPACING_1_5, before: 150, after: 150 },
            children: [
              new TextRun({
                text: "Demikian laporan kemajuan bulanan ini disusun dengan sebenarnya sebagai bukti pertanggungjawaban pelaksanaan kegiatan di instansi mitra.",
                font: FONT_FAMILY,
                size: SIZE_12PT,
                italics: true,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { line: LINE_SPACING_1_5, before: 100, after: 200 },
            children: [
              new TextRun({
                text: `Disahkan pada: ${new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`,
                font: FONT_FAMILY,
                size: SIZE_12PT,
              }),
            ],
          }),

          signatureTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = student.namaMahasiswa.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanPeriod = report.periodeBulan.replace(/[^a-zA-Z0-9]/g, "_");
  saveAs(blob, `Laporan_Kemajuan_${cleanPeriod}_${cleanName}.docx`);
}
