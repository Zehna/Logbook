"use client";

import React from "react";
import {
  UserCheck,
  ChevronDown,
  ChevronUp,
  ImagePlus,
} from "lucide-react";
import type { StudentProfile } from "@/src/lib/exporters/types";

/** Pengaturan biodata cover Word & slide sidang (nama, NIM, mitra, logo kampus).
 * Dipindah verbatim dari ExportHub (fase 2) — props diteruskan dari induk. */
export interface ProfileCoverPanelProps {
  studentProfile: StudentProfile;
  showProfileEditor: boolean;
  setShowProfileEditor: (value: boolean | ((prev: boolean) => boolean)) => void;
  logoInputRef: React.RefObject<HTMLInputElement | null>;
  handleUpdateProfile: (field: keyof StudentProfile, value: string) => void;
  handleLogoUpload: (file: File) => void;
  handleRemoveLogo: () => void;
}

export function ProfileCoverPanel(props: ProfileCoverPanelProps) {
  const {
    studentProfile,
    showProfileEditor,
    setShowProfileEditor,
    logoInputRef,
    handleUpdateProfile,
    handleLogoUpload,
    handleRemoveLogo,
  } = props;

  return (
    <>
            {/* Pengaturan Opsional Biodata Cover Word & Slide Sidang */}
            <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowProfileEditor((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>
                    Identitas Cover Laporan & Slide Sidang (Nama, NIM, Mitra, Logo)
                  </span>
                </span>
                {showProfileEditor ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showProfileEditor && (
                <div className="p-4 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Lengkap Mahasiswa
                    </label>
                    <input
                      type="text"
                      value={studentProfile.namaMahasiswa}
                      onChange={(e) =>
                        handleUpdateProfile("namaMahasiswa", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      NIM Mahasiswa
                    </label>
                    <input
                      type="text"
                      value={studentProfile.nim}
                      onChange={(e) =>
                        handleUpdateProfile("nim", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Program Studi
                    </label>
                    <input
                      type="text"
                      value={studentProfile.programStudi}
                      onChange={(e) =>
                        handleUpdateProfile("programStudi", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Perguruan Tinggi
                    </label>
                    <input
                      type="text"
                      value={studentProfile.perguruanTinggi}
                      onChange={(e) =>
                        handleUpdateProfile("perguruanTinggi", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Mitra / Instansi / Desa KKN
                    </label>
                    <input
                      type="text"
                      value={studentProfile.namaMitra}
                      onChange={(e) =>
                        handleUpdateProfile("namaMitra", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dosen Pembimbing / Mentor
                    </label>
                    <input
                      type="text"
                      value={studentProfile.namaPembimbing}
                      onChange={(e) =>
                        handleUpdateProfile("namaPembimbing", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>

                  {/* Upload Logo Kampus */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-700">
                        Logo Kampus / Universitas (PNG/JPG)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Otomatis disematkan di Cover Laporan Word (.docx) dan Slide Judul PowerPoint (.pptx).
                      </p>
                    </div>

                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                    />

                    {studentProfile.logoKampusBase64 ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white p-0.5 shrink-0 shadow-2xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={studentProfile.logoKampusBase64}
                            alt="Logo Kampus"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
                        >
                          Hapus Logo
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Upload Logo Kampus</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

    </>
  );
}
