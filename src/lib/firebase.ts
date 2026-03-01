import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// Lazy client-only initialization
// Firebase must NOT be initialized during Next.js server builds / SSG because
// the NEXT_PUBLIC_* env vars may not be present in the build environment.
// All Firebase access is therefore guarded behind typeof window checks.
// ---------------------------------------------------------------------------

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage;
  _storage = getStorage(getFirebaseApp());
  return _storage;
}

/**
 * Eagerly-resolved module-level exports.
 * Safe to import from "use client" components only — the IIFE returns a stub
 * during server-side execution so the module can be imported without throwing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverStub = null as any;

export const auth: Auth =
  typeof window !== "undefined" ? getFirebaseAuth() : serverStub;

export const db: Firestore =
  typeof window !== "undefined" ? getFirebaseDb() : serverStub;

export const storage: FirebaseStorage =
  typeof window !== "undefined" ? getFirebaseStorage() : serverStub;

export default getFirebaseApp;
