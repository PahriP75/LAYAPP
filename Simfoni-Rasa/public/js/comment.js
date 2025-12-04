import { db, auth } from './firebase-init.js';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ...existing code...
export function subscribeComments(postId, callback) {
  const q = query(
    collection(db, 'comment'),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, snap => {
    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));
    callback(items);
  }, err => {
    console.error('comments onSnapshot error:', err);
    callback([]);
  });
}

export async function addComment({ postId, text }) {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const payload = {
    postId,
    text,
    userId: user.uid,
    userEmail: user.email || null,
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'comment'), payload);
  return ref.id;
}
