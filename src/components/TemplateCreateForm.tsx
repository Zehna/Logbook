"use client";

import React from "react";
import { Check } from "lucide-react";

export interface TemplateCreateFormProps {
  newTitle: string;
  onNewTitleChange: (value: string) => void;
  newContent: string;
  onNewContentChange: (value: string) => void;
  newCategory: string;
  onNewCategoryChange: (value: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const TemplateCreateForm: React.FC<TemplateCreateFormProps> = ({
  newTitle,
  onNewTitleChange,
  newContent,
  onNewContentChange,
  newCategory,
  onNewCategoryChange,
  onSave,
  onCancel,
}) => {
  return (
  <form onSubmit={onSave} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
        Buat Snippet Templat Baru
      </span>
      <button
        type="button"
        onClick={() => onCancel()}
        className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
      >
        Batal
      </button>
    </div>

    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        Judul / Label Templat <span className="text-rose-500">*</span>
      </label>
      <input
        type="text"
        value={newTitle}
        onChange={(e) => onNewTitleChange(e.target.value)}
        placeholder='Misal: "Daily Standup & Slicing Figma", "Rekap Nota Finansial"'
        className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        autoFocus
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        Kategori Program
      </label>
      <select
        value={newCategory}
        onChange={(e) => onNewCategoryChange(e.target.value)}
        className="w-full text-xs px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="Magang MBKM">Magang MBKM</option>
        <option value="MSIB">MSIB (Studi Independen)</option>
        <option value="KKN">KKN Desa</option>
        <option value="Umum / Rutinitas">Umum / Rutinitas Kantor</option>
        <option value="Kustom">Kustom / Lainnya</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        Isi Snippet Catatan Harian <span className="text-rose-500">*</span>
      </label>
      <textarea
        rows={4}
        value={newContent}
        onChange={(e) => onNewContentChange(e.target.value)}
        placeholder="Tuliskan draf teks catatan santai yang sering kamu lakukan..."
        className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
      />
      <span className="text-[11px] text-zinc-400 block mt-1">
        Tips: Gunakan gaya bahasa santai/informal. AI LogMagang akan mengonversinya ke narasi Taksonomi Bloom saat generate.
      </span>
    </div>

    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => onCancel()}
        className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
      >
        Batal
      </button>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer shadow-2xs"
      >
        <Check className="w-3.5 h-3.5" />
        <span>Simpan ke Library</span>
      </button>
    </div>
  </form>
  );
};
