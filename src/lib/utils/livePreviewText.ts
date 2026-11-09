import type { LogbookEntry, StudentProfile } from "@/src/lib/exporters/types";

/**
 * Teks logbook terformat untuk disalin / dibagikan. Sebelumnya
 * getFormattedLogbookSnippet inline di LivePreviewModal — dipindah verbatim.
 */
export function getFormattedLogbookSnippet(
  entries: LogbookEntry[],
  currentEntry: LogbookEntry | null,
  viewAllEntries: boolean,
  studentProfile: StudentProfile
): string {
if (!currentEntry) return "";
if (viewAllEntries && entries.length > 1) {
  return entries
    .map((e, idx) => {
      return `=== LOGBOOK HARI KE-${idx + 1} (${e.tanggal}) ===\nPeran: ${e.peran}\nProgram: ${e.tipeKegiatan}\n\n1. DESKRIPSI KEGIATAN:\n${e.deskripsiKegiatan}\n\n2. KOMPETENSI DIKEMBANGKAN:\n${e.kompetensiDikembangkan}\n\n3. KENDALA DIHADAPI:\n${e.kendalaDihadapi}\n\n4. SOLUSI TINDAKAN:\n${e.solusiTindakan}\n\n5. REFLEKSI PEMBELAJARAN:\n${e.refleksiPembelajaran}`;
    })
    .join("\n\n----------------------------------------\n\n");
}
return `LOGBOOK AKTIVITAS - ${currentEntry.tanggal}\nNama: ${studentProfile.namaMahasiswa || "Mahasiswa MBKM"}\nNIM: ${studentProfile.nim || "-"}\nMitra: ${studentProfile.namaMitra || "-"}\nPeran: ${currentEntry.peran}\n\n1. DESKRIPSI KEGIATAN:\n${currentEntry.deskripsiKegiatan}\n\n2. KOMPETENSI DIKEMBANGKAN:\n${currentEntry.kompetensiDikembangkan}\n\n3. KENDALA DIHADAPI:\n${currentEntry.kendalaDihadapi}\n\n4. SOLUSI TINDAKAN:\n${currentEntry.solusiTindakan}\n\n5. REFLEKSI PEMBELAJARAN:\n${currentEntry.refleksiPembelajaran}`;
}

export interface MailtoInput {
  entries: LogbookEntry[];
  currentEntry: LogbookEntry | null;
  viewAllEntries: boolean;
  studentProfile: StudentProfile;
  mentorEmail: string;
}

/**
 * URL mailto ke mentor/dosen dengan subjek & isi logbook. Sebelumnya
 * buildMailtoHref inline di LivePreviewModal — dipindah verbatim.
 */
export function buildMailtoHref({
  entries,
  currentEntry,
  viewAllEntries,
  studentProfile,
  mentorEmail,
}: MailtoInput): string {
if (!currentEntry) return "mailto:";
const namaMhs = studentProfile.namaMahasiswa || "Mahasiswa Peserta";
const nimMhs = studentProfile.nim || "-";
const namaPembimbing =
  studentProfile.namaPembimbing || "Mentor / Dosen Pembimbing Lapangan";
const mitra = studentProfile.namaMitra || "Mitra Kegiatan";
const kampus = studentProfile.perguruanTinggi || "Perguruan Tinggi";
const program = currentEntry.tipeKegiatan || "Magang MBKM";

const dateLabel =
  viewAllEntries && entries.length > 1
    ? `Rekap ${entries.length} Entri (${entries[0]?.tanggal || ""} s/d ${entries[entries.length - 1]?.tanggal || ""})`
    : `${currentEntry.tanggal || "Harian"}`;

const subject = `[Laporan Logbook ${program}] ${namaMhs} (${nimMhs}) - ${dateLabel}`;

const snippet = getFormattedLogbookSnippet(entries, currentEntry, viewAllEntries, studentProfile);
const maxSnippetLength = 1500;
const safeSnippet =
  snippet.length > maxSnippetLength
    ? `${snippet.slice(0, maxSnippetLength)}\n\n[... Teks dipersingkat agar muat di URL email. Teks lengkap telah disalin otomatis ke clipboard Anda ...]`
    : snippet;

const body = [
  `Yth. Bapak/Ibu ${namaPembimbing},`,
  "",
  `Semoga Bapak/Ibu selalu dalam keadaan sehat. Berikut saya lampirkan laporan logbook aktivitas ${program} untuk ditinjau:`,
  "",
  `• Nama Mahasiswa : ${namaMhs}`,
  `• NIM            : ${nimMhs}`,
  `• Perguruan Tinggi : ${kampus}`,
  `• Instansi Mitra : ${mitra}`,
  `• Periode/Tanggal : ${dateLabel}`,
  "",
  "============================================================",
  safeSnippet,
  "============================================================",
  "",
  "Demikian laporan aktivitas ini saya sampaikan. Terima kasih banyak atas bimbingan dan arahan Bapak/Ibu.",
  "",
  "Hormat saya,",
  namaMhs,
  `NIM: ${nimMhs}`,
].join("\r\n");

const recipient = mentorEmail.trim();
return `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(
  subject
)}&body=${encodeURIComponent(body)}`;
}
