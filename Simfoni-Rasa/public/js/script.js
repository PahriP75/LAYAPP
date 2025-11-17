// public/js/script.js

// 1. IMPORT
import supabase from './client.js';

// 2. AUTH LOGIC
async function setupNav() {
    const { data: { user } } = await supabase.auth.getUser();
    const navGuest = document.getElementById('nav-guest');
    const navUser = document.getElementById('nav-user');

    if (user) {
        // User is logged in
        if (navGuest) navGuest.style.display = 'none';
        if (navUser) navUser.style.display = 'flex'; // 'flex' makes it visible
    } else {
        // User is logged out
        if (navGuest) navGuest.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
    }
}

// Listener khusus untuk setup Navigasi
document.addEventListener('DOMContentLoaded', () => {
    setupNav();
});

// Listener untuk perubahan status login
supabase.auth.onAuthStateChange((event, session) => {
    setupNav();
});


// 3. RECIPE VARIABLES & DOM REFS
let allRecipes = [];
const recipeGrid = document.getElementById("recipe-grid");
const loadingMessage = document.getElementById("loading-message");
const filterButtons = document.querySelectorAll(".filter-btn");


// 4. RECIPE FUNCTIONS

/**
 * ✅ FUNGSI BARU: Membuat kartu resep
 * Versi ini menggunakan ikon komentar + counter, dan menghapus textarea.
 */
function createRecipeCard(recipe) {
    const newCommentSummary = `
        <div class="comment-summary">
            <button class="comment-toggle-btn" title="Lihat Komentar">
                <i class="fa-solid fa-comments"></i>
                <span class="comment-count">${recipe.comment_count || 0}</span>
            </button>
        </div>
    `;

    return `
    <article class="recipe-card" data-kategori="${recipe.category}" data-id="${recipe.id}">
      <div class="recipe-image">
        <img src="${recipe.image}" 
             alt="${recipe.title}"
             onerror="this.onerror=null; this.src='https://placehold.co/400x200/cccccc/000000?text=Image+Missing';">
      </div>
      <div class="card-content">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        
        <div class="card-actions">
            <div class="rating-actions">
                <button class="like-btn"><i class="fa-solid fa-thumbs-up"></i></button>
                <span class="like-count">0</span>
                <button class="dislike-btn"><i class="fa-solid fa-thumbs-down"></i></button>
                <span class="dislike-count">0</span>
            </div>
            ${newCommentSummary}
        </div>

        <div class="recipe-meta">
          <span>${recipe.time}</span>
          <span>${recipe.difficulty}</span>
          <span>${recipe.servings}</span>
        </div>
        <a href="#" class="btn-view">Lihat Resep</a>
      </div>
    </article>
  `;
}

/**
 * ✅ FUNGSI ORIGINAL: Menampilkan resep ke DOM
 */
function renderRecipes(recipesToDisplay) {
    if (!recipeGrid) return; // Pastikan recipeGrid ada
    recipeGrid.innerHTML = "";

    if (!recipesToDisplay.length) {
        recipeGrid.innerHTML = '<p class="text-center">Tidak ada resep untuk kategori ini.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    recipesToDisplay.forEach(recipe => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = createRecipeCard(recipe);
        const card = tempDiv.querySelector(".recipe-card");
        if (card) fragment.appendChild(card);
    });
    recipeGrid.appendChild(fragment);
}

/**
 * ✅ FUNGSI ORIGINAL: Filter resep
 */
function handleFilter(category) {
    if (category === "all" || category === "semua") {
        renderRecipes(allRecipes);
    } else {
        const filtered = allRecipes.filter(r =>
            r.category.toLowerCase().includes(category.toLowerCase())
        );
        renderRecipes(filtered);
    }
}

/**
 * ✅ FUNGSI ORIGINAL: Ambil data resep
 */
async function fetchRecipes() {
    if (loadingMessage) loadingMessage.textContent = "Memuat resep...";
    try {
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allRecipes = await res.json();
        renderRecipes(allRecipes);
    } catch (err) {
        console.error("Gagal memuat resep:", err);
        if (recipeGrid) {
            recipeGrid.innerHTML = `<p class="error-message">Gagal memuat resep (${err.message})</p>`;
        }
    } finally {
        if (loadingMessage) loadingMessage.remove();
    }
}


// 5. RECIPE EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    // Hanya jalankan ini jika kita di halaman utama (ada recipe-grid)
    if (recipeGrid) {
        fetchRecipes();

        // Filter button logic
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                filterButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                const category = btn.dataset.category;
                handleFilter(category);
            });
        });

        // ✅ LISTENER KLIK BARU (Event Delegation)
        // Mengurus klik pada tombol "Lihat Resep" dan "Komentar"
        recipeGrid.addEventListener("click", e => {
            const card = e.target.closest(".recipe-card");
            if (!card) return; // Klik di luar card

            const id = card.dataset.id;
            
            // Target 1: Tombol "Lihat Resep"
            const buttonView = e.target.closest(".btn-view");
            if (buttonView) {
                e.preventDefault(); 
                window.location.href = `/recipe.html?id=${id}`;
                return; // Hentikan eksekusi
            }

            // Target 2: Tombol Komentar BARU
            const buttonComment = e.target.closest(".comment-toggle-btn");
            if (buttonComment) {
                e.preventDefault();
                // Redirect ke halaman resep DAN minta buka komentar
                window.location.href = `/recipe.html?id=${id}&showComments=true`;
                return; // Hentikan eksekusi
            }
        });
    }
});


// 6. LIKE & DISLIKE FUNCTIONALITY (Global Listener)
document.addEventListener("click", function (e) {
    // Cek apakah yang diklik adalah tombol like/dislike
    const ratingActions = e.target.closest(".rating-actions");
    if (!ratingActions) return; // Keluar jika bukan klik di area rating

    const likeBtn = e.target.closest(".like-btn");
    const dislikeBtn = e.target.closest(".dislike-btn");

    // LIKE BUTTON CLICKED
    if (likeBtn) {
        const likeCount = ratingActions.querySelector(".like-count");
        const dislikeBtnInside = ratingActions.querySelector(".dislike-btn");
        const dislikeCount = ratingActions.querySelector(".dislike-count");

        // Toggle like
        if (likeBtn.classList.contains("active-like")) {
            likeBtn.classList.remove("active-like");
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        } else {
            likeBtn.classList.add("active-like");
            likeCount.textContent = parseInt(likeCount.textContent) + 1;

            // Jika dislike aktif → matikan
            if (dislikeBtnInside.classList.contains("active-dislike")) {
                dislikeBtnInside.classList.remove("active-dislike");
                dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
            }
        }
    }

    // DISLIKE BUTTON CLICKED
    if (dislikeBtn) {
        const dislikeCount = ratingActions.querySelector(".dislike-count");
        const likeBtnInside = ratingActions.querySelector(".like-btn");
        const likeCount = ratingActions.querySelector(".like-count");

        // Toggle dislike
        if (dislikeBtn.classList.contains("active-dislike")) {
            dislikeBtn.classList.remove("active-dislike");
            dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
        } else {
            dislikeBtn.classList.add("active-dislike");
            dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;

            // Jika like aktif → matikan
            if (likeBtnInside.classList.contains("active-like")) {
                likeBtnInside.classList.remove("active-like");
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
            }
        }
    }
});