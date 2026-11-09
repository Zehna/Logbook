import React from "react";
import {
  RotateCcw,
  Upload,
  Check,
} from "lucide-react";
import {
  StudentProfile,
} from "@/src/lib/exporters/types";

interface SignatureTabSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  clearCanvas: () => void;
  drawMove: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  fileUploadRef: React.RefObject<HTMLInputElement | null>;
  generateAutoParafStamp: () => void;
  handleRemoveSignature: () => void;
  handleSaveSignature: () => void;
  handleUploadSignatureImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setActiveSigner: React.Dispatch<React.SetStateAction<"mahasiswa" | "mentor">>;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  studentProfile: StudentProfile;
  activeSigner: "mahasiswa" | "mentor";
}

export function SignatureTabSection({ canvasRef, clearCanvas, drawMove, fileUploadRef, generateAutoParafStamp, handleRemoveSignature, handleSaveSignature, handleUploadSignatureImage, setActiveSigner, startDrawing, stopDrawing, studentProfile, activeSigner }: SignatureTabSectionProps) {
  return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 7 Cols: Interactive Canvas Pad */}
              <div className="lg:col-span-7 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveSigner("mahasiswa")}
                      className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                        activeSigner === "mahasiswa"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      Tanda Tangan Mahasiswa
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSigner("mentor")}
                      className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                        activeSigner === "mentor"
                          ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      E-Paraf / TTD Mentor &amp; DPL
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={generateAutoParafStamp}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      Buat Paraf Otomatis
                    </button>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                      title="Bersihkan Kanvas"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Drawing Canvas */}
                <div className="rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white overflow-hidden relative">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={drawMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawMove}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair touch-none"
                  />
                  <div className="px-3 py-1.5 bg-zinc-50 border-t border-zinc-200 text-[11px] text-zinc-500 flex items-center justify-between">
                    <span>
                      Goreskan tanda tangan di atas menggunakan mouse/layar sentuh untuk:{" "}
                      <strong className="text-zinc-800">
                        {activeSigner === "mahasiswa"
                          ? studentProfile.namaMahasiswa
                          : studentProfile.namaPembimbing}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileUploadRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleUploadSignatureImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileUploadRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload PNG TTD</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveSignature}
                      className="px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      Hapus TTD
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSignature}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan ke Dokumen Logbook</span>
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Preview of Saved Signatures */}
              <div className="lg:col-span-5 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/60 dark:bg-zinc-900/50 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Pratinjau Lembar Pengesahan Aktif
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Tanda tangan di bawah ini otomatis muncul pada Live Preview A4 (Word &amp; PDF) ketika Anda mengekspor logbook.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center bg-white text-zinc-900 p-3.5 rounded-lg border border-zinc-200 text-xs">
                  <div className="space-y-2 border-r border-zinc-100 pr-2">
                    <p className="text-[10px] text-zinc-500">Pembimbing / Mentor</p>
                    <div className="h-16 flex items-center justify-center">
                      {studentProfile.ttdMentorBase64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={studentProfile.ttdMentorBase64}
                          alt="TTD Mentor"
                          className="max-h-14 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Belum ada E-Paraf</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold underline truncate">
                      {studentProfile.namaPembimbing || "Nama Mentor"}
                    </p>
                  </div>

                  <div className="space-y-2 pl-2">
                    <p className="text-[10px] text-zinc-500">Mahasiswa Peserta</p>
                    <div className="h-16 flex items-center justify-center">
                      {studentProfile.ttdMahasiswaBase64 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={studentProfile.ttdMahasiswaBase64}
                          alt="TTD Mahasiswa"
                          className="max-h-14 object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-400 italic">Belum ada TTD</span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold underline truncate">
                      {studentProfile.namaMahasiswa || "Nama Mahasiswa"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
  );
}
