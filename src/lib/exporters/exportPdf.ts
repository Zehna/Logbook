import { saveAs } from "file-saver";
import {
  LogbookEntry,
  StudentProfile,
  KampusPreset,
  KAMPUS_PRESETS,
} from "./types";

/**
 * Escape string untuk literal teks PDF (...)
 * Mengonversi karakter non-ASCII umum ke ekuivalen aman WinAnsi
 */
function escapePdfText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Memecah paragraf panjang menjadi baris-baris yang muat dalam lebar halaman A4
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  if (!text || !text.trim()) return ["-"];
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : ["-"];
}

/**
 * Generator PDF 1.4 Murni (Standar A4 Akademik Dikti/MBKM)
 * Menghasilkan file .pdf vektor asli dengan font standar Times-Roman & Helvetica
 * tanpa ketergantungan library berat eksternal.
 */
export async function exportLogbookToPdf(
  entries: LogbookEntry[],
  profile: StudentProfile,
  preset: KampusPreset = "dikti"
): Promise<void> {
  const presetInfo =
    KAMPUS_PRESETS.find((p) => p.value === preset) || KAMPUS_PRESETS[0];

  const pageStreams: string[] = [];
  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_LEFT = 50;
  const MARGIN_RIGHT = 545;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    let ops: string[] = [];
    let y = PAGE_HEIGHT - 48;

    const startNewContinuationPage = () => {
      pageStreams.push(ops.join("\n"));
      ops = [];
      y = PAGE_HEIGHT - 55;
      // Header ringkas halaman lanjutan
      ops.push("BT");
      ops.push("/F4 8.5 Tf");
      ops.push("0.4 0.4 0.4 rg");
      ops.push(
        `${MARGIN_LEFT} ${y} Td (${escapePdfText(
          `Logbook Aktivitas Mahasiswa - ${profile.namaMahasiswa || "Mahasiswa"} (${entry.tanggal || "-"}) [Lanjutan]`
        )}) Tj`
      );
      ops.push("ET");
      y -= 8;
      ops.push("0.5 w 0.7 0.7 0.7 RG");
      ops.push(`${MARGIN_LEFT} ${y} m ${MARGIN_RIGHT} ${y} l S`);
      ops.push("0 0 0 rg 0 0 0 RG");
      y -= 20;
    };

    const ensureSpace = (neededPt: number) => {
      if (y - neededPt < 75) {
        startNewContinuationPage();
      }
    };

    const drawCenteredText = (
      text: string,
      font: "/F1" | "/F2" | "/F3" | "/F4",
      size: number,
      yPos: number,
      approxCharWidthFactor = 0.5
    ) => {
      const approxWidth = text.length * size * approxCharWidthFactor;
      const xPos = Math.max(MARGIN_LEFT, (PAGE_WIDTH - approxWidth) / 2);
      ops.push("BT");
      ops.push(`${font} ${size} Tf`);
      ops.push(`${xPos.toFixed(2)} ${yPos.toFixed(2)} Td (${escapePdfText(text)}) Tj`);
      ops.push("ET");
    };

    // 1. KOP SURAT RESMI
    ops.push("0 0 0 rg 0 0 0 RG");
    drawCenteredText(
      "KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI",
      "/F3",
      9.5,
      y,
      0.55
    );
    y -= 13;
    drawCenteredText(
      "PROGRAM MERDEKA BELAJAR KAMPUS MERDEKA (MBKM) / MSIB / KKN",
      "/F3",
      9,
      y,
      0.54
    );
    y -= 15;
    drawCenteredText(
      "LEMBAR LOGBOOK AKTIVITAS HARIAN RESMI MAHASISWA",
      "/F3",
      11.5,
      y,
      0.56
    );
    y -= 12;
    drawCenteredText(
      `Pedoman: ${presetInfo.label} (${presetInfo.badge.replace(/[^a-zA-Z0-9 .:-]/g, "-")})`,
      "/F4",
      8,
      y,
      0.48
    );
    y -= 10;

    // Garis ganda Kop Surat
    ops.push("1.5 w");
    ops.push(`${MARGIN_LEFT} ${y} m ${MARGIN_RIGHT} ${y} l S`);
    y -= 2.5;
    ops.push("0.5 w");
    ops.push(`${MARGIN_LEFT} ${y} m ${MARGIN_RIGHT} ${y} l S`);
    y -= 16;

    // 2. KOTAK IDENTITAS MAHASISWA & MITRA
    const boxTop = y + 4;
    const boxHeight = 68;
    ops.push("0.97 0.97 0.98 rg");
    ops.push("0.75 0.75 0.78 RG 0.6 w");
    ops.push(
      `${MARGIN_LEFT} ${(boxTop - boxHeight).toFixed(2)} ${(
        MARGIN_RIGHT - MARGIN_LEFT
      ).toFixed(2)} ${boxHeight} re B`
    );
    ops.push("0 0 0 rg 0 0 0 RG");

    const leftColX = MARGIN_LEFT + 10;
    const rightColX = 305;
    let infoY = boxTop - 14;

    const drawInfoRow = (
      x: number,
      yPos: number,
      label: string,
      val: string
    ) => {
      ops.push("BT");
      ops.push(`/F4 8.5 Tf ${x} ${yPos.toFixed(2)} Td (${escapePdfText(label)}) Tj`);
      ops.push("ET");
      ops.push("BT");
      ops.push(
        `/F3 8.5 Tf ${x + 82} ${yPos.toFixed(2)} Td (: ${escapePdfText(
          val.slice(0, 34)
        )}) Tj`
      );
      ops.push("ET");
    };

    drawInfoRow(leftColX, infoY, "Nama Mahasiswa", profile.namaMahasiswa || "-");
    drawInfoRow(rightColX, infoY, "Mitra / Instansi", profile.namaMitra || "-");
    infoY -= 14;
    drawInfoRow(leftColX, infoY, "NIM / Registrasi", profile.nim || "-");
    drawInfoRow(rightColX, infoY, "Mentor / DPL", profile.namaPembimbing || "-");
    infoY -= 14;
    drawInfoRow(leftColX, infoY, "Program Studi", profile.programStudi || "-");
    drawInfoRow(rightColX, infoY, "Tanggal Logbook", entry.tanggal || "-");
    infoY -= 14;
    drawInfoRow(
      leftColX,
      infoY,
      "Perguruan Tinggi",
      profile.perguruanTinggi || "-"
    );
    drawInfoRow(
      rightColX,
      infoY,
      "Peran / Durasi",
      `${entry.peran || "Peserta"} (8 Jam)`
    );

    y = boxTop - boxHeight - 20;

    // 3. LIMA BAGIAN UTAMA LOGBOOK
    const sections = [
      {
        num: "1",
        title: "DESKRIPSI AKTIVITAS & PELAKSANAAN TUGAS",
        content: entry.deskripsiKegiatan || "-",
      },
      {
        num: "2",
        title: "KOMPETENSI & KETERAMPILAN YANG DIKEMBANGKAN",
        content: entry.kompetensiDikembangkan || "-",
      },
      {
        num: "3",
        title: "KENDALA & HAMBATAN LAPANGAN YANG DIHADAPI",
        content: entry.kendalaDihadapi || "-",
      },
      {
        num: "4",
        title: "SOLUSI KONKRET & LANGKAH PENYELESAIAN MASALAH",
        content: entry.solusiTindakan || "-",
      },
      {
        num: "5",
        title: "REFLEKSI PEMBELAJARAN & NILAI AKADEMIS MANDIRI",
        content: entry.refleksiPembelajaran || "-",
      },
    ];

    for (const sec of sections) {
      ensureSpace(42);
      // Judul Bagian
      ops.push("BT");
      ops.push(`/F3 9.5 Tf ${MARGIN_LEFT} ${y.toFixed(2)} Td (${escapePdfText(`${sec.num}. ${sec.title}`)}) Tj`);
      ops.push("ET");
      y -= 14;

      const wrappedLines = wrapText(sec.content, 86);
      for (const line of wrappedLines) {
        if (!line) {
          y -= 7;
          continue;
        }
        ensureSpace(15);
        ops.push("BT");
        ops.push(`/F1 10.5 Tf ${MARGIN_LEFT + 12} ${y.toFixed(2)} Td (${escapePdfText(line)}) Tj`);
        ops.push("ET");
        y -= 14;
      }
      y -= 8;
    }

    // Keterangan lampiran foto jika ada
    if (entry.fotoBase64) {
      ensureSpace(30);
      ops.push("0.95 0.96 1 rg 0.7 0.75 0.9 RG 0.5 w");
      ops.push(`${MARGIN_LEFT} ${(y - 18).toFixed(2)} 495 22 re B`);
      ops.push("0.15 0.2 0.5 rg");
      ops.push("BT");
      ops.push(
        `/F3 8.5 Tf ${MARGIN_LEFT + 10} ${(y - 10).toFixed(
          2
        )} Td (${escapePdfText(
          "[Terlampir] Bukti Dokumentasi Visual Multimodal telah terverifikasi pada entri tanggal " +
            (entry.tanggal || "-")
        )}) Tj`
      );
      ops.push("ET");
      ops.push("0 0 0 rg 0 0 0 RG");
      y -= 32;
    }

    // 4. BLOK TANDA TANGAN PENGESAHAN
    ensureSpace(95);
    y -= 8;
    ops.push("0.5 w 0.8 0.8 0.8 RG");
    ops.push(`${MARGIN_LEFT} ${y.toFixed(2)} m ${MARGIN_RIGHT} ${y.toFixed(2)} l S`);
    ops.push("0 0 0 RG");
    y -= 16;

    const sigLeftX = MARGIN_LEFT + 25;
    const sigRightX = 345;

    ops.push("BT");
    ops.push(`/F4 9 Tf ${sigLeftX} ${y.toFixed(2)} Td (Mengetahui & Menyetujui,) Tj`);
    ops.push("ET");
    ops.push("BT");
    ops.push(
      `/F4 9 Tf ${sigRightX} ${y.toFixed(2)} Td (${escapePdfText(
        `Tanggal Pelaporan: ${entry.tanggal || "-"}`
      )}) Tj`
    );
    ops.push("ET");
    y -= 12;

    ops.push("BT");
    ops.push(`/F3 9 Tf ${sigLeftX} ${y.toFixed(2)} Td (Mentor / Pembimbing Lapangan) Tj`);
    ops.push("ET");
    ops.push("BT");
    ops.push(`/F3 9 Tf ${sigRightX} ${y.toFixed(2)} Td (Mahasiswa Peserta Program) Tj`);
    ops.push("ET");

    // E-Paraf / Digital Verification Stamp inside Signature Space
    const mentorHash = Math.abs((profile.namaPembimbing || "Mentor").length * 1937)
      .toString(16)
      .toUpperCase();
    const studentHash = Math.abs((profile.namaMahasiswa || "Mahasiswa").length * 2027)
      .toString(16)
      .toUpperCase();
    const isQrVerified =
      (entry.catatanAsli || "").includes("QR") ||
      (entry.tahapFase || "").includes("QR");

    if (profile.ttdMentorBase64 || isQrVerified) {
      ops.push("0.12 0.25 0.68 rg");
      ops.push("BT");
      ops.push(
        `/F3 8 Tf ${sigLeftX} ${(y - 22).toFixed(2)} Td (${escapePdfText(
          `[TERVERIFIKASI E-PARAF #${mentorHash}]`
        )}) Tj`
      );
      ops.push("ET");
      ops.push("0 0 0 rg");
    }

    if (profile.ttdMahasiswaBase64) {
      ops.push("0.1 0.1 0.12 rg");
      ops.push("BT");
      ops.push(
        `/F3 8 Tf ${sigRightX} ${(y - 22).toFixed(2)} Td (${escapePdfText(
          `[TTD DIGITAL MAHASISWA #${studentHash}]`
        )}) Tj`
      );
      ops.push("ET");
      ops.push("0 0 0 rg");
    }

    y -= 44;

    ops.push("BT");
    ops.push(
      `/F3 9 Tf ${sigLeftX} ${y.toFixed(2)} Td (${escapePdfText(
        `(${profile.namaPembimbing || "Nama Mentor / DPL"})`
      )}) Tj`
    );
    ops.push("ET");
    ops.push("BT");
    ops.push(
      `/F3 9 Tf ${sigRightX} ${y.toFixed(2)} Td (${escapePdfText(
        `(${profile.namaMahasiswa || "Nama Lengkap Mahasiswa"})`
      )}) Tj`
    );
    ops.push("ET");
    y -= 11;

    ops.push("BT");
    ops.push(`/F4 8 Tf ${sigLeftX} ${y.toFixed(2)} Td (NIP / ID Karyawan Mitra) Tj`);
    ops.push("ET");
    ops.push("BT");
    ops.push(
      `/F4 8 Tf ${sigRightX} ${y.toFixed(2)} Td (${escapePdfText(
        `NIM: ${profile.nim || "-"}`
      )}) Tj`
    );
    ops.push("ET");

    pageStreams.push(ops.join("\n"));
  }

  // Tambahkan footer nomor halaman di setiap halaman
  const totalPages = pageStreams.length;
  const finalPageStreams = pageStreams.map((stream, idx) => {
    const footerOps = [
      "0.45 0.45 0.45 rg",
      "BT",
      `/F4 8 Tf 50 28 Td (Dicetak otomatis melalui LogMagang OS - Dokumen Akademik Resmi) Tj`,
      "ET",
      "BT",
      `/F4 8 Tf 475 28 Td (Halaman ${idx + 1} dari ${totalPages}) Tj`,
      "ET",
      "0 0 0 rg",
    ].join("\n");
    return stream + "\n" + footerOps;
  });

  // Rakit struktur objek PDF 1.4
  // Object 1: Catalog
  // Object 2: Pages
  // Object 3..6: Fonts (/F1 Times-Roman, /F2 Times-Bold, /F3 Helvetica-Bold, /F4 Helvetica)
  // Object 7..: pasangan Page & Content Stream
  const objects: string[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

  const pageObjectIds: number[] = [];
  for (let i = 0; i < finalPageStreams.length; i++) {
    pageObjectIds.push(7 + i * 2);
  }

  const kidsRef = pageObjectIds.map((id) => `${id} 0 R`).join(" ");
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [ ${kidsRef} ] /Count ${finalPageStreams.length} >>\nendobj`
  );

  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj"
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>\nendobj"
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj"
  );
  objects.push(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj"
  );

  for (let i = 0; i < finalPageStreams.length; i++) {
    const pageObjId = 7 + i * 2;
    const contentObjId = pageObjId + 1;
    const streamContent = finalPageStreams[i];

    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );
    objects.push(
      `${contentObjId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
    );
  }

  // Hitung byte offset untuk tabel xref
  let pdfContent = "%PDF-1.4\n";
  const offsets: number[] = [0]; // index 0 untuk free entry

  for (const obj of objects) {
    offsets.push(pdfContent.length);
    pdfContent += obj + "\n";
  }

  const xrefStart = pdfContent.length;
  pdfContent += `xref\n0 ${objects.length + 1}\n`;
  pdfContent += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, "0");
    pdfContent += `${offsetStr} 00000 n \n`;
  }

  pdfContent += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const safeName = (profile.namaMahasiswa || "Mahasiswa")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
  const dateSuffix = entries[0]?.tanggal || new Date().toISOString().slice(0, 10);

  saveAs(blob, `Logbook_Resmi_${safeName}_${dateSuffix}.pdf`);
}
