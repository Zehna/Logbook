/**
 * exportAtsResumeDocx.ts
 * Generator Dokumen CV ATS Standar Harvard (.docx)
 * Didesain khusus agar 100% terbaca mulus oleh sistem Applicant Tracking System (ATS)
 * Menggunakan format 1-kolom murni, font Times New Roman, dan hierarki heading standar industri.
 */

import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

export interface AtsResumeData {
  namaMahasiswa: string;
  email: string;
  telepon: string;
  lokasi: string;
  linkedInUrl: string;
  targetRole: string;
  summary: string;
  mitraPerusahaan: string;
  periodeKerja: string;
  bulletPoints: string[];
  skillsByCategory: {
    hardSkills: string[];
    softSkills: string[];
    toolsAndTech: string[];
  };
  pendidikan: {
    perguruanTinggi: string;
    programStudi: string;
    tahun: string;
    ipk?: string;
  };
}

const FONT_ATS = "Times New Roman";
const SIZE_NAME = 36; // 18pt
const SIZE_HEADING = 24; // 12pt bold
const SIZE_BODY = 21; // 10.5pt
const SIZE_CONTACT = 20; // 10pt
const LINE_SPACING_ATS = 240; // 1.0 single spacing (hemat ruang 1 halaman)

function createHeading(title: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 180, after: 60, line: LINE_SPACING_ATS },
    border: {
      bottom: {
        style: BorderStyle.SINGLE,
        size: 6,
        color: "000000",
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT_ATS,
        size: SIZE_HEADING,
        bold: true,
      }),
    ],
  });
}

function createBullet(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    bullet: { level: 0 },
    spacing: { before: 30, after: 40, line: LINE_SPACING_ATS },
    children: [
      new TextRun({
        text,
        font: FONT_ATS,
        size: SIZE_BODY,
      }),
    ],
  });
}

export async function exportAtsResumeToDocx(data: AtsResumeData): Promise<void> {
  const docChildren: Paragraph[] = [
    // 1. HEADER IDENTITAS (CENTERED)
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40, line: LINE_SPACING_ATS },
      children: [
        new TextRun({
          text: (data.namaMahasiswa || "NAMA LENGKAP MAHASISWA").toUpperCase(),
          font: FONT_ATS,
          size: SIZE_NAME,
          bold: true,
        }),
      ],
    }),

    // 2. CONTACT INFO
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120, line: LINE_SPACING_ATS },
      children: [
        new TextRun({
          text: `${data.lokasi || "Indonesia"} | ${data.telepon || "0812-XXXX-XXXX"} | ${
            data.email || "email@universitas.ac.id"
          } | ${data.linkedInUrl || "linkedin.com/in/profil"}`,
          font: FONT_ATS,
          size: SIZE_CONTACT,
        }),
      ],
    }),

    // 3. PROFESSIONAL SUMMARY
    createHeading("Professional Summary"),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 100, line: LINE_SPACING_ATS },
      children: [
        new TextRun({
          text:
            data.summary ||
            `Dedicated and detail-oriented ${data.targetRole} with proven experience executing operational tasks and high-impact projects during internship. Skilled in analytical thinking, cross-functional collaboration, and measurable problem solving.`,
          font: FONT_ATS,
          size: SIZE_BODY,
        }),
      ],
    }),

    // 4. WORK EXPERIENCE
    createHeading("Professional Work Experience"),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 60, after: 40, line: LINE_SPACING_ATS },
      children: [
        new TextRun({
          text: `${data.targetRole} (Internship / Project Member)`,
          font: FONT_ATS,
          size: SIZE_BODY,
          bold: true,
        }),
        new TextRun({
          text: `  |  ${data.mitraPerusahaan || "Partner Company"}`,
          font: FONT_ATS,
          size: SIZE_BODY,
          italics: true,
        }),
        new TextRun({
          text: `  (${data.periodeKerja || "2026"})`,
          font: FONT_ATS,
          size: SIZE_BODY,
        }),
      ],
    }),
  ];

  // Tambahkan STAR bullets
  if (data.bulletPoints && data.bulletPoints.length > 0) {
    data.bulletPoints.forEach((b) => {
      docChildren.push(createBullet(b.replace(/^•\s*/, "")));
    });
  } else {
    docChildren.push(
      createBullet(
        "Successfully achieved core milestones by applying best practices and collaborative problem-solving."
      )
    );
  }

  // 5. CORE COMPETENCIES & TECHNICAL SKILLS
  docChildren.push(createHeading("Technical & Core Competencies"));
  if (data.skillsByCategory.hardSkills.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 40, after: 30, line: LINE_SPACING_ATS },
        children: [
          new TextRun({ text: "• Hard Skills: ", bold: true, font: FONT_ATS, size: SIZE_BODY }),
          new TextRun({
            text: data.skillsByCategory.hardSkills.join(", "),
            font: FONT_ATS,
            size: SIZE_BODY,
          }),
        ],
      })
    );
  }

  if (data.skillsByCategory.toolsAndTech.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 30, after: 30, line: LINE_SPACING_ATS },
        children: [
          new TextRun({
            text: "• Tools & Technologies: ",
            bold: true,
            font: FONT_ATS,
            size: SIZE_BODY,
          }),
          new TextRun({
            text: data.skillsByCategory.toolsAndTech.join(", "),
            font: FONT_ATS,
            size: SIZE_BODY,
          }),
        ],
      })
    );
  }

  if (data.skillsByCategory.softSkills.length > 0) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 30, after: 60, line: LINE_SPACING_ATS },
        children: [
          new TextRun({ text: "• Soft Skills: ", bold: true, font: FONT_ATS, size: SIZE_BODY }),
          new TextRun({
            text: data.skillsByCategory.softSkills.join(", "),
            font: FONT_ATS,
            size: SIZE_BODY,
          }),
        ],
      })
    );
  }

  // 6. EDUCATION
  docChildren.push(
    createHeading("Education"),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 40, after: 20, line: LINE_SPACING_ATS },
      children: [
        new TextRun({
          text: data.pendidikan.perguruanTinggi || "Universitas Terkemuka",
          font: FONT_ATS,
          size: SIZE_BODY,
          bold: true,
        }),
        new TextRun({
          text: `  |  ${data.pendidikan.tahun || "Expected 2026"}`,
          font: FONT_ATS,
          size: SIZE_BODY,
          italics: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 20, after: 40, line: LINE_SPACING_ATS },
      children: [
        new TextRun({
          text: `Bachelor Degree in ${data.pendidikan.programStudi || "Program Studi"}`,
          font: FONT_ATS,
          size: SIZE_BODY,
        }),
        ...(data.pendidikan.ipk
          ? [
              new TextRun({
                text: `  (IPK: ${data.pendidikan.ipk})`,
                font: FONT_ATS,
                size: SIZE_BODY,
                bold: true,
              }),
            ]
          : []),
      ],
    })
  );

  // Margins 0.75 inch (1080 twips) standar ATS
  const doc = new Document({
    creator: "LogMagang OS - Harvard ATS Resume Engine",
    title: `CV_ATS_${data.namaMahasiswa.replace(/\s+/g, "_")}`,
    description: "Format Standar Harvard ATS untuk Lolos Screening HR & Bot Recruitment",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1080,
              bottom: 1080,
              left: 1080,
              right: 1080,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = data.namaMahasiswa.replace(/[^a-zA-Z0-9]/g, "_") || "Mahasiswa";
  saveAs(blob, `CV_ATS_Harvard_${cleanName}.docx`);
}
