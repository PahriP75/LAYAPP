/* ============================
   recipe.js — Fixed Version
   ============================ */

import { auth, db } from './firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  getComments,
  addComment,
  subscribeComments
} from './comment.js';

let CURRENT_RECIPE_ID = null;
let commentsUnsub = null;

/* ===========
   UTIL
   =========== */
function escapeHTML(str) {
  return str ? str.replace(/[&<>'"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    "'": '&#39;', '"': '&quot;'
  }[c])) : '';
}

/* =====================
   LOAD RECIPE DETAIL
   ===================== */
async function loadRecipeDetail(recipeId) {
  CURRENT_RECIPE_ID = recipeId;

  const ref = doc(db, 'recipes', recipeId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    document.getElementById('recipe-title').textContent = 'Resep tidak ditemukan';
    return;
  }

  const recipe = snap.data();

  document.getElementById('recipe-title').textContent = recipe.title || '';
  document.getElementById('recipe-author').textContent = recipe.username || 'Tanpa nama';
  document.getElementById('recipe-date').textContent =
    recipe.createdAt?.toDate?.().toLocaleString() || '—';
  document.getElementById('recipe-content').textContent = recipe.content || '';
}

/* =====================
   COMMENTS
   ===================== */

function renderComments(list = []) {
  const container = document.getElementById('comments-container');
  if (!container) return;

  if (!list.length) {
    container.innerHTML = '<p class="empty-text">Belum ada komentar</p>';
    return;
  }

  container.innerHTML = list
    .map(c => `
      <div class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${escapeHTML(
            c.displayName || c.username || c.userEmail || "Anonim"
          )}</span>
          <span class="comment-date">${c.createdAt?.toDate?.().toLocaleString() || ""}</span>
        </div>
        <div class="comment-body">${escapeHTML(c.text || '')}</div>
      </div>
    `)
    .join('');
}

async function loadCommentsOnce(recipeId) {
  const list = await getComments(recipeId);
  renderComments(list);
}

function subscribeCommentsRealtime(recipeId) {
  if (commentsUnsub) return; // cegah double listener
  if (typeof subscribeComments !== 'function') return null;

  commentsUnsub = subscribeComments(recipeId, items => renderComments(items));
}

/* =====================
   COMMENT INPUT
   ===================== */
async function setupCommentInput() {
  const form = document.getElementById('comment-form');
  const input = document.getElementById('comment-input');
  const errorMsg = document.getElementById('error-message');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();

    if (!text) {
      if (errorMsg) errorMsg.textContent = 'Komentar tidak boleh kosong.';
      return;
    }

    try {
      await addComment({
        postId: CURRENT_RECIPE_ID,
        text: text
      });

      // kalau tidak realtime, reload saja
      if (!commentsUnsub) {
        await loadCommentsOnce(CURRENT_RECIPE_ID);
      }

      input.value = "";
      if (errorMsg) errorMsg.textContent = "";
    } catch (err) {
      console.error('addComment error', err);
      if (errorMsg) errorMsg.textContent = 'Gagal mengirim komentar.';
    }
  });
}

/* =====================
   PAGE INIT
   ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get('id');

  if (!recipeId) {
    document.getElementById('recipe-title').textContent = 'ID Resep tidak ditemukan';
    return;
  }

  // Load detail resep
  loadRecipeDetail(recipeId);

  // Load komentar pertama kali
  loadCommentsOnce(recipeId);

  // Realtime komentar
  subscribeCommentsRealtime(recipeId);

  // Setup form input komentar
  setupCommentInput();
});

/* =====================
   OPTIONAL — DELETE / UPDATE RECIPE
   ===================== */
export async function updateRecipe(id, data) {
  await updateDoc(doc(db, 'recipes', id), data);
}

export async function deleteRecipeById(id) {
  await deleteDoc(doc(db, 'recipes', id));
}
