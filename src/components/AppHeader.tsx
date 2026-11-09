"use client";


import React from "react";
import {
  ArrowRightLeft,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Crown,
  FileText,
  GraduationCap,
  Mic,
  Moon,
  Sun,
  Tent,
  User,
  Zap,
} from "lucide-react";
import type { AppUserProfile } from "@/src/lib/firebase/config";
import { LicenseInfo } from "@/src/lib/types/modules";
import { MAX_FREE_QUOTA } from "@/src/lib/config/storageKeys";

/** Header sticky + tab navigasi. Sebelumnya JSX inline di app/page.tsx. */
interface AppHeaderProps {
  isHydrated: boolean;
  isPro: boolean;
  licenseDetails: LicenseInfo | null;
  remainingQuota: number;
  currentUserProfile: AppUserProfile | null;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenWorkspaceSync: () => void;
  onOpenLicenseModal: () => void;
  onOpenAuthModal: () => void;
  mainTab: string;
  setMainTab: React.Dispatch<React.SetStateAction<
    | "generator"
    | "sks"
    | "resume"
    | "simulator"
    | "kkn"
    | "admin"
  >>;
  historyCount: number;
}

export function AppHeader(props: AppHeaderProps) {
  const {
    isHydrated,
    isPro,
    licenseDetails,
    remainingQuota,
    currentUserProfile,
    isDarkMode,
    toggleTheme,
    onOpenWorkspaceSync,
    onOpenLicenseModal,
    onOpenAuthModal,
    mainTab,
    setMainTab,
    historyCount,
  } = props;

  return (
  <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
    <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-2xs">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
            LogMagang OS
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            Workspace Magang & KKN
          </span>
        </div>
      </div>

      {/* Sederhanakan tombol di kanan: Backup & Sync, Lencana Pro Monokrom Halus, Dark/Light Mode */}
      {isHydrated && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenWorkspaceSync}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
            title="Cadangan & Sinkronisasi JSON"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden sm:inline">Backup & Sync</span>
          </button>

          {isPro ? (
            <button
              type="button"
              onClick={onOpenLicenseModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/60 transition cursor-pointer"
              title="Klik untuk melihat detail Lisensi Pro Anda"
            >
              <Crown className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
              <span>
                {licenseDetails?.tier === "sultan" ? "Sultan Pro" : "Pro Plan"}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLicenseModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition cursor-pointer"
              title="Klik untuk upgrade ke LogMagang Pro"
            >
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Kuota: {remainingQuota}/{MAX_FREE_QUOTA}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-medium">Upgrade</span>
            </button>
          )}

          {/* User Login / Profile Pill Button */}
          {currentUserProfile ? (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition cursor-pointer max-w-[170px]"
              title={`Akun Mahasiswa: ${currentUserProfile.displayName} (${currentUserProfile.email})`}
            >
              {currentUserProfile.photoURL ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={currentUserProfile.photoURL}
                  alt={currentUserProfile.displayName}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUserProfile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate">{currentUserProfile.displayName.split(" ")[0]}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Tersambung ke Firestore Database" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition cursor-pointer shadow-2xs"
              title="Masuk dengan Akun Google (Tersimpan di Cloud Database)"
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          )}

          {/* Tombol Toggle Dark Mode */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition cursor-pointer"
            title={isDarkMode ? "Beralih ke Tema Terang (Light Mode)" : "Beralih ke Tema Gelap (Dark Mode)"}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-zinc-300" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      )}
    </div>

    {/* 6 Tabs Navigation Bar (Dub.co Minimalist Underline Style) */}
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs relative">
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: "generator", label: "Generator & Dokumen", icon: FileText, count: historyCount > 0 ? historyCount : undefined },
          { id: "sks", label: "Konversi 20 SKS", icon: GraduationCap },
          { id: "resume", label: "CV ATS & LinkedIn", icon: Briefcase },
          { id: "simulator", label: "Simulasi Sidang DPL", icon: Mic },
          { id: "kkn", label: "Tim KKN Desa", icon: Tent },
          { id: "admin", label: "Berkas & Penilaian", icon: ClipboardCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mainTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMainTab(tab.id as "generator" | "sks" | "resume" | "simulator" | "kkn" | "admin")}
              className={`inline-flex items-center gap-2 py-2.5 px-2 sm:px-0 text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer border-b-2 -mb-px group ${
                isActive
                  ? "border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  </header>
  );
}
