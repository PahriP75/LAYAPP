import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let app = null;
let auth = null;
let db = null;

// ===== DEFAULT CONFIG =====
const firebaseConfigDefault = {
  apiKey: "AIzaSyC6YhPKsphJHtLh96_-Yd_ptLMsu-m5mLw",
  authDomain: "simfoni-rasa.firebaseapp.com",
  projectId: "simfoni-rasa",
};

// ===== INIT FIREBASE =====
export function initFirebase(config = firebaseConfigDefault) {
  if (app) return; // mencegah double-init
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}


/** LOGIN */
export async function login(email, password) {
  if (!auth) throw new Error("Firebase not initialized");
  return await signInWithEmailAndPassword(auth, email, password);
}

/** REGISTER */
export async function register(email, password, displayName = "") {
  if (!auth) throw new Error("Firebase not initialized");
  
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(userCred.user, { displayName });
  }

  return userCred;
}

/** LOGOUT */
export async function logout() {
  if (!auth) throw new Error("Firebase not initialized");
  return await signOut(auth);
}


/** GET ALL RECIPES */
export async function getRecipes() {
  if (!db) throw new Error("Firebase not initialized");

  const snap = await getDocs(collection(db, "recipes"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/** ADD RECIPE */
export async function addRecipe(data) {
  if (!db) throw new Error("Firebase not initialized");

  const ref = await addDoc(collection(db, "recipes"), data);
  return ref.id;
}

/** UPDATE RECIPE */
export async function updateRecipe(id, data) {
  if (!db) throw new Error("Firebase not initialized");

  return await updateDoc(doc(db, "recipes", id), data);
}

/** DELETE RECIPE */
export async function deleteRecipe(id) {
  if (!db) throw new Error("Firebase not initialized");

  return await deleteDoc(doc(db, "recipes", id));
}
