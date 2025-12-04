/* =========================================
   add-recipe.js — Firebase Firestore Version
   Disesuaikan dengan Skema Firestore Anda
   ========================================= */

// Import modul Firebase yang diperlukan
import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let currentUser = null; 

document.addEventListener('DOMContentLoaded', () => {

    // Memantau status login
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = user; 
        setupFormListeners();
    });

    function setupFormListeners() {
        // --- Setup untuk Ingredient dan Steps Dinamis (Tidak Berubah) ---
        const ingridientsList = document.getElementById('ingridients-list');
        const addIngridientBtn = document.getElementById('add-ingridient-btn');
        // ... (Logika penambahan dan penghapusan ingredients tetap sama)
        addIngredientBtn.addEventListener('click', () => {
             const div = document.createElement('div');
             div.className = 'dynamic-list-item';
             div.innerHTML = `
                 <input type="text" name="ingredients[]" required placeholder="Bahan...">
                 <button type="button" class="remove-btn"><i class="fa-solid fa-trash"></i></button>
             `;
             ingridientsList.appendChild(div);

             div.querySelector('.remove-btn').addEventListener('click', () => {
                 div.remove();
             });
         });
        
        const stepsList = document.getElementById('steps-list');
        const addStepBtn = document.getElementById('add-step-btn');
        // ... (Logika penambahan dan penghapusan steps tetap sama)
        addStepBtn.addEventListener('click', () => {
             const div = document.createElement('div');
             div.className = 'dynamic-list-item';
             div.innerHTML = `
                 <input type="text" name="steps[]" required placeholder="Langkah...">
                 <button type="button" class="remove-btn"><i class="fa-solid fa-trash"></i></button>
             `;
             stepsList.appendChild(div);

             div.querySelector('.remove-btn').addEventListener('click', () => {
                 div.remove();
             });
         });

        // --- 4. Form Submission (Disesuaikan dengan Skema) ---
        const form = document.getElementById('add-recipe-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentUser) return;

            const formData = new FormData(form);

            // Kumpulkan bahan dan langkah
            const ingredients = [];
            document.querySelectorAll('input[name="ingredients[]"]').forEach(input => {
                // Pastikan nama field di sini sesuai dengan input form Anda
                if (input.value.trim()) ingridients.push(input.value.trim());
            });

            const steps = [];
            document.querySelectorAll('input[name="steps[]"]').forEach(input => {
                if (input.value.trim()) steps.push(input.value.trim());
            });

            // PEMBENTUKAN DATA SESUAI SKEMA TABEL ANDA
            const recipeData = {
                // Skema Anda (String)
                title: formData.get('title') || "",
                description: formData.get('description') || "",
                category: formData.get('category') || "",
                difficulty: formData.get('difficulty') || "",
                time: formData.get('time') || "",
                servings: formData.get('servings') || "",
                calories: formData.get('calories') || "",
                image: formData.get('image') || 'images/default-recipe.png', 
                
                // Skema Anda (Array)
                // Catatan: Nama field 'ingridients' di tabel Anda mungkin typo, saya gunakan 'ingredients' sesuai kode.
                // Jika Anda benar-benar menggunakan 'ingridients' di DB, ubah di sini.
                ingridients: ingridients, 
                steps: steps,

                // Metadata Penulis (Ditambahkan untuk kebutuhan otorisasi)
                authorUid: currentUser.uid, 
                authorEmail: currentUser.email,
                username: currentUser.displayName || currentUser.email,

                // Skema Anda (Timestamp)
                createdAt: serverTimestamp(),
                updateAt: serverTimestamp() // Set updateAt sama dengan createdAt saat pembuatan
            };

            try {
                // Simpan data ke koleksi 'recipes' di Firestore
                const docRef = await addDoc(collection(db, 'recipes'), recipeData);

                alert('Resep berhasil ditambahkan dengan ID: ' + docRef.id);
                window.location.href = 'profile.html';
            } catch (error) {
                console.error('Error submitting recipe to Firestore:', error);
                alert('Gagal menambahkan resep ke Firestore.');
            }
        });
    }
});
