"use client";

import React from "react";
import {
  BookOpen,
  Check,
  CheckSquare,
  Eye,
  FileText,
  History,
} from "lucide-react";
import { KAMPUS_PRESETS } from "@/src/lib/exporters/types";
import type {
  KampusPreset,
  LogbookEntry,
  StudentProfile,
} from "@/src/lib/exporters/types";

import { BulkExportPanel } from "@/src/components/BulkExportPanel";
import { ProfileCoverPanel } from "@/src/components/ProfileCoverPanel";
import { ExportDownloadActions } from "@/src/components/ExportDownloadActions";
import { CloudCanvaExtensionPanel } from "@/src/components/CloudCanvaExtensionPanel";

/**
 * Hub Ekspor & Integrasi Dokumen (preset kampus, bulk selection, biodata
 * cover, tombol unduh .xlsx/.docx/.pptx, sintesis Bab I-V, Canva, ekstensi).
 * Dipindah verbatim dari app/page.tsx (fase 2) — semua state & handler
 * tetap dimiliki HomePage dan masuk lewat props, jadi perilaku tidak berubah.
 * Wrapper `{hasAnyOutput && !isLoading && (...)}` tetap di page.tsx.
 */
export interface ExportHubProps {
  isSynthesizingReport: boolean;
  studentProfile: StudentProfile;
  showProfileEditor: boolean;
  exportingType: "pdf" | "excel" | "word" | "pptx" | null;
  exportSuccessToast: string | null;
  canvaBannerOpen: boolean;
  copiedCanvaDraft: boolean;
  copiedExtensionJson: boolean;
  selectedPreset: KampusPreset;
  isBulkSelectionActive: boolean;
  selectedExportEntryIds: string[];
  bulkExportSearchQuery: string;
  bulkExportFilterType: string;
  setCanvaBannerOpen: (value: boolean) => void;
  setCopiedCanvaDraft: (value: boolean) => void;
  setIsExtensionModalOpen: (value: boolean) => void;
  setShowProfileEditor: (value: boolean | ((prev: boolean) => boolean)) => void;
  setBulkExportFilterType: (value: string) => void;
  setBulkExportSearchQuery: (value: string) => void;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  onUpdateProfile: (field: keyof StudentProfile, value: string) => void;
  onLogoUpload: (file: File) => void;
  onRemoveLogo: () => void;
  onPresetChange: (preset: KampusPreset) => void;
  onGetEntriesForExport: () => LogbookEntry[];
  onGetSelectedEntriesForExport: () => LogbookEntry[];
  onToggleBulkSelectEntry: (id: string) => void;
  onSelectAllExportEntries: () => void;
  onDeselectAllExportEntries: () => void;
  onSelectRecentExportEntries: (count: number) => void;
  onToggleBulkSelectionMode: () => void;
  onOpenLivePreview: () => void;
  onExportExcel: () => void | Promise<void>;
  onExportWord: () => void | Promise<void>;
  onSynthesizeAndExportWord: () => void | Promise<void>;
  onExportPowerPoint: () => void | Promise<void>;
  onSyncDirectToExtension: () => void;
  onOpenDriveSyncModal: () => void;
  onBuildCanvaPosterDraft: () => string;
  onOpenCanvaPoster: () => void | Promise<void>;
  onCopyExtensionJson: () => void | Promise<void>;
  onDownloadExtension: () => void;
}

export function ExportHub(props: ExportHubProps) {
  const {
    isSynthesizingReport,
    studentProfile,
    showProfileEditor,
    exportingType,
    exportSuccessToast,
    canvaBannerOpen,
    copiedCanvaDraft,
    copiedExtensionJson,
    selectedPreset,
    isBulkSelectionActive,
    selectedExportEntryIds,
    bulkExportSearchQuery,
    bulkExportFilterType,
    setCanvaBannerOpen,
    setCopiedCanvaDraft,
    setIsExtensionModalOpen,
    setShowProfileEditor,
    setBulkExportFilterType,
    setBulkExportSearchQuery,
    logoInputRef,
    onUpdateProfile: handleUpdateProfile,
    onLogoUpload: handleLogoUpload,
    onRemoveLogo: handleRemoveLogo,
    onPresetChange: handlePresetChange,
    onGetEntriesForExport: getEntriesForExport,
    onGetSelectedEntriesForExport: getSelectedEntriesForExport,
    onToggleBulkSelectEntry: handleToggleBulkSelectEntry,
    onSelectAllExportEntries: handleSelectAllExportEntries,
    onDeselectAllExportEntries: handleDeselectAllExportEntries,
    onSelectRecentExportEntries: handleSelectRecentExportEntries,
    onToggleBulkSelectionMode: handleToggleBulkSelectionMode,
    onOpenLivePreview: handleOpenLivePreview,
    onExportExcel: handleExportExcel,
    onExportWord: handleExportWord,
    onSynthesizeAndExportWord: handleSynthesizeAndExportWord,
    onExportPowerPoint: handleExportPowerPoint,
    onSyncDirectToExtension: handleSyncDirectToExtension,
    onOpenDriveSyncModal: handleOpenDriveSyncModal,
    onBuildCanvaPosterDraft: buildCanvaPosterDraft,
    onOpenCanvaPoster: handleOpenCanvaPoster,
    onCopyExtensionJson: handleCopyExtensionJson,
    onDownloadExtension: handleDownloadExtension,
  } = props;

  return (
          <section className="bg-white dark:bg-zinc-900/60 rounded-xl p-5 sm:p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md mb-1">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Hub Ekspor Dokumen</span>
                </div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Ekspor & Integrasi Dokumen Resmi
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Unduh seluruh riwayat logbook ke format resmi kampus atau sinkronkan ke cloud.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleOpenLivePreview}
                  disabled={getSelectedEntriesForExport().length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview Dokumen</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleBulkSelectionMode}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                    isBulkSelectionActive
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 shadow-2xs"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isBulkSelectionActive ? "Tutup Mode Seleksi" : "Pilih Entri Kustom (Bulk Select)"}</span>
                  {isBulkSelectionActive && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 dark:bg-zinc-900/20">
                      {getSelectedEntriesForExport().length}/{getEntriesForExport().length}
                    </span>
                  )}
                </button>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    {isBulkSelectionActive
                      ? `${getSelectedEntriesForExport().length} Terpilih`
                      : `${getEntriesForExport().length} Entri Siap Diekspor`}
                  </span>
                </div>
              </div>
            </div>

            {/* Pilihan Preset Pedoman Kampus */}
            <div className="rounded-lg bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    Preset Pedoman Kampus (.docx & .pptx)
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                  {KAMPUS_PRESETS.find((p) => p.value === selectedPreset)?.badge}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {KAMPUS_PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.value;
                  return (
                    <div
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-800 shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-800 bg-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-medium text-xs text-zinc-900 dark:text-zinc-100">
                          {preset.label}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

<BulkExportPanel
            exportingType={exportingType}
            isBulkSelectionActive={isBulkSelectionActive}
            selectedExportEntryIds={selectedExportEntryIds}
            bulkExportSearchQuery={bulkExportSearchQuery}
            bulkExportFilterType={bulkExportFilterType}
            setBulkExportFilterType={setBulkExportFilterType}
            setBulkExportSearchQuery={setBulkExportSearchQuery}
            getEntriesForExport={getEntriesForExport}
            getSelectedEntriesForExport={getSelectedEntriesForExport}
            handleToggleBulkSelectEntry={handleToggleBulkSelectEntry}
            handleSelectAllExportEntries={handleSelectAllExportEntries}
            handleDeselectAllExportEntries={handleDeselectAllExportEntries}
            handleSelectRecentExportEntries={handleSelectRecentExportEntries}
            handleToggleBulkSelectionMode={handleToggleBulkSelectionMode}
            handleOpenLivePreview={handleOpenLivePreview}
            handleExportExcel={handleExportExcel}
            handleExportWord={handleExportWord}
            />
<ProfileCoverPanel
            studentProfile={studentProfile}
            showProfileEditor={showProfileEditor}
            setShowProfileEditor={setShowProfileEditor}
            logoInputRef={logoInputRef}
            handleUpdateProfile={handleUpdateProfile}
            handleLogoUpload={handleLogoUpload}
            handleRemoveLogo={handleRemoveLogo}
            />
<ExportDownloadActions
            isSynthesizingReport={isSynthesizingReport}
            exportingType={exportingType}
            exportSuccessToast={exportSuccessToast}
            isBulkSelectionActive={isBulkSelectionActive}
            getSelectedEntriesForExport={getSelectedEntriesForExport}
            handleExportExcel={handleExportExcel}
            handleExportWord={handleExportWord}
            handleSynthesizeAndExportWord={handleSynthesizeAndExportWord}
            handleExportPowerPoint={handleExportPowerPoint}
            />
<CloudCanvaExtensionPanel
            canvaBannerOpen={canvaBannerOpen}
            copiedCanvaDraft={copiedCanvaDraft}
            copiedExtensionJson={copiedExtensionJson}
            setCanvaBannerOpen={setCanvaBannerOpen}
            setCopiedCanvaDraft={setCopiedCanvaDraft}
            setIsExtensionModalOpen={setIsExtensionModalOpen}
            handleSyncDirectToExtension={handleSyncDirectToExtension}
            handleOpenDriveSyncModal={handleOpenDriveSyncModal}
            buildCanvaPosterDraft={buildCanvaPosterDraft}
            handleOpenCanvaPoster={handleOpenCanvaPoster}
            handleCopyExtensionJson={handleCopyExtensionJson}
            handleDownloadExtension={handleDownloadExtension}
            />
          </section>
  );
}
