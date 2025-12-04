// public/js/recipe.js

// 1. Import fungsi yang kita butuhkan
import supabase from './client.js';
import { getComments, addComment } from './comment.js';

// Global var untuk ID resep
let CURRENT_RECIPE_ID = null;

// 2. Fungsi untuk format tanggal (helper)
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// 3. Fungsi untuk menampilkan komentar di sidebar
function renderComments(comments = []) {
    const listContainer = document.getElementById('comments-list-container');
    if (!listContainer) return;

    if (comments.length === 0) {
        listContainer.innerHTML = '<p class="no-comments">Belum ada komentar.</p>';
        return;
    }

    listContainer.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-item-header">
                <span class="comment-item-author">
                    ${comment.profiles?.username || 'Anonim'}
                </span>
                <span class="comment-item-date">
                    ${formatDate(comment.created_at)}
                </span>
            </div>
            <p class="comment-item-body">${comment.comment}</p>
        </div>
    `).join('');
}

// 4. Fungsi untuk memuat dan menampilkan komentar
async function loadComments(recipeId) {
    const listContainer = document.getElementById('comments-list-container');
    listContainer.innerHTML = '<p class="comment-loading">Memuat komentar...</p>';

    const comments = await getComments(recipeId);
    renderComments(comments);
}

// 5. LOGIKA BUKA/TUTUP (Instagram Style)
const sidebar = document.getElementById('comment-sidebar');
const showBtn = document.getElementById('show-comments-btn');
const closeBtn = document.getElementById('close-comments-btn');

function openComments() {
    if (sidebar) sidebar.classList.add('open');
    // Muat komentar HANYA saat dibuka
    if (CURRENT_RECIPE_ID) {
        loadComments(CURRENT_RECIPE_ID);
    }
}

function closeComments() {
    if (sidebar) sidebar.classList.remove('open');
}

// 6. Fungsi utama yang berjalan saat halaman dimuat
document.addEventListener("DOMContentLoaded", async () => {

    // --- Setup Event Listeners ---
    // Tombol "Lihat Komentar" sekarang menjadi TOMBOL TOGGLE
    if (showBtn) {
        showBtn.addEventListener('click', () => {
            if (sidebar && sidebar.classList.contains('open')) {
                closeComments();
            } else {
                openComments();
            }
        });
    }
    // Tombol close (X) di dalam sidebar
    if (closeBtn) closeBtn.addEventListener('click', closeComments);

    // --- Logika Awal: Ambil ID Resep dari URL ---
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const showCommentsParam = params.get("showComments");

    if (!idParam) {
        document.body.innerHTML = `
            <h2 style="text-align:center; margin-top: 50px;">Tidak ada resep yang dipilih.</h2>
            <p style="text-align:center;"><a href="/index.html">Kembali ke beranda</a></p>
        `;
        return;
    }

    CURRENT_RECIPE_ID = parseInt(idParam);

    // --- Logika Fetch dan Tampilkan Resep ---
    try {
        const res = await fetch("/api/recipes");
        if (!res.ok) throw new Error("Gagal memuat data resep.");

        const recipes = await res.json();
        const recipe = recipes.find(r => r.id === CURRENT_RECIPE_ID);

        if (!recipe) {
            ocument.body.innerHTML = `
                <h2 style="text-align:center; margin-top: 50px;">Resep tidak ditemukan.</h2>
                <p style="text-align:center;"><a href="/index.html">Kembali ke beranda</a></p>
            `;
            return;
        }

        // Populate data resep
        document.getElementById("recipe-title").textContent = recipe.title;
        document.getElementById("recipe-description").textContent = recipe.description;
        document.getElementById("recipe-image").src = recipe.image;
        document.getElementById("recipe-meta").textContent = recipe.category.toUpperCase();
        document.getElementById("recipe-servings").textContent = recipe.servings || "-";
        document.getElementById("recipe-time").textContent = recipe.time || "-";
        document.getElementById("recipe-difficulty").textContent = recipe.difficulty || "-";
        document.getElementById("recipe-calories").textContent = recipe.calories || "350 kcal";

        const videoFrame = document.getElementById("recipe-video");
        const videoContainer = document.getElementById("video-container");
        const videoTitle = document.getElementById("video-title");

        if (recipe.videoEmbed && videoFrame) {
            videoFrame.src = recipe.videoEmbed;
        } else {
            if (videoContainer) videoContainer.style.display = "none";
            if (videoTitle) videoTitle.style.display = "none";
        }

        // (Gunakan data dummy jika tidak ada data asli)
        const ingredients = recipe.ingredients || [
            "Bahan tidak tersedia",
            "Silakan cek kembali nanti"
        ];
        const steps = recipe.steps || [
            "Langkah-langkah tidak tersedia",
            "Silakan cek kembali nanti"
        ];

        const ingredientsList = document.getElementById("ingredients-list");
        ingredients.forEach(item => {
            const li = document.createElement("li");
            li.textContent = item;
            ingredientsList.appendChild(li);
        });

        const stepsList = document.getElementById("steps-list");
        steps.forEach(step => {
            const li = document.createElement("li");
            li.textContent = step;
            stepsList.appendChild(li);
        });

    } catch (err) {
        document.body.innerHTML = `
            <h2 style="text-align:center; margin-top: 50px;">Terjadi kesalahan saat memuat resep.</h2>
            <p style="text-align:center; color:red;">${err.message}</p>
        `;
        console.error(err);
    }

    // --- Logika Handle Form Komentar ---
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('comment-input');
            const submitBtn = document.getElementById('submit-comment-btn');
            const errorMsg = document.getElementById('comment-error');

            const commentText = input.value;
            submitBtn.disabled = true;
            submitBtn.textContent = "Mengirim...";
            errorMsg.textContent = "";

            const newComment = await addComment(CURRENT_RECIPE_ID, commentText);

            if (newComment) {
                input.value = ""; // Kosongkan input
                await loadComments(CURRENT_RECIPE_ID); // Refresh daftar komentar
            } else {
                // Pesan error (alert) akan muncul dari 'addComment'
            }

            submitBtn.disabled = false;
            submitBtn.textContent = "Kirim";
        });
    }

    // --- Cek jika harus buka komentar dari URL ---
    if (showCommentsParam === 'true') {
        openComments();
    }
});