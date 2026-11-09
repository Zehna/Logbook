import type React from "react";
import { AlertTriangle, Award, FileText, Lightbulb, Wrench } from "lucide-react";
import type { LogbookResult, WeeklyLogbookDayItem } from "@/src/lib/exporters/types";

/** 5 kartu Taksonomi Bloom (C3–C6) untuk hasil logbook harian & mingguan. */
export const SECTIONS_CONFIG: {
  key: keyof LogbookResult;
  weeklyKey: keyof Pick<
    WeeklyLogbookDayItem,
    | "deskripsi_kegiatan"
    | "kompetensi_dikembangkan"
    | "kendala_dihadapi"
    | "solusi_tindakan"
    | "refleksi_pembelajaran"
  >;
  number: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  bgClass: string;
  borderClass: string;
}[] = [
  {
    key: "deskripsiKegiatan",
    weeklyKey: "deskripsi_kegiatan",
    number: "01",
    title: "Deskripsi Kegiatan",
    badge: "C3–C4 • Pelaksanaan & Analisis",
    icon: FileText,
    accentClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800",
    bgClass: "bg-indigo-50/40 dark:bg-indigo-950/20",
    borderClass: "border-indigo-100 dark:border-indigo-900/40",
  },
  {
    key: "kompetensiDikembangkan",
    weeklyKey: "kompetensi_dikembangkan",
    number: "02",
    title: "Kompetensi yang Dikembangkan",
    badge: "Hard Skills & Soft Skills",
    icon: Award,
    accentClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    bgClass: "bg-emerald-50/40 dark:bg-emerald-950/20",
    borderClass: "border-emerald-100 dark:border-emerald-900/40",
  },
  {
    key: "kendalaDihadapi",
    weeklyKey: "kendala_dihadapi",
    number: "03",
    title: "Kendala yang Dihadapi",
    badge: "C4 • Identifikasi Masalah",
    icon: AlertTriangle,
    accentClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    bgClass: "bg-amber-50/40 dark:bg-amber-950/20",
    borderClass: "border-amber-100 dark:border-amber-900/40",
  },
  {
    key: "solusiTindakan",
    weeklyKey: "solusi_tindakan",
    number: "04",
    title: "Solusi & Tindakan",
    badge: "C5–C6 • Problem Solving",
    icon: Wrench,
    accentClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800",
    bgClass: "bg-blue-50/40 dark:bg-blue-950/20",
    borderClass: "border-blue-100 dark:border-blue-900/40",
  },
  {
    key: "refleksiPembelajaran",
    weeklyKey: "refleksi_pembelajaran",
    number: "05",
    title: "Refleksi Pembelajaran",
    badge: "C5 • Evaluasi & Tindak Lanjut",
    icon: Lightbulb,
    accentClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    bgClass: "bg-purple-50/40 dark:bg-purple-950/20",
    borderClass: "border-purple-100 dark:border-purple-900/40",
  },
];
