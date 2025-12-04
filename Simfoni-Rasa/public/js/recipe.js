// public/js/recipe.js
// 1. Import fungsi yang kita butuhkan
import { db } from './firebase-init.js';
import { getComments, addComment, subscribeComments } from './comment.js';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let CURRENT_RECIPE_ID = null;
let commentsUnsub = null;

function formatDate(value) {
  if (!value) return '';
  // Firestore Timestamp -> Date
  const d = (value && typeof value.toDate === 'function') ? value.toDate() : new Date(value);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleString('id-ID', options);
}

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
        <span class="comment-item-author">${(comment.profile?.username || comment.userEmail || comment.profiles?.username || 'Anonim')}</span>
        <span class="comment-item-date">${formatDate(comment.createdAt || comment.created_at)}</span>
      </div>
      <p class="comment-item-body">${comment.text || comment.comment || ''}</p>
    </div>
  `).join('');
}

async function loadCommentsOnce(recipeId) {
  const listContainer = document.getElementById('comments-list-container');
  if (listContainer) listContainer.innerHTML = '<p class="comment-loading">Memuat komentar...</p>';
  try {
    if (typeof getComments === 'function') {
      const comments = await getComments(recipeId);
      renderComments(comments);
    } else {
      renderComments([]);
    }
  } catch (err) {
    console.error('loadComments error', err);
    renderComments([]);
  }
}

function subscribeCommentsRealtime(recipeId) {
  if (typeof subscribeComments !== 'function') return null;
  return subscribeComments(recipeId, items => renderComments(items));
}

const sidebar = document.getElementById('comment-sidebar');
const showBtn = document.getElementById('show-comments-btn');
const closeBtn = document.getElementById('close-comments-btn');

function openComments() {
  if (sidebar) sidebar.classList.add('open');
  if (!CURRENT_RECIPE_ID) return;
  // realtime subscribe if available
  if (!commentsUnsub && typeof subscribeComments === 'function') {
    commentsUnsub = subscribeCommentsRealtime(CURRENT_RECIPE_ID);
  } else {
    loadCommentsOnce(CURRENT_RECIPE_ID);
  }
}

function closeComments() {
  if (sidebar) sidebar.classList.remove('open');
  if (typeof commentsUnsub === 'function') {
    commentsUnsub();
    commentsUnsub = null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
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

  // use string id as Firestore doc id (do not parseInt)
  CURRENT_RECIPE_ID = idParam;

  if (showBtn) {
    showBtn.addEventListener('click', () => {
      if (sidebar && sidebar.classList.contains('open')) closeComments();
      else openComments();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeComments);

  try {
    // load single recipe directly from Firestore
    const docRef = doc(db, 'recipes', CURRENT_RECIPE_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      document.body.innerHTML = `
        <h2 style="text-align:center; margin-top: 50px;">Resep tidak ditemukan.</h2>
        <p style="text-align:center;"><a href="/index.html">Kembali ke beranda</a></p>
      `;
      return;
    }
    const recipe = { id: snap.id, ...snap.data() };

    // Populate UI safely (check elements exist)
    const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    const setSrc = (id, src) => { const el = document.getElementById(id); if (el) el.src = src; };

    setText("recipe-title", recipe.title || '');
    setText("recipe-description", recipe.description || '');
    setSrc("recipe-image", recipe.image || '');
    setText("recipe-meta", (recipe.category || '').toUpperCase());
    setText("recipe-servings", recipe.servings || "-");
    setText("recipe-time", recipe.time || "-");
    setText("recipe-difficulty", recipe.difficulty || "-");
    setText("recipe-calories", recipe.calories || "350 kcal");

    const videoFrame = document.getElementById("recipe-video");
    const videoContainer = document.getElementById("video-container");
    const videoTitle = document.getElementById("video-title");
    if (recipe.videoEmbed && videoFrame) {
      videoFrame.src = recipe.videoEmbed;
    } else {
      if (videoContainer) videoContainer.style.display = "none";
      if (videoTitle) videoTitle.style.display = "none";
    }

    const ingredientsList = document.getElementById("ingredients-list");
    const stepsList = document.getElementById("steps-list");
    const ingredients = recipe.ingredients || [];
    const steps = recipe.steps || [];
    if (ingredientsList) {
      ingredientsList.innerHTML = '';
      ingredients.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ingredientsList.appendChild(li);
      });
    }
    if (stepsList) {
      stepsList.innerHTML = '';
      steps.forEach(step => {
        const li = document.createElement("li");
        li.textContent = step;
        stepsList.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `
      <h2 style="text-align:center; margin-top: 50px;">Terjadi kesalahan saat memuat resep.</h2>
      <p style="text-align:center; color:red;">${err.message}</p>
    `;
    return;
  }

  // comment form handling
  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('comment-input');
      const submitBtn = document.getElementById('submit-comment-btn');
      const errorMsg = document.getElementById('comment-error');
      const commentText = input?.value?.trim();
      if (!commentText) {
        if (errorMsg) errorMsg.textContent = 'Komentar tidak boleh kosong.';
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim...";
      if (errorMsg) errorMsg.textContent = "";

      try {
        // addComment signature: addComment(postId, text) or addComment({ postId, text })
        if (typeof addComment === 'function') {
          // try both patterns
          let res = null;
          try { res = await addComment(CURRENT_RECIPE_ID, commentText); } catch (e1) {
            res = await addComment({ postId: CURRENT_RECIPE_ID, text: commentText });
          }
          // refresh comments (if not realtime)
          if (!commentsUnsub) await loadCommentsOnce(CURRENT_RECIPE_ID);
        }
        input.value = "";
      } catch (err) {
        console.error('addComment error', err);
        if (errorMsg) errorMsg.textContent = 'Gagal mengirim komentar.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Kirim";
      }
    });
  }

  if (showCommentsParam === 'true') openComments();
});

// Firestore helper exports
export async function addRecipe(data) {
  const ref = await addDoc(collection(db, 'recipes'), data);
  return ref.id;
}
export async function updateRecipe(id, data) { await updateDoc(doc(db, 'recipes', id), data); }
export async function deleteRecipe(id) { await deleteDoc(doc(db, 'recipes', id)); }
export async function getRecipe(id) {
  const snap = await getDoc(doc(db, 'recipes', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
