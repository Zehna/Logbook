"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Bookmark,
  Search,
  Plus,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Briefcase,
  GraduationCap,
  Users,
  Layers,
  RotateCcw,
  ArrowRight,
  PlusCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
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

const CATEGORY_FILTERS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "all", label: "Semua", icon: Layers },
  { id: "Magang MBKM", label: "Magang MBKM", icon: Briefcase },
  { id: "MSIB", label: "MSIB", icon: GraduationCap },
  { id: "KKN", label: "KKN Desa", icon: Users },
  { id: "Umum / Rutinitas", label: "Umum", icon: FileText },
  { id: "Kustom", label: "⭐ Kustom Saya", icon: Bookmark },
];

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
          <form onSubmit={handleSaveNewTemplate} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                Buat Snippet Templat Baru
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
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
                onChange={(e) => setNewTitle(e.target.value)}
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
                onChange={(e) => setNewCategory(e.target.value)}
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
                onChange={(e) => setNewContent(e.target.value)}
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
                onClick={() => setIsCreating(false)}
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
        ) : (
          <>
            {/* Search and Category Filter Toolbar */}
            <div className="p-3.5 sm:px-5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 space-y-2.5 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari templat snippet berdasarkan judul atau teks..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNewTitle("");
                    setNewContent("");
                    setNewCategory(activeProgram || "Magang MBKM");
                    setIsCreating(true);
                  }}
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
                      onClick={() => setSelectedCategory(cat.id)}
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
                          onClick={(e) => handleCopyContent(e, tpl.id, tpl.content)}
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
                            onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
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
