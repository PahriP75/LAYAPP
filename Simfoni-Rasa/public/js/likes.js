import { db, auth } from './firebase-init.js';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/**
 * Subscribe realtime like/dislike info for a recipe.
 */
export function subscribeLikeInfo(recipeId, callback) {
  const q = query(collection(db, 'like_dislike'), where('recipe_id', '==', recipeId));

  return onSnapshot(q, snap => {
    let likes = 0;
    let dislikes = 0;
    const uid = auth.currentUser?.uid || null;
    let userType = null;

    snap.forEach(d => {
      const data = d.data();
      if (data.type === 'like') likes++;
      if (data.type === 'dislike') dislikes++;
      if (uid && data.user_id === uid) userType = data.type;
    });

    callback({
      likes,
      dislikes,
      userType,
      liked: userType === 'like',
      disliked: userType === 'dislike'
    });
  }, err => {
    console.error('subscribeLikeInfo onSnapshot error:', err);
    callback({ likes: 0, dislikes: 0, userType: null, liked: false, disliked: false });
  });
}

/**
 * Toggle like/dislike
 */
export async function toggleLikeDislike(recipeId, type) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const uid = user.uid;

  const q = query(
    collection(db, 'like_dislike'),
    where('recipe_id', '==', recipeId),
    where('user_id', '==', uid)
  );
  const snap = await getDocs(q);

  let existingDoc = null;
  snap.forEach(d => (existingDoc = d));

  if (existingDoc) {
    const prevType = existingDoc.data().type;

    if (prevType === type) {
      await deleteDoc(existingDoc.ref);
      return { action: 'removed', type };
    } else {
      await deleteDoc(existingDoc.ref);
      await addDoc(collection(db, 'like_dislike'), {
        recipe_id: recipeId,
        user_id: uid,
        type,
        createdAt: serverTimestamp()
      });
      return { action: 'replaced', type };
    }
  }

  await addDoc(collection(db, 'like_dislike'), {
    recipe_id: recipeId,
    user_id: uid,
    type,
    createdAt: serverTimestamp()
  });

  return { action: 'added', type };
}

/**
 * One-time fetch
 */
export async function getLikeInfo(recipeId) {
  const q = query(collection(db, 'like_dislike'), where('recipe_id', '==', recipeId));
  const snap = await getDocs(q);

  let likes = 0;
  let dislikes = 0;
  const uid = auth.currentUser?.uid || null;
  let userType = null;

  snap.forEach(d => {
    const data = d.data();
    if (data.type === 'like') likes++;
    if (data.type === 'dislike') dislikes++;
    if (uid && data.user_id === uid) userType = data.type;
  });

  return {
    likes,
    dislikes,
    userType,
    liked: userType === 'like',
    disliked: userType === 'dislike'
  };
}
