import { auth, db } from './firebase-init.js';
import { onAuthStateChanged, signOut, updateProfile as fbUpdateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/**
 * Ambil profile user
 */
export async function getProfile(uid) {
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Simpan / update profile user
 */
export async function saveProfile(uid, data = {}) {
  const ref = doc(db, 'profiles', uid);
  const snap = await getDoc(ref);

  const payload = {
    ...data,
    updatedAt: serverTimestamp()
  };

  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, {
      ...payload,
      createdAt: serverTimestamp()
    });
  }

  // Update displayName / photoURL pada Auth
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const { displayName, photoURL } = data;
    try {
      await fbUpdateProfile(auth.currentUser, {
        ...(displayName ? { displayName } : {}),
        ...(photoURL ? { photoURL } : {})
      });
    } catch (e) {
      console.warn('Gagal update Auth profile:', e);
    }
  }
}

/**
 * Handle Auth + UI
 */
document.addEventListener('DOMContentLoaded', () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userEmailElement = document.getElementById('user-email');
      if (userEmailElement) userEmailElement.textContent = user.email || '';

      try {
        const profile = await getProfile(user.uid);
        if (profile) {
          const nameEl = document.getElementById('display-name');
          if (nameEl && profile.displayName) {
            nameEl.textContent = profile.displayName;
          }
        }
      } catch (err) {
        console.error('Gagal memuat profile:', err);
      }
    } else {
      if (!/login\.html$/.test(window.location.pathname)) {
        window.location.href = 'login.html';
      }
    }
  });

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = 'index.html';
      } catch (err) {
        console.error('Error saat logout:', err);
      }
    });
  }
});
