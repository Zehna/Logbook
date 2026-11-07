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
  AlertTriangle,
  ExternalLink,
  UserCheck,
  Copy,
  Check,
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

interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  isUnauthorizedDomain: boolean;
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
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [hasCopiedDomain, setHasCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  const handleCopyHostname = () => {
    navigator.clipboard.writeText(currentHostname);
    setHasCopiedDomain(true);
    toast.success(`Domain "${currentHostname}" disalin ke clipboard!`);
    setTimeout(() => setHasCopiedDomain(false), 2000);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
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
      // Gunakan safe type checking agar tidak memicu unhandled console.error di Next.js dev overlay
      const fbError = err as { code?: string; message?: string };
      const errorCode = fbError?.code || "";
      const errorMsg = fbError?.message || "";

      if (
        errorCode === "auth/unauthorized-domain" ||
        errorMsg.includes("auth/unauthorized-domain")
      ) {
        console.warn(
          `Domain "${currentHostname}" belum diizinkan di Firebase Authentication Authorized Domains.`
        );
        setAuthError({
          code: "auth/unauthorized-domain",
          title: "Domain Belum Terdaftar di Firebase",
          message: `Origin "${currentHostname}" belum ditambahkan ke daftar Authorized Domains pada proyek Firebase. Silakan tambahkan domain ini di Firebase Console atau gunakan Mode Profil Lokal di bawah.`,
          isUnauthorizedDomain: true,
        });
        toast.error("Domain belum diizinkan di Firebase Auth.", {
          description:
            "Gunakan tombol 'Mode Profil Lokal' di bawah untuk langsung menggunakan aplikasi tanpa konfigurasi Firebase.",
          duration: 6000,
        });
      } else if (
        errorCode === "auth/popup-closed-by-user" ||
        errorCode === "auth/cancelled-popup-request"
      ) {
        // Pengguna sengaja menutup jendela popup Google login
        console.warn("Login popup ditutup oleh pengguna.");
      } else {
        console.warn("Gagal login Google:", err);
        const msg =
          err instanceof Error ? err.message : "Terjadi kendala saat masuk.";
        setAuthError({
          code: errorCode || "unknown",
          title: "Gagal Masuk dengan Google",
          message: msg,
          isUnauthorizedDomain: false,
        });
        toast.error(`Gagal masuk: ${msg}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLoginAsLocalGuest = () => {
    const fallbackName =
      nameBeforeLogin.trim() || initialName.trim() || "Mahasiswa MBKM";
    const guestProfile: AppUserProfile = {
      uid: "local-user-" + Date.now().toString(36),
      displayName: fallbackName,
      email: `${fallbackName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@kampus.ac.id`,
      photoURL: "",
      nim: nimBeforeLogin.trim() || initialNim.trim() || "220101019",
      campus:
        campusBeforeLogin.trim() ||
        initialCampus.trim() ||
        "Universitas Indonesia",
      prodi: "Teknik Informatika",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    onUserChanged(guestProfile);
    toast.success(`Berhasil masuk sebagai ${guestProfile.displayName}!`, {
      description:
        "Mode Profil Lokal aktif. Seluruh fitur logbook, konversi SKS, simulator sidang, dan ekspor dokumen siap digunakan penuh.",
    });
    onClose();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
      onUserChanged(null);
      toast.info("Anda telah keluar dari akun.");
      onClose();
    } catch (err) {
      console.warn("Gagal logout:", err);
      onUserChanged(null);
      toast.info("Anda telah keluar dari akun.");
      onClose();
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
                {currentUser
                  ? firebaseUser
                    ? "Tersambung ke Cloud Firestore"
                    : "Profil Lokal (Offline / Dev Mode)"
                  : "Autentikasi & Basis Data Mahasiswa"}
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
          {currentUser ? (
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

              {/* Data Identitas Tersimpan */}
              <div className="space-y-2 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-white dark:bg-zinc-900 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Status Basis Data</span>
                  </span>
                  {firebaseUser ? (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Tersinkronisasi Realtime
                    </span>
                  ) : (
                    <span className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Mode Profil Lokal (Aktif)
                    </span>
                  )}
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
                    <span className="text-zinc-400 block">Identitas Penyimpanan:</span>
                    <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 truncate block">
                      {firebaseUser
                        ? `users/${currentUser.uid}`
                        : `local-browser/${currentUser.uid}`}
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
                  <span>Kustomisasi Identitas Mahasiswa</span>
                </div>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300/90 leading-relaxed">
                  Isi identitas Anda di bawah. Anda dapat masuk langsung menggunakan Akun Google (Cloud Firestore) atau Mode Profil Lokal instan.
                </p>
              </div>

              {/* Alert jika terjadi kendala auth/unauthorized-domain */}
              {authError && (
                <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <p className="font-semibold text-xs text-amber-950 dark:text-amber-100">
                        {authError.title}
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
                        {authError.message}
                      </p>

                      {authError.isUnauthorizedDomain && (
                        <div className="pt-1.5 space-y-1.5 text-[11px]">
                          <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800">
                            <span className="text-[10px] text-amber-700 dark:text-amber-300">
                              Domain yang perlu didaftarkan:
                            </span>
                            <code className="font-mono font-bold text-amber-900 dark:text-amber-100 text-xs">
                              {currentHostname}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopyHostname}
                              className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-medium hover:bg-amber-300 transition"
                            >
                              {hasCopiedDomain ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                              <span>{hasCopiedDomain ? "Tersalin" : "Salin"}</span>
                            </button>
                          </div>

                          <a
                            href="https://console.firebase.google.com/project/gen-lang-client-0128547553/authentication/settings"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-100 underline hover:text-amber-700 transition pt-0.5"
                          >
                            <span>Buka Pengaturan Firebase Console</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
              <div className="space-y-2 pt-1">
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
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                  <span className="shrink-0 px-2.5 text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">
                    Atau Coba Langsung
                  </span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                </div>

                {/* Local Guest / Offline Mode Login Button */}
                <button
                  type="button"
                  onClick={handleLoginAsLocalGuest}
                  className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                >
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Gunakan Mode Profil Lokal (Tamu / Offline)</span>
                </button>
              </div>

              {/* Security info footer */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Mode Profil Lokal menyimpan data di browser secara aman tanpa perlu login.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
