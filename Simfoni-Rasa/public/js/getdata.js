// firebase-recipes.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6YhPKsphJHtLh96_-Yd_ptLMsu-m5mLw",
  authDomain: "simfoni-rasa.firebaseapp.com",
  projectId: "simfoni-rasa",
};

// Hindari double initialize
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Init Firestore
export const db = getFirestore(app);

/**
 * Ambil semua recipes
 */
export async function getRecipes() {
  const snap = await getDocs(collection(db, 'recipes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Ambil 1 recipe berdasarkan ID
 */
export async function getRecipeById(id) {
  const ref = doc(db, 'recipes', id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
