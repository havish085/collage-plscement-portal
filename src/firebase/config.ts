import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyApsuS9LoUy-iPTEuMaASsA5peSOUB8Em8",
  authDomain: "collage-placement-portal.firebaseapp.com",
  projectId: "collage-placement-portal",
  storageBucket: "collage-placement-portal.firebasestorage.app",
  messagingSenderId: "1094626541655",
  appId: "1:1094626541655:web:d6392563a59a0f0f6ea312",
  measurementId: "G-VNBCWNWT0N"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const emailProvider = new EmailAuthProvider();
