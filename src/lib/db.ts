import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserRole, TenantStatus } from "@/types";

/* ── Users ────────────────────────────────────────────────────────────── */

export async function createUserDoc(uid: string, email: string, role: UserRole) {
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    role,
    activePropertyId: null,
    propertyIds: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserDoc(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export async function updateUserActiveProperty(uid: string, propertyId: string) {
  await updateDoc(doc(db, "users", uid), {
    activePropertyId: propertyId,
    propertyIds: arrayUnion(propertyId),
    updatedAt: serverTimestamp(),
  });
}

/* ── Properties ───────────────────────────────────────────────────────── */

export interface CreatePropertyInput {
  name: string;
  type: "HOSTEL" | "PG" | "COLIVING";
  city: string;
  address: string;
  totalRooms?: number;
  bedsPerRoom?: number;
  defaultRent?: number | null;
  defaultDeposit?: number | null;
  dueDay?: number | null;
  requireApproval: boolean;
}

export async function createProperty(
  ownerUid: string,
  data: CreatePropertyInput
): Promise<string> {
  // Firestore does not support `undefined` field values — strip them out
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  const ref = await addDoc(collection(db, "properties"), {
    ...cleaned,
    ownerUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getProperty(propertyId: string) {
  const snap = await getDoc(doc(db, "properties", propertyId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/* ── Invites ──────────────────────────────────────────────────────────── */

function randomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "COZY-";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function generateInvite(
  ownerUid: string,
  propertyId: string,
  requireApproval: boolean
): Promise<string> {
  let code = randomCode();
  for (let i = 0; i < 10; i++) {
    const snap = await getDoc(doc(db, "invites", code));
    if (!snap.exists()) break;
    code = randomCode();
  }

  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  await setDoc(doc(db, "invites", code), {
    code,
    propertyId,
    type: "PROPERTY",
    status: "ACTIVE",
    requireApproval,
    expiresAt,
    createdBy: ownerUid,
    createdAt: serverTimestamp(),
  });

  return code;
}

export async function validateInvite(code: string) {
  const snap = await getDoc(doc(db, "invites", code.toUpperCase().trim()));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== "ACTIVE") return null;
  const expires = (data.expiresAt as Timestamp).toDate();
  if (expires < new Date()) return null;
  return data as { propertyId: string; requireApproval: boolean; code: string };
}

/* ── Tenants ──────────────────────────────────────────────────────────── */

export async function joinProperty(
  uid: string,
  email: string,
  propertyId: string,
  requireApproval: boolean
): Promise<TenantStatus> {
  const status: TenantStatus = requireApproval ? "PENDING_APPROVAL" : "ACTIVE";
  await setDoc(doc(db, "properties", propertyId, "tenants", uid), {
    uid,
    name: email.split("@")[0],
    email,
    status,
    bedId: null,
    rentMonthly: null,
    deposit: null,
    moveInDate: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return status;
}

export async function getTenantRecord(propertyId: string, tenantUid: string) {
  const snap = await getDoc(
    doc(db, "properties", propertyId, "tenants", tenantUid)
  );
  return snap.exists() ? (snap.data() as { status: TenantStatus; email: string; name: string }) : null;
}

export async function listPendingTenants(propertyId: string) {
  const q = query(
    collection(db, "properties", propertyId, "tenants"),
    where("status", "==", "PENDING_APPROVAL")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as { uid: string; email: string; name: string; createdAt: unknown });
}

export async function approveTenant(propertyId: string, tenantUid: string) {
  await updateDoc(doc(db, "properties", propertyId, "tenants", tenantUid), {
    status: "ACTIVE",
    updatedAt: serverTimestamp(),
  });
}

export async function rejectTenant(propertyId: string, tenantUid: string) {
  await updateDoc(doc(db, "properties", propertyId, "tenants", tenantUid), {
    status: "REJECTED",
    updatedAt: serverTimestamp(),
  });
}
