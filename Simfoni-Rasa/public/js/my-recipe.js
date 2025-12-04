// Import fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

// 1. Ganti Konfigurasi Firebase Anda di sini
const firebaseConfig = {
    apiKey: "AIzaSyC6YhPKsphJHtLh96_-Yd_ptLMsu-m5mLw",
    authDomain: "simfoni-rasa.firebaseapp.com",
    projectId: "simfoni-rasa",
    storageBucket: "simfoni-rasa.appspot.com",
    messagingSenderId: "1095181533400",
    appId: "1:1095181533400:web:d188ae6dc9682874c857ad"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Nama koleksi resep di Firestore Anda
const RECIPES_COLLECTION = 'recipes'; 

// Fungsi untuk memuat dan menampilkan resep
async function loadMyRecipes(userEmail, grid) {
    // 1. Buat Query: Filter resep berdasarkan email pengguna (author)
    const q = query(
        collection(db, RECIPES_COLLECTION),
        where("author", "==", userEmail) // Asumsi field 'author' di Firestore menyimpan email pengguna
    );

    try {
        const querySnapshot = await getDocs(q);
        const myRecipes = [];
        
        // 2. Map snapshot ke array data resep
        querySnapshot.forEach((doc) => {
            // Penting: Sertakan ID dokumen dari Firestore
            myRecipes.push({ id: doc.id, ...doc.data() }); 
        });

        grid.innerHTML = '';

        if (myRecipes.length === 0) {
            grid.innerHTML = '<p class="no-recipes">Anda belum menambahkan resep.</p>';
            return;
        }

        // 3. Render Resep ke Grid
        myRecipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" onerror="this.onerror=null; this.src='https://placehold.co/400x200?text=No+Image';">
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description ? recipe.description.substring(0, 100) + '...' : ''}</p>
                    <div class="recipe-meta">
                        <span><i class="far fa-clock"></i> ${recipe.time || '-'}</span>
                        <span><i class="fas fa-user-friends"></i> ${recipe.servings || '-'}</span>
                    </div>
                    <div class="card-actions" style="display: flex; gap: 10px; margin-top: 10px;">
                        <a href="recipe.html?id=${recipe.id}" class="btn-view" style="flex: 1; text-align: center; background: var(--primary-color); color: white; padding: 10px; border-radius: 25px; text-decoration: none;">Lihat</a>
                        <button class="btn-delete" data-id="${recipe.id}" style="background: #e74c3c; color: white; border: none; padding: 10px 15px; border-radius: 25px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // 4. Tambahkan Event Listener untuk Tombol Hapus
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Apakah Anda yakin ingin menghapus resep ini?')) {
                    const btnElement = e.target.closest('button');
                    const id = btnElement.dataset.id;

                    try {
                        // Hapus dokumen di Firestore
                        await deleteDoc(doc(db, RECIPES_COLLECTION, id)); 
                        
                        alert('Resep berhasil dihapus');
                        location.reload();

                    } catch (err) {
                        console.error('Error deleting recipe:', err);
                        alert('Terjadi kesalahan saat menghapus resep.');
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error fetching recipes:', error);
        grid.innerHTML = '<p class="error-text">Gagal memuat resep.</p>';
    }
}

// Handler utama DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('my-recipes-grid');

    // 5. Cek Otentikasi menggunakan onAuthStateChanged
    // Ini adalah cara yang lebih disukai untuk menangani status auth di Firebase
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Pengguna sudah login
            const userEmail = user.email;
            loadMyRecipes(userEmail, grid);
        } else {
            // Pengguna belum login
            window.location.href = 'login.html';
        }
    });
});
