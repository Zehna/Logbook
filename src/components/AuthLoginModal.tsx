"use client";

import React, { useState } from "react";
import {
  X,
  User,
  GraduationCap,
  Building,
  CheckCircle2,
  LogOut,
  Loader2,
  Sparkles,
  ShieldCheck,
  Database,
  ArrowRight,
  Mail,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  auth,
  googleProvider,
  syncUserToFirestore,
  AppUserProfile,
} from "@/src/lib/firebase/config";
import { signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUserProfile | null;
  firebaseUser: FirebaseUser | null;
  onUserChanged: (user: AppUserProfile | null) => void;
  initialName?: string;
  initialNim?: string;
  initialCampus?: string;
}

export function AuthLoginModal({
  isOpen,
  onClose,
  currentUser,
  firebaseUser,
  onUserChanged,
  initialName = "",
  initialNim = "",
  initialCampus = "",
}: AuthLoginModalProps) {
  const [nameBeforeLogin, setNameBeforeLogin] = useState(initialName);
  const [nimBeforeLogin, setNimBeforeLogin] = useState(initialNim);
  const [campusBeforeLogin, setCampusBeforeLogin] = useState(initialCampus);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Sinkronkan ke Firestore Database
      const profile = await syncUserToFirestore(
        fbUser,
        nameBeforeLogin.trim() || undefined,
        {
          nim: nimBeforeLogin.trim() || undefined,
          campus: campusBeforeLogin.trim() || undefined,
        }
      );

      onUserChanged(profile);
      toast.success(`Selamat datang, ${profile.displayName}!`, {
        description: "Akun dan profil Anda berhasil tersimpan di Firestore database.",
      });
      onClose();
    } catch (err: unknown) {
      console.error("Gagal login Google:", err);
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.";
      toast.error(`Gagal masuk dengan Google: ${msg}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      onUserChanged(null);
      toast.info("Anda telah keluar dari akun.");
      onClose();
    } catch (err) {
      console.error("Gagal logout:", err);
      toast.error("Gagal keluar akun.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              LM
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {currentUser ? "Akun Mahasiswa" : "Masuk ke LogMagang OS"}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {currentUser ? "Tersambung ke Cloud Firestore" : "Autentikasi & Basis Data Cloud Real"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {currentUser && firebaseUser ? (
            /* User Status Screen (Sudah Login) */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
                {currentUser.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-base font-bold">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {currentUser.displayName}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-400" />
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>

              {/* Data Tersimpan di Firestore */}
              <div className="space-y-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-white dark:bg-zinc-900 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Status Database</span>
                  </span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Tersinkronisasi Realtime
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div>
                    <span className="text-zinc-400 block">NIM:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {currentUser.nim || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">Perguruan Tinggi:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate block">
                      {currentUser.campus || "-"}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-zinc-400 block">ID Dokumen Firestore:</span>
                    <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 truncate block">
                      users/{currentUser.uid}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSigningOut ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form Screen (Belum Login) */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Kustomisasi Identitas Sebelum Masuk</span>
                </div>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300/90 leading-relaxed">
                  Isi nama atau identitas Anda terlebih dahulu. Saat login dengan Google, profil akan langsung diintegrasikan dan disimpan permanen di database Firestore.
                </p>
              </div>

              {/* Form Input Nama Sebelum Masuk */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nama Lengkap Mahasiswa
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={nameBeforeLogin}
                      onChange={(e) => setNameBeforeLogin(e.target.value)}
                      placeholder='Contoh: "Ahmad Fadhilah"'
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      NIM (Opsional)
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={nimBeforeLogin}
                        onChange={(e) => setNimBeforeLogin(e.target.value)}
                        placeholder="220101019"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Kampus Asal
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={campusBeforeLogin}
                        onChange={(e) => setCampusBeforeLogin(e.target.value)}
                        placeholder="Universitas Indonesia"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Google Login Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-100 text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-300" />
                      <span>Menyambungkan ke Google...</span>
                    </>
                  ) : (
                    <>
                      {/* Google Logo SVG */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                      <span>Masuk dengan Akun Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security info footer */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Data profil tersimpan aman di Firestore Database gen-lang</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
