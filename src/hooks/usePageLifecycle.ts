"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, getUserFromFirestore, AppUserProfile } from "@/src/lib/firebase/config";
import {
  autoMigrateFromLocalStorage,
  getStorageUsageEstimate,
  getStoredHistory,
  getStoredProfile,
  getStoredMentorData,
  getStoredSksCourses,
  getStoredOfflineDrafts,
  getStoredTemplates,
  getStoredDailyAutoSave,
  saveStoredDailyAutoSave,
  clearStoredDailyAutoSave,
  OfflineDraftItem,
  StorageEstimateInfo,
} from "@/src/lib/storage/indexedDbStore";
import {
  STORAGE_HISTORY_KEY,
  STORAGE_LICENSE_KEY,
  STORAGE_PROFILE_KEY,
  STORAGE_PRO_KEY,
  STORAGE_QUOTA_KEY,
} from "@/src/lib/config/storageKeys";
import { KampusPreset, LogbookEntry, StudentProfile } from "@/src/lib/exporters/types";
import { MentorAdminData } from "@/src/lib/exporters/exportAdminDocs";
import { LicenseInfo, LogbookTemplateSnippet } from "@/src/lib/types/modules";

/**
 * Efek lifecycle HomePage: auth Firebase, tema, hidrasi localStorage +
 * migrasi IndexedDB, sinkronisasi ref catatan, auto-save 30 detik,
 * listener online/offline, dan ack live bridge ekstensi Chrome.
 * Sebelumnya 7 useEffect inline di app/page.tsx (baris 278-603), dipindah
 * verbatim ke sini dengan urutan eksekusi dan cleanup yang sama.
 * State tetap di HomePage dan masuk lewat deps eksplisit.
 */

interface UsePageLifecycleDeps {
  mode: "daily" | "weekly" | "monthly";
  catatan: string;
  catatanRef: { current: string };
  lastSavedCatatanRef: { current: string };
  triggerToast: (msg: string, description?: string) => void;
  setCurrentUserProfile: React.Dispatch<React.SetStateAction<AppUserProfile | null>>;
  setStudentProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  setCurrentFbUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>;
  setIsAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  setUsedQuota: React.Dispatch<React.SetStateAction<number>>;
  setIsPro: React.Dispatch<React.SetStateAction<boolean>>;
  setLicenseDetails: React.Dispatch<React.SetStateAction<LicenseInfo | null>>;
  setHistory: React.Dispatch<React.SetStateAction<LogbookEntry[]>>;
  setSelectedPreset: React.Dispatch<React.SetStateAction<KampusPreset>>;
  setMentorAdminData: React.Dispatch<React.SetStateAction<MentorAdminData | null>>;
  setSksCoursesContext: React.Dispatch<React.SetStateAction<string>>;
  setTemplateSnippets: React.Dispatch<React.SetStateAction<LogbookTemplateSnippet[]>>;
  setCatatan: React.Dispatch<React.SetStateAction<string>>;
  setLastAutoSavedAt: React.Dispatch<React.SetStateAction<string | null>>;
  setStorageInfo: React.Dispatch<React.SetStateAction<StorageEstimateInfo | null>>;
  setOfflineDrafts: React.Dispatch<React.SetStateAction<OfflineDraftItem[]>>;
  setIsHydrated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  setExtensionSyncAck: React.Dispatch<React.SetStateAction<boolean>>;
}

export function usePageLifecycle(deps: UsePageLifecycleDeps) {
  const {
    mode,
    catatan,
    catatanRef,
    lastSavedCatatanRef,
    triggerToast,
    setCurrentUserProfile,
    setStudentProfile,
    setCurrentFbUser,
    setIsAuthLoading,
    setIsDarkMode,
    setUsedQuota,
    setIsPro,
    setLicenseDetails,
    setHistory,
    setSelectedPreset,
    setMentorAdminData,
    setSksCoursesContext,
    setTemplateSnippets,
    setCatatan,
    setLastAutoSavedAt,
    setStorageInfo,
    setOfflineDrafts,
    setIsHydrated,
    setIsOnline,
    setExtensionSyncAck,
  } = deps;

  // Listener Autentikasi Firebase & Profil Lokal
  useEffect(() => {
    // Muat profil lokal yang tersimpan jika ada
    if (typeof window !== "undefined") {
      const savedLocal = localStorage.getItem("logmagang_local_user");
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          setCurrentUserProfile(parsed);
          setStudentProfile((prev) => ({
            ...prev,
            namaMahasiswa: parsed.displayName || prev.namaMahasiswa,
            nim: parsed.nim || prev.nim,
            perguruanTinggi: parsed.campus || prev.perguruanTinggi,
            programStudi: parsed.prodi || prev.programStudi,
          }));
        } catch {
          // ignore corrupted local user
        }
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentFbUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserFromFirestore(fbUser.uid);
          if (profile) {
            setCurrentUserProfile(profile);
            if (typeof window !== "undefined") {
              localStorage.setItem("logmagang_local_user", JSON.stringify(profile));
            }
            setStudentProfile((prev) => ({
              ...prev,
              namaMahasiswa: profile.displayName || prev.namaMahasiswa,
              nim: profile.nim || prev.nim,
              perguruanTinggi: profile.campus || prev.perguruanTinggi,
              programStudi: profile.prodi || prev.programStudi,
            }));
          } else {
            const fallbackProfile: AppUserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || "Mahasiswa MBKM",
              email: fbUser.email || "",
              photoURL: fbUser.photoURL || "",
            };
            setCurrentUserProfile(fallbackProfile);
            if (typeof window !== "undefined") {
              localStorage.setItem("logmagang_local_user", JSON.stringify(fallbackProfile));
            }
          }
        } catch (e) {
          console.warn("Gagal fetch user profile dari Firestore:", e);
        }
      } else {
        // Jika tidak ada user Firebase, cek apakah user sedang login dengan profil lokal
        if (typeof window !== "undefined") {
          const savedLocal = localStorage.getItem("logmagang_local_user");
          if (!savedLocal) {
            setCurrentUserProfile(null);
          }
        } else {
          setCurrentUserProfile(null);
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Inisialisasi tema gelap/terang dari preferensi tersimpan
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("logmagang_theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Hidrasi state dari localStorage + migrasi IndexedDB
  useEffect(() => {
    let isMounted = true;

    try {
      const savedQuota = localStorage.getItem(STORAGE_QUOTA_KEY);
      const savedPro = localStorage.getItem(STORAGE_PRO_KEY);
      const savedLicense = localStorage.getItem(STORAGE_LICENSE_KEY);
      const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
      const savedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);

      if (savedQuota !== null) {
        const parsed = parseInt(savedQuota, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          setUsedQuota(parsed);
        }
      }
      if (savedPro === "true") {
        setIsPro(true);
      }
      if (savedLicense) {
        try {
          const parsedLicense = JSON.parse(savedLicense);
          setLicenseDetails(parsedLicense);
        } catch {
          // ignore
        }
      }
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);
          if (Array.isArray(parsedHistory)) {
            setHistory(parsedHistory);
          }
        } catch {
          // ignore
        }
      }
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && typeof parsedProfile === "object") {
            setStudentProfile((prev) => ({ ...prev, ...parsedProfile }));
            if (parsedProfile.kampusPreset) {
              setSelectedPreset(parsedProfile.kampusPreset);
            }
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // Abaikan jika akses localStorage dibatasi
    } finally {
      setIsHydrated(true);
    }

    // Inisialisasi & Auto-Migrasi ke IndexedDB Native Engine
    (async () => {
      try {
        await autoMigrateFromLocalStorage();
        const [idbHistory, idbProfile, idbMentor, idbCourses, idbTemplates, idbDailyAutoSave] = await Promise.all([
          getStoredHistory(),
          getStoredProfile(),
          getStoredMentorData(),
          getStoredSksCourses(),
          getStoredTemplates(),
          getStoredDailyAutoSave(),
        ]);

        if (!isMounted) return;

        if (idbHistory && idbHistory.length > 0) {
          setHistory(idbHistory);
        }
        if (idbProfile) {
          setStudentProfile((prev) => ({ ...prev, ...idbProfile }));
          if (idbProfile.kampusPreset) {
            setSelectedPreset(idbProfile.kampusPreset);
          }
        }
        if (idbMentor) {
          setMentorAdminData(idbMentor);
        }
        if (idbCourses) {
          setSksCoursesContext(idbCourses);
        }
        if (idbTemplates && idbTemplates.length > 0) {
          setTemplateSnippets(idbTemplates);
        }
        if (idbDailyAutoSave && idbDailyAutoSave.catatan.trim()) {
          setCatatan((prev) => (prev.trim() ? prev : idbDailyAutoSave.catatan));
          catatanRef.current = idbDailyAutoSave.catatan;
          lastSavedCatatanRef.current = idbDailyAutoSave.catatan;
          const parsedTime = new Date(idbDailyAutoSave.updatedAt);
          if (!isNaN(parsedTime.getTime())) {
            setLastAutoSavedAt(
              parsedTime.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            );
          }
        }

        const est = await getStorageUsageEstimate();
        const drafts = await getStoredOfflineDrafts();
        if (isMounted) {
          setStorageInfo(est);
          setOfflineDrafts(drafts);
        }
      } catch (err) {
        console.warn("IndexedDB bootstrap warning:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sinkronisasi ref catatan terbaru agar interval 30 detik tidak ter-reset setiap ketikan
  useEffect(() => {
    catatanRef.current = catatan;
  }, [catatan]);

  // Auto-save catatan ke IndexedDB setiap 30 detik pada mode 'daily'
  useEffect(() => {
    if (mode !== "daily") return;

    const autoSaveInterval = setInterval(async () => {
      const currentCatatan = catatanRef.current;
      if (currentCatatan === lastSavedCatatanRef.current) return;

      try {
        if (currentCatatan.trim()) {
          const savedDraft = await saveStoredDailyAutoSave(currentCatatan);
          lastSavedCatatanRef.current = currentCatatan;
          const timeFormatted = new Date(savedDraft.updatedAt).toLocaleTimeString(
            "id-ID",
            {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }
          );
          setLastAutoSavedAt(timeFormatted);
        } else {
          await clearStoredDailyAutoSave();
          lastSavedCatatanRef.current = "";
          setLastAutoSavedAt(null);
        }
      } catch (err) {
        console.warn("Gagal menyimpan otomatis catatan harian ke IndexedDB:", err);
      }
    }, 30000);

    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [mode]);

  // Listener Status Koneksi Online / Offline untuk Mahasiswa KKN di Pelosok
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const drafts = await getStoredOfflineDrafts();
      setOfflineDrafts(drafts);
      toast.success("🌐 Anda kembali online. Sinkronisasi draf siap dijalankan.");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("⚠️ Koneksi internet terputus. Mode pencatatan draf offline aktif.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Listener Konfirmasi Live Bridge Ekstensi Chrome
  useEffect(() => {
    const handleExtensionAck = (event: MessageEvent) => {
      if (event.data && event.data.source === "LOGMAGANG_EXTENSION_ACK") {
        setExtensionSyncAck(true);
        triggerToast(`⚡ Ekstensi berhasil menerima ${event.data.count || 0} entri secara live!`);
        setTimeout(() => setExtensionSyncAck(false), 3000);
      }
    };
    window.addEventListener("message", handleExtensionAck);
    return () => window.removeEventListener("message", handleExtensionAck);
  }, []);
}
