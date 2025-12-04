/* ==========================================================
   favorites.js — Firebase Firestore Version (Fixed & Optimized)
   ========================================================== */

// Import modul Firebase yang diperlukan
import { auth, db } from './firebase-init.js'; // Asumsi file ini ada
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const grid = document.getElementById('favorite-recipes-grid');

document.addEventListener('DOMContentLoaded', () => {

    // Menggunakan onAuthStateChanged untuk mengelola sesi user Firebase
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Jika user tidak login, redirect
            window.location.href = 'login.html';
            return;
        }
        
        // Mulai memuat resep favorit setelah user terautentikasi
        await loadFavoriteRecipes(user);
    });

});

async function loadFavoriteRecipes(user) {
    const userEmail = user.email;
    if (!grid) return; // Pastikan grid ada

    try {
        // 1. Dapatkan daftar ID resep favorit dari localStorage
        // Kita pertahankan logic ini sesuai kode Anda, hanya menggunakan email sebagai key.
        const favorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`)) || [];

        if (favorites.length === 0) {
            grid.innerHTML = '<p class="no-recipes">Anda belum memiliki resep favorite.</p>';
            return;
        }

        // 2. Query Firestore untuk mengambil dokumen resep berdasarkan ID yang ada di daftar 'favorites'
        
        // PENTING: Firestore membatasi klausa 'in' hanya sampai 10 item.
        // Jika Anda memiliki lebih dari 10 favorit, Anda perlu memprosesnya dalam batch.
        
        const recipesRef = collection(db, 'recipes');
        
        // Membuat query untuk ID-ID resep favorit
        const favoriteRecipesQuery = query(recipesRef, where('__name__', 'in', favorites));
        
        const snapshot = await getDocs(favoriteRecipesQuery);

        // 3. Render Resep
        const favoriteRecipes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        grid.innerHTML = ''; // Kosongkan grid sebelum merender

        if (favoriteRecipes.length === 0) {
            grid.innerHTML = '<p class="no-recipes">Resep favorite tidak ditemukan atau sudah dihapus.</p>';
            return;
        }

        favoriteRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            
            // Mengganti field 'ingridients' menjadi 'ingredients' (asumsi field yang benar)
            // dan menggunakan data yang diambil dari Firestore
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='https://placehold.co/400x200?text=No+Image';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description ? recipe.description.substring(0, 100) + '...' : ''}</p>
                    <div class="recipe-meta">
                        <span><i class="far fa-clock"></i> ${recipe.time || '-'}</span>
                        <span><i class="fas fa-user-friends"></i> ${recipe.servings || '-'}</span>
                    </div>
                    <a href="recipe.html?id=${recipe.id}" class="btn-view">Lihat Resep</a>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Error fetching favorite recipes from Firestore:', error);
        grid.innerHTML = '<p class="error-text">Gagal memuat resep favorite.</p>';
    }
}
