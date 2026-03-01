"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createAccount, signInAccount, signOut as fbSignOut } from "@/lib/auth";
import { createUserDoc, getUserDoc } from "@/lib/db";
import type { UserProfile, UserRole } from "@/types";

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function fetchProfile(user: User): Promise<UserProfile | null> {
  try {
    const data = await getUserDoc(user.uid);
    if (!data) return null;
    return {
      uid: user.uid,
      email: (data.email as string) ?? user.email ?? "",
      role: data.role as UserRole,
      activePropertyId: (data.activePropertyId as string | null) ?? null,
      propertyIds: (data.propertyIds as string[]) ?? [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await fetchProfile(user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!currentUser) return;
    const profile = await fetchProfile(currentUser);
    setUserProfile(profile);
  }, [currentUser]);

  async function signUp(email: string, password: string, role: UserRole) {
    const { user } = await createAccount(email, password);
    await createUserDoc(user.uid, email, role);
    const profile = await fetchProfile(user);
    setUserProfile(profile);
  }

  async function signIn(email: string, password: string) {
    await signInAccount(email, password);
  }

  async function signOut() {
    await fbSignOut();
    setUserProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, userProfile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
