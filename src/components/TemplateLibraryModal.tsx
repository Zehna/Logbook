"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Bookmark,
  Sparkles,
  RotateCcw,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { TemplateCreateForm } from "./TemplateCreateForm";
import { TemplateList } from "./TemplateList";
import { LogbookTemplateSnippet, TemplateCategory } from "@/src/lib/types/modules";
import {
  getStoredTemplates,
  addStoredTemplate,
  deleteStoredTemplate,
  resetStoredTemplates,
} from "@/src/lib/storage/indexedDbStore";

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (snippet: string, mode: "replace" | "append") => void;
  currentCatatan?: string;
  activeProgram?: string;
}


export function TemplateLibraryModal({
  isOpen,
  onClose,
  onSelectTemplate,
  currentCatatan = "",
  activeProgram = "Magang MBKM",
}: TemplateLibraryModalProps) {
  const [templates, setTemplates] = useState<LogbookTemplateSnippet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State untuk Tambah / Simpan Baru
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>(activeProgram || "Magang MBKM");

  // Load templates on modal open
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setIsCreating(false);
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const data = await getStoredTemplates();
      setTemplates(data);
    } catch (e) {
      console.error("Gagal memuat template library:", e);
    }
  };

  // Prefill formulir simpan dari catatan saat ini
  const handleOpenSaveCurrent = () => {
    if (!currentCatatan.trim()) {
      toast.info("Catatan kegiatan di formulir masih kosong.", {
        description: "Tuliskan catatan terlebih dahulu atau gunakan '+ Buat Templat Baru'.",
      });
      return;
    }
    // Buat estimasi judul dari 5 kata pertama
    const words = currentCatatan.trim().split(/\s+/).slice(0, 5).join(" ");
    setNewTitle(words ? words.charAt(0).toUpperCase() + words.slice(1) : "Aktivitas Harian");
    setNewContent(currentCatatan.trim());
    setNewCategory(activeProgram || "Magang MBKM");
    setIsCreating(true);
  };

  const handleStartCreating = () => {
    setNewTitle("");
    setNewContent("");
    setNewCategory(activeProgram || "Magang MBKM");
    setIsCreating(true);
  };

  const handleSaveNewTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Judul templat wajib diisi.");
      return;
    }
    if (!newContent.trim()) {
      toast.error("Isi snippet catatan templat wajib diisi.");
      return;
    }

    try {
      await addStoredTemplate({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        isCustom: true,
      });
      toast.success("✨ Templat snippet berhasil disimpan ke library!");
      setIsCreating(false);
      setNewTitle("");
      setNewContent("");
      await loadTemplates();
    } catch {
      toast.error("Gagal menyimpan templat snippet.");
    }
  };

  const handleDeleteTemplate = async (id: string, title: string) => {
    try {
      await deleteStoredTemplate(id);
      toast.success(`Templat "${title}" telah dihapus.`);
      await loadTemplates();
    } catch {
      toast.error("Gagal menghapus templat.");
    }
  };

  const handleResetDefaults = async () => {
    const defs = await resetStoredTemplates();
    setTemplates(defs);
    toast.success("Library templat telah dipulihkan ke bawaan.");
  };

  const handleCopyContent = (e: React.MouseEvent, id: string, content: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Snippet disalin ke clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter list
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Category filter
      if (selectedCategory === "Kustom") {
        if (!tpl.isCustom) return false;
      } else if (selectedCategory !== "all" && tpl.category !== selectedCategory) {
        return false;
      }

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.content.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q)
      );
    });
  }, [templates, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Library Templat Snippet
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                  {templates.length} snippet
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Pilih atau simpan entri rutin untuk disisipkan ke catatan kegiatan dengan 1 klik.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Quick Save current note banner OR Create Form */}
        {!isCreating && currentCatatan.trim() && (
          <div className="px-4 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">
                Ada catatan di formulir: <em className="font-normal opacity-90">&quot;{currentCatatan.slice(0, 50)}...&quot;</em>
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenSaveCurrent}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] shrink-0 transition cursor-pointer shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simpan Catatan Ini Jadi Snippet</span>
            </button>
          </div>
        )}

        {/* Modal Body / Create Form or List */}
        {isCreating ? (
          <TemplateCreateForm
            newTitle={newTitle}
            onNewTitleChange={setNewTitle}
            newContent={newContent}
            onNewContentChange={setNewContent}
            newCategory={newCategory}
            onNewCategoryChange={setNewCategory}
            onSave={handleSaveNewTemplate}
            onCancel={() => setIsCreating(false)}
          />
        ) : (
          <TemplateList
            templates={templates}
            filteredTemplates={filteredTemplates}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectedCategoryChange={setSelectedCategory}
            copiedId={copiedId}
            onCopyContent={handleCopyContent}
            onDeleteTemplate={handleDeleteTemplate}
            onSelectTemplate={onSelectTemplate}
            onStartCreating={handleStartCreating}
            onClose={onClose}
          />
        )}

        {/* Footer */}
        <div className="p-3.5 sm:px-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
            title="Pulihkan templat bawaan"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Bawaan</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
