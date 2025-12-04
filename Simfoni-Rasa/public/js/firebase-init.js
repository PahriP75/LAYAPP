// firebase-init.js

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC6YhPKsphJHtLh96_-Yd_ptLMsu-m5mLw",
  authDomain: "simfoni-rasa.firebaseapp.com",
  projectId: "simfoni-rasa",
  storageBucket: "simfoni-rasa.appspot.com",
  messagingSenderId: "1095181533400",
  appId: "1:1095181533400:web:d188ae6dc9682874c857ad"
};

// Hindari double initialize
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
