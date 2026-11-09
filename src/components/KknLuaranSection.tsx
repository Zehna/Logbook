import React from "react";
import {
  Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  type KknLuaranWajibItem,
} from "@/src/lib/data/kknSamples";

interface KknLuaranSectionProps {
  completedLuaranCount: number;
  luaranItems: KknLuaranWajibItem[];
  setLuaranItems: React.Dispatch<React.SetStateAction<KknLuaranWajibItem[]>>;
}

export function KknLuaranSection({ completedLuaranCount, luaranItems, setLuaranItems }: KknLuaranSectionProps) {
  return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xs border border-slate-200 dark:border-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Checklist Pemenuhan Luaran Wajib KKN Tematik &amp; Publikasi SINTA</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pastikan seluruh dokumen luaran wajib LPPM (Buku Saku, Video, Media Massa, dan Jurnal Pengabdian) memiliki tautan bukti yang valid.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              {completedLuaranCount} dari {luaranItems.length} Luaran Tuntas
            </span>
          </div>

          <div className="space-y-3">
            {luaranItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-400">0{idx + 1}.</span>
                      <span className="font-bold text-slate-900 dark:text-zinc-100">
                        {item.kategori}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-zinc-400">
                        {item.targetSpesifikasi}
                      </span>
                    </div>
                  </div>

                  <select
                    value={item.status}
                    onChange={(e) => {
                      const updated = [...luaranItems];
                      updated[idx] = {
                        ...item,
                        status: e.target.value as KknLuaranWajibItem["status"],
                      };
                      setLuaranItems(updated);
                      toast.success(`Status "${item.kategori}" diperbarui.`);
                    }}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="Tuntas / Terbit">Tuntas / Terbit</option>
                    <option value="Proses Review DPL">Proses Review DPL</option>
                    <option value="Penyusunan Draf">Penyusunan Draf</option>
                    <option value="Belum Dimulai">Belum Dimulai</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Judul Luaran / Naskah Publikasi:
                    </label>
                    <input
                      type="text"
                      value={item.judulLuaran}
                      onChange={(e) => {
                        const updated = [...luaranItems];
                        updated[idx] = { ...item, judulLuaran: e.target.value };
                        setLuaranItems(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Tautan Repository / URL Bukti Publikasi:
                    </label>
                    <input
                      type="text"
                      value={item.tautanBukti}
                      onChange={(e) => {
                        const updated = [...luaranItems];
                        updated[idx] = { ...item, tautanBukti: e.target.value };
                        setLuaranItems(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono text-slate-700 dark:text-zinc-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
  );
}
