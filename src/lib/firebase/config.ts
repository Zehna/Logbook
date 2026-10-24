import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
} from "firebase/firestore";
import firebaseConfig from "@/firebase-applet-config.json";

// Inisialisasi Firebase App (Singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Sesuai panduan Firestore Enterprise / Multi-DB AI Studio
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

if (typeof window !== "undefined") {
  (async function testConnection() {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.error("Please check your Firebase configuration.");
      }
    }
  })();
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface AppUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  nim?: string;
  campus?: string;
  prodi?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

// Simpan atau perbarui user di database Firestore
export async function syncUserToFirestore(
  fbUser: FirebaseUser,
  customName?: string,
  extraData?: { nim?: string; campus?: string; prodi?: string }
): Promise<AppUserProfile> {
  const userRef = doc(db, "users", fbUser.uid);
  const path = `users/${fbUser.uid}`;

  try {
    const existingSnap = await getDoc(userRef);
    const nowIso = new Date().toISOString();

    if (existingSnap.exists()) {
      const existing = existingSnap.data() as AppUserProfile;
      const updatedData: Partial<AppUserProfile> = {
        lastLoginAt: nowIso,
        displayName: customName?.trim() || existing.displayName || fbUser.displayName || "Mahasiswa MBKM",
        email: fbUser.email || existing.email,
        photoURL: fbUser.photoURL || existing.photoURL || "",
      };

      if (extraData?.nim) updatedData.nim = extraData.nim.trim();
      if (extraData?.campus) updatedData.campus = extraData.campus.trim();
      if (extraData?.prodi) updatedData.prodi = extraData.prodi.trim();

      await updateDoc(userRef, updatedData);
      return { ...existing, ...updatedData };
    } else {
      const newProfile: AppUserProfile = {
        uid: fbUser.uid,
        displayName: customName?.trim() || fbUser.displayName || "Mahasiswa MBKM",
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || "",
        nim: extraData?.nim?.trim() || "",
        campus: extraData?.campus?.trim() || "",
        prodi: extraData?.prodi?.trim() || "",
        createdAt: nowIso,
        lastLoginAt: nowIso,
      };

      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

// Ambil profil user dari Firestore
export async function getUserFromFirestore(uid: string): Promise<AppUserProfile | null> {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as AppUserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
