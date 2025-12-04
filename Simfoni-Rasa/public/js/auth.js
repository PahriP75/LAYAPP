import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6YhPKsphJHtLh96_-Yd_ptLMsu-m5mLw",
  authDomain: "simfoni-rasa.firebaseapp.com",
  projectId: "simfoni-rasa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// FORM LOGIN
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      window.location.href = 'index.html';
    } catch (err) {
      alert('❌ Login gagal: ' + err.message);
    }
  });
}

// FORM REGISTER
const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (username) {
        await updateProfile(userCredential.user, { displayName: username });
      }

      alert('✅ Registrasi berhasil! Silakan login.');
      window.location.href = 'login.html';
    } catch (err) {
      alert('❌ Registrasi gagal: ' + err.message);
    }
  });
}
