// public/js/auth.js
import  supabase  from './client.js';

// --- LOGIN ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('❌ Login gagal: ' + error.message);
    } else {
      alert('✅ Login berhasil!');
      window.location.href = 'index.html';
    }
  });
}

// --- REGISTER ---
const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      alert('❌ Registrasi gagal: ' + error.message);
    } else {
      alert('✅ Registrasi berhasil! Silakan login.');
      window.location.href = 'login.html';
    }
  });
  
  
}
