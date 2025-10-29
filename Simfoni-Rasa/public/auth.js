// public/auth.js
import { supabase } from './client.js'; // Import our client

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // This is the Supabase login function
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            alert('Login Gagal: ' + error.message);
        } else {
            // Login success!
            alert('Login Berhasil! Mengalihkan ke halaman utama.');
            window.location.href = 'index.html'; // Redirect to the main page
        }
    });
}

// --- REGISTER LOGIC ---
const registerForm = document.getElementById('register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // This is the Supabase sign-up function
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    // This is how you store extra data like 'username'
                    // This matches your original table!
                    username: username 
                }
            }
        });

        if (error) {
            alert('Registrasi Gagal: ' + error.message);
        } else {
            // Register success!
            alert('Registrasi Berhasil! Silakan login.');
            window.location.href = 'login.html'; // Redirect to the login page
        }
    });
}