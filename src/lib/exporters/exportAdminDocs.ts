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
import { StudentProfile, DEFAULT_STUDENT_PROFILE } from "./types";

const FONT_FAMILY = "Times New Roman";
const SIZE_12PT = 24; // 12pt
const SIZE_14PT = 28; // 14pt
const SIZE_16PT = 32; // 16pt
const LINE_SPACING_1_5 = 360;

export interface MentorEvaluationScore {
  aspek: string;
  bobot: number; // persentase misal 20
  nilai: number; // 0-100
  keterangan: string;
}

export interface MentorAdminData {
  namaMentor: string;
  jabatanMentor: string;
  divisi: string;
  catatanEvaluasi: string;
  scores: MentorEvaluationScore[];
  predikat: string; // misal "Sangat Memuaskan (A)"
  nomorSurat?: string;
  tanggalSurat?: string;
}

export const DEFAULT_EVALUATION_SCORES: MentorEvaluationScore[] = [
  {
    aspek: "1. Kedisiplinan, Kehadiran & Etika Kerja Profesional",
    bobot: 20,
    nilai: 92,
    keterangan: "Sangat disiplin, hadir tepat waktu, dan mematuhi etika kerja",
  },
  {
    aspek: "2. Kerjasama Tim & Komunikasi Efektif Lintas Divisi",
    bobot: 20,
    nilai: 90,
    keterangan: "Komunikatif, aktif berkoordinasi, dan adaptif dalam tim",
  },
  {
    aspek: "3. Penguasaan Kompetensi Teknis & Kualitas Eksekusi Tugas",
    bobot: 30,
    nilai: 94,
    keterangan: "Menguasai perkakas kerja dan menyelesaikan penugasan dengan akurat",
  },
  {
    aspek: "4. Inisiatif, Inovasi & Kemampuan Problem Solving Mandiri",
    bobot: 15,
    nilai: 88,
    keterangan: "Proaktif memberikan gagasan solusi saat menghadapi hambatan",
  },
  {
    aspek: "5. Kerapian Pelaporan, Refleksi Pembelajaran & Logbook",
    bobot: 15,
    nilai: 95,
    keterangan: "Pencatatan logbook sangat komprehensif berbasis Taksonomi Bloom",
  },
];

function createDocParagraph(
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
      after: options?.after ?? 100,
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

function createDocImage(base64Data: string, width = 100, height = 100): Paragraph | null {
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
      spacing: { line: LINE_SPACING_1_5, before: 60, after: 120 },
      children: [
        new ImageRun({
          data: bytes,
          type: isPng ? "png" : "jpg",
          transformation: { width, height },
        }),
      ],
    });
  } catch {
    return null;
  }
}

// 1. Ekspor Lembar Penilaian Kinerja Mahasiswa Magang oleh Mentor
export async function exportLembarPenilaianMentor(
  profile: Partial<StudentProfile>,
  adminData: Partial<MentorAdminData>
): Promise<void> {
  const student = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const scores = adminData.scores || DEFAULT_EVALUATION_SCORES;
  const mentorName = adminData.namaMentor || student.namaPembimbing || "Nama Mentor Lapangan";
  const mentorTitle = adminData.jabatanMentor || "Supervisor / Senior Specialist";
  const divisi = adminData.divisi || "Divisi Operasional & Rekayasa Produk";
  const catatan =
    adminData.catatanEvaluasi ||
    "Mahasiswa menunjukkan dedikasi kerja yang luar biasa, cepat beradaptasi dengan alur kerja tim, serta konsisten memberikan hasil terbaik dalam penugasan proyek magang.";

  const totalNilai = scores.reduce(
    (acc, curr) => acc + (curr.nilai * curr.bobot) / 100,
    0
  );

  const gradeLetter =
    totalNilai >= 85 ? "A" : totalNilai >= 80 ? "A-" : totalNilai >= 75 ? "B+" : "B";

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: "94A3B8",
  };

  const tableHeader = new TableRow({
    tableHeader: true,
    children: [
      { text: "No", width: 6 },
      { text: "Komponen / Aspek Penilaian", width: 44 },
      { text: "Bobot (%)", width: 14 },
      { text: "Skor (1-100)", width: 14 },
      { text: "Keterangan Kualitatif", width: 22 },
    ].map(
      (col) =>
        new TableCell({
          width: { size: col.width, type: WidthType.PERCENTAGE },
          shading: { fill: "1E1B4B", type: ShadingType.CLEAR, color: "auto" },
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { line: LINE_SPACING_1_5, before: 60, after: 60 },
              children: [
                new TextRun({
                  text: col.text,
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

  const tableRows = scores.map((sc, idx) => {
    return new TableRow({
      children: [
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createDocParagraph(String(idx + 1), { alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createDocParagraph(sc.aspek, { bold: true, alignment: AlignmentType.LEFT }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createDocParagraph(`${sc.bobot}%`, { alignment: AlignmentType.CENTER }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createDocParagraph(String(sc.nilai), {
              bold: true,
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: thinBorder,
            right: thinBorder,
          },
          children: [
            createDocParagraph(sc.keterangan, { alignment: AlignmentType.LEFT }),
          ],
        }),
      ],
    });
  });

  // Summary Row Total
  const totalRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 3,
        borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
        shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
        children: [
          createDocParagraph("NILAI AKHIR KUMULATIF (RATA-RATA TERBOBOT):", {
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      }),
      new TableCell({
        borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
        shading: { fill: "E0E7FF", type: ShadingType.CLEAR, color: "auto" },
        children: [
          createDocParagraph(`${totalNilai.toFixed(1)} (${gradeLetter})`, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
        ],
      }),
      new TableCell({
        borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
        shading: { fill: "F1F5F9", type: ShadingType.CLEAR, color: "auto" },
        children: [
          createDocParagraph(`PREDIKAT: ${gradeLetter === "A" ? "SANGAT BAIK" : "BAIK"}`, {
            bold: true,
            alignment: AlignmentType.CENTER,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    creator: "LogMagang OS — Hub Administrasi",
    title: `Lembar Penilaian Mentor - ${student.namaMahasiswa}`,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1700, right: 1440 },
          },
        },
        children: [
          createDocParagraph("LEMBAR EVALUASI & PENILAIAN KINERJA MAHASISWA MAGANG", {
            bold: true,
            size: SIZE_16PT,
            alignment: AlignmentType.CENTER,
            before: 100,
            after: 40,
          }),
          createDocParagraph(`MITRA INDUSTRI: ${student.namaMitra.toUpperCase()}`, {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.CENTER,
            after: 300,
          }),

          createDocParagraph("I. BIODATA MAHASISWA & PEMBIMBING LAPANGAN", {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.LEFT,
            after: 100,
          }),

          createDocParagraph(`Nama Mahasiswa    : ${student.namaMahasiswa}`, { bold: true }),
          createDocParagraph(`NIM Mahasiswa     : ${student.nim}`),
          createDocParagraph(`Program Studi     : ${student.programStudi} — ${student.perguruanTinggi}`),
          createDocParagraph(`Perusahaan Mitra  : ${student.namaMitra}`),
          createDocParagraph(`Mentor / Penilai  : ${mentorName} (${mentorTitle} - ${divisi})`),
          createDocParagraph(`Periode Magang    : ${student.periodeKegiatan}`, { after: 200 }),

          createDocParagraph("II. TABEL RUBRIK EVALUASI KINERJA", {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.LEFT,
            after: 100,
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [tableHeader, ...tableRows, totalRow],
          }),

          createDocParagraph("III. CATATAN & REKOMENDASI KUALITATIF MENTOR", {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.LEFT,
            before: 260,
            after: 100,
          }),
          createDocParagraph(catatan, { italics: true, after: 360 }),

          createDocParagraph("Disahkan pada tanggal: " + (adminData.tanggalSurat || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })), {
            alignment: AlignmentType.RIGHT,
            after: 40,
          }),
          createDocParagraph("Mentor Lapangan / Supervisor,", {
            bold: true,
            alignment: AlignmentType.RIGHT,
            after: 900,
          }),
          createDocParagraph(`( ${mentorName} )`, {
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
          createDocParagraph(`Jabatan: ${mentorTitle}`, {
            italics: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = student.namaMahasiswa.replace(/[^a-zA-Z0-9]/g, "_");
  saveAs(blob, `Lembar_Penilaian_Mentor_${cleanName}.docx`);
}

// 2. Ekspor Surat Keterangan Selesai Magang (SKSM)
export async function exportSuratKeteranganSelesaiMagang(
  profile: Partial<StudentProfile>,
  adminData: Partial<MentorAdminData>
): Promise<void> {
  const student = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const mentorName = adminData.namaMentor || student.namaPembimbing || "Nama Pimpinan / HRD";
  const mentorTitle = adminData.jabatanMentor || "Human Resources Director";
  const nomorSurat = adminData.nomorSurat || `SKSM/${student.namaMitra.slice(0, 3).toUpperCase()}/${new Date().getFullYear()}/089`;
  const tanggalSurat = adminData.tanggalSurat || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const doc = new Document({
    creator: "LogMagang OS",
    title: `Surat Keterangan Selesai Magang - ${student.namaMahasiswa}`,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1700, right: 1440 },
          },
        },
        children: [
          createDocParagraph(student.namaMitra.toUpperCase(), {
            bold: true,
            size: SIZE_16PT,
            alignment: AlignmentType.CENTER,
            before: 100,
            after: 20,
          }),
          createDocParagraph("SURAT KETERANGAN SELESAI PRAKTIK KERJA / MAGANG", {
            bold: true,
            size: SIZE_14PT,
            alignment: AlignmentType.CENTER,
            after: 40,
          }),
          createDocParagraph(`Nomor: ${nomorSurat}`, {
            alignment: AlignmentType.CENTER,
            after: 400,
          }),

          createDocParagraph("Yang bertanda tangan di bawah ini menerangkan bahwa:"),
          createDocParagraph(`Nama Mahasiswa    : ${student.namaMahasiswa}`, { bold: true }),
          createDocParagraph(`NIM               : ${student.nim}`),
          createDocParagraph(`Program Studi     : ${student.programStudi}`),
          createDocParagraph(`Perguruan Tinggi  : ${student.perguruanTinggi}`, { after: 240 }),

          createDocParagraph(
            `Telah secara resmi menyelesaikan program Praktik Kerja Lapangan / Magang Mandiri / MBKM di ${student.namaMitra} pada periode ${student.periodeKegiatan}.`
          ),
          createDocParagraph(
            `Selama menjalankan penugasan di instansi kami, yang bersangkutan telah menunjukkan dedikasi, integritas, kedisiplinan, serta etika kerja yang SANGAT BAIK, serta mampu menyelesaikan seluruh target luaran pekerjaan secara optimal.`
          ),
          createDocParagraph(
            `Demikian Surat Keterangan Selesai Magang ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya dalam proses konversi akademik maupun kelengkapan administratif kelulusan.`,
            { after: 400 }
          ),

          createDocParagraph(`Ditetapkan di: Lokasi Mitra, ${tanggalSurat}`, {
            alignment: AlignmentType.RIGHT,
            after: 40,
          }),
          createDocParagraph(`${student.namaMitra}`, {
            bold: true,
            alignment: AlignmentType.RIGHT,
            after: 900,
          }),
          createDocParagraph(`( ${mentorName} )`, {
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
          createDocParagraph(`${mentorTitle}`, {
            italics: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = student.namaMahasiswa.replace(/[^a-zA-Z0-9]/g, "_");
  saveAs(blob, `Surat_Keterangan_Selesai_Magang_${cleanName}.docx`);
}

// 3. Ekspor Surat Rekomendasi Kerja (Letter of Recommendation)
export async function exportSuratRekomendasiKerja(
  profile: Partial<StudentProfile>,
  adminData: Partial<MentorAdminData>
): Promise<void> {
  const student = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const mentorName = adminData.namaMentor || student.namaPembimbing || "Nama Mentor / Lead";
  const mentorTitle = adminData.jabatanMentor || "Head of Department / Lead Engineer";
  const tanggalSurat = adminData.tanggalSurat || new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  const doc = new Document({
    creator: "LogMagang OS",
    title: `Surat Rekomendasi Kerja - ${student.namaMahasiswa}`,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1700, right: 1440 },
          },
        },
        children: [
          createDocParagraph("LETTER OF RECOMMENDATION", {
            bold: true,
            size: SIZE_16PT,
            alignment: AlignmentType.CENTER,
            before: 100,
            after: 20,
          }),
          createDocParagraph("SURAT REKOMENDASI KERJA PROFESIONAL", {
            bold: true,
            size: SIZE_12PT,
            alignment: AlignmentType.CENTER,
            after: 360,
          }),

          createDocParagraph("Kepada Yth.", { alignment: AlignmentType.LEFT }),
          createDocParagraph("Bapak/Ibu Pimpinan Perusahaan / Tim Talent Acquisition", { bold: true }),
          createDocParagraph("Di Tempat", { after: 240 }),

          createDocParagraph(
            `Saya yang bertanda tangan di bawah ini, ${mentorName}, bertindak selaku ${mentorTitle} di ${student.namaMitra}, dengan bangga memberikan rekomendasi kerja profesional yang kuat kepada:`
          ),
          createDocParagraph(`Nama Lengkap   : ${student.namaMahasiswa}`, { bold: true }),
          createDocParagraph(`NIM            : ${student.nim}`),
          createDocParagraph(`Almamater      : ${student.perguruanTinggi} (${student.programStudi})`, { after: 240 }),

          createDocParagraph(
            `Selama ${student.namaMahasiswa} menjalani program magang di tim kami pada periode ${student.periodeKegiatan}, saya mengamati secara langsung etos kerja, ketelitian, dan kemampuan pemecahan masalah (problem solving) yang luar biasa. Mahasiswa ini tidak hanya menguasai teori perkuliahan, namun mampu mengeksekusi tanggung jawab industri dengan hasil berkualitas tinggi dan proaktif berkolaborasi lintas tim.`
          ),
          createDocParagraph(
            `Karakter kepemimpinan, komitmen terhadap deadline, serta kemauan belajar hal baru yang dimilikinya menjadikan saya tanpa ragu merekomendasikan ${student.namaMahasiswa} untuk posisi profesional penuh waktu (Full-time) di institusi Anda.`
          ),
          createDocParagraph(
            `Saya yakin yang bersangkutan akan segera menjadi aset yang sangat berharga dan berdaya guna bagi organisasi Anda. Apabila Bapak/Ibu membutuhkan informasi atau konfirmasi tambahan, saya dengan senang hati dapat dihubungi.`,
            { after: 400 }
          ),

          createDocParagraph(`Hormat kami, ${tanggalSurat}`, {
            alignment: AlignmentType.RIGHT,
            after: 40,
          }),
          createDocParagraph(`${student.namaMitra}`, {
            bold: true,
            alignment: AlignmentType.RIGHT,
            after: 900,
          }),
          createDocParagraph(`( ${mentorName} )`, {
            bold: true,
            alignment: AlignmentType.RIGHT,
          }),
          createDocParagraph(`${mentorTitle}`, {
            italics: true,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = student.namaMahasiswa.replace(/[^a-zA-Z0-9]/g, "_");
  saveAs(blob, `Surat_Rekomendasi_Kerja_${cleanName}.docx`);
}
