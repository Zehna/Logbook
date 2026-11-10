"use client";

import React from "react";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Check,
  Copy,
  FileText,
  GraduationCap,
  Layers,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { LogbookTemplateSnippet } from "@/src/lib/types/modules";

const CATEGORY_FILTERS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "Semua", icon: Layers },
  { id: "Magang MBKM", label: "Magang MBKM", icon: Briefcase },
  { id: "MSIB", label: "MSIB", icon: GraduationCap },
  { id: "KKN", label: "KKN Desa", icon: Users },
  { id: "Umum / Rutinitas", label: "Umum", icon: FileText },
  { id: "Kustom", label: "⭐ Kustom Saya", icon: Bookmark },
];

export interface TemplateListProps {
  templates: LogbookTemplateSnippet[];
  filteredTemplates: LogbookTemplateSnippet[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (category: string) => void;
  copiedId: string | null;
  onCopyContent: (e: React.MouseEvent, id: string, content: string) => void;
  onDeleteTemplate: (id: string, title: string) => void;
  onSelectTemplate: (snippet: string, mode: "replace" | "append") => void;
  onStartCreating: () => void;
  onClose: () => void;
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  filteredTemplates,
  searchQuery,
  onSearchQueryChange,
  selectedCategory,
  onSelectedCategoryChange,
  copiedId,
  onCopyContent,
  onDeleteTemplate,
  onSelectTemplate,
  onStartCreating,
  onClose,
}) => {
  return (
    <>
      <div className="p-3.5 sm:px-5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5 bg-white dark:bg-zinc-900">
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Cari templat snippet berdasarkan judul atau teks..."
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onStartCreating}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium shrink-0 transition cursor-pointer shadow-2xs"
        title="Tambah snippet templat kustom baru"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Templat Baru</span>
      </button>
    </div>

    {/* Category Pills */}
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
      {CATEGORY_FILTERS.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;
        const count =
          cat.id === "all"
            ? templates.length
            : cat.id === "Kustom"
            ? templates.filter((t) => t.isCustom).length
            : templates.filter((t) => t.category === cat.id).length;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectedCategoryChange(cat.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition cursor-pointer border ${
              isSelected
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold"
                : "bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Icon className="w-3 h-3" />
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1 rounded-full ${
                isSelected
                  ? "bg-zinc-700 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-900"
                  : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-500"
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  </div>

  {/* Template Cards List */}
  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 min-h-[260px] max-h-[52vh]">
    {filteredTemplates.length === 0 ? (
      <div className="text-center py-12 px-4 space-y-3">
        <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
          <Bookmark className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Tidak ada templat yang cocok
          </h3>
          <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada snippet dengan kata kunci "${searchQuery}". Coba kata kunci lain atau bersihkan pencarian.`
              : "Kategori ini belum memiliki templat snippet. Klik tombol 'Templat Baru' untuk menambahkannya."}
          </p>
        </div>
      </div>
    ) : (
      filteredTemplates.map((tpl) => (
        <div
          key={tpl.id}
          className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition group"
        >
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {tpl.title}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/60">
                  {tpl.category}
                </span>
                {tpl.isCustom && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                    Kustom
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                &quot;{tpl.content}&quot;
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => onCopyContent(e, tpl.id, tpl.content)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Salin teks snippet"
              >
                {copiedId === tpl.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {tpl.isCustom && (
                <button
                  type="button"
                  onClick={() => onDeleteTemplate(tpl.id, tpl.title)}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  title="Hapus templat kustom ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* One-click Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 mt-2">
            <span className="text-[10px] text-zinc-400">
              {tpl.content.split(/\s+/).length} kata
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(tpl.content, "append");
                  onClose();
                  toast.success(`Snippet "${tpl.title}" ditambahkan ke catatan.`);
                }}
                className="text-[11px] px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
                title="Tambahkan di akhir teks catatan saat ini"
              >
                + Tambah ke Akhir
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectTemplate(tpl.content, "replace");
                  onClose();
                  toast.success(`Catatan diganti dengan templat "${tpl.title}".`);
                }}
                className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer shadow-2xs"
                title="Ganti isi catatan kegiatan dengan templat ini"
              >
                <span>Gunakan Templat</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))
    )}
      </div>
    </>
  );
};
