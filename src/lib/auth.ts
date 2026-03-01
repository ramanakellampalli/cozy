import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth } from "./firebase";

export const createAccount = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInAccount = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signOut = () => fbSignOut(auth);
