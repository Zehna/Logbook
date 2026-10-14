import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  LogbookEntry,
  StudentProfile,
  DEFAULT_STUDENT_PROFILE,
} from "./types";

export async function exportLogbookToExcel(
  entries: LogbookEntry[],
  profile: Partial<StudentProfile> = {}
): Promise<void> {
  const student: StudentProfile = { ...DEFAULT_STUDENT_PROFILE, ...profile };
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "LogMagang — Dokumen & Export Hub";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Rekap Logbook Harian", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  const programName = entries[0]?.tipeKegiatan || "Magang MBKM / KKN";

  // Judul Utama Laporan di baris 1-3
  worksheet.mergeCells("A1:H1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = `REKAPITULASI LOGBOOK HARIAN — ${programName.toUpperCase()}`;
  titleCell.font = {
    name: "Calibri",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1E1B4B" }, // Indigo 950
  };
  titleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 30;

  worksheet.mergeCells("A2:H2");
  const subTitleCell = worksheet.getCell("A2");
  subTitleCell.value = `Nama: ${student.namaMahasiswa} (${student.nim})  |  Instansi/Mitra: ${student.namaMitra}  |  Periode: ${student.periodeKegiatan}`;
  subTitleCell.font = {
    name: "Calibri",
    size: 10,
    italic: true,
    color: { argb: "FF334155" },
  };
  subTitleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEEF2FF" },
  };
  subTitleCell.alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(2).height = 20;

  // Baris 4: Spasi kosong
  worksheet.getRow(4).height = 8;

  // Definisi Kolom & Lebar
  worksheet.columns = [
    { key: "no", width: 6 },
    { key: "tanggal", width: 18 },
    { key: "peran", width: 24 },
    { key: "deskripsiKegiatan", width: 42 },
    { key: "kompetensi", width: 34 },
    { key: "kendala", width: 32 },
    { key: "solusi", width: 34 },
    { key: "refleksiPembelajaran", width: 38 },
  ];

  // Baris 5: Header Tabel Formal
  const headers = [
    "No",
    "Tanggal",
    "Peran",
    "Deskripsi Kegiatan",
    "Kompetensi",
    "Kendala",
    "Solusi",
    "Refleksi Pembelajaran",
  ];

  const headerRow = worksheet.getRow(5);
  headerRow.values = headers;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF3730A3" }, // Indigo 800
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF1E1B4B" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "medium", color: { argb: "FF1E1B4B" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // Isi Data Riwayat Logbook
  entries.forEach((item, index) => {
    const rowIndex = 6 + index;
    const row = worksheet.getRow(rowIndex);

    row.values = [
      index + 1,
      item.tanggal,
      item.peran,
      item.deskripsiKegiatan,
      item.kompetensiDikembangkan,
      item.kendalaDihadapi,
      item.solusiTindakan,
      item.refleksiPembelajaran,
    ];

    const isEven = index % 2 === 1;

    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Calibri",
        size: 10,
        color: { argb: "FF0F172A" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: isEven ? "FFF8FAFC" : "FFFFFFFF" },
      };
      cell.alignment = {
        vertical: "top",
        horizontal: colNumber === 1 ? "center" : "left",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } },
      };
    });

    row.height = 75;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const safeProgram = programName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStamp = new Date().toISOString().slice(0, 10);
  saveAs(blob, `Rekap_Logbook_${safeProgram}_${dateStamp}.xlsx`);
}
