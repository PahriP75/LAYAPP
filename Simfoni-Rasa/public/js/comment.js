// public/js/comment.js

// Berdasarkan file auth.js dan script.js, kamu sudah menggunakan module,
// jadi kita tambahkan 'export' dan 'import'
import supabase from './client.js';

/**
 * FUNGSI BARU: Mengambil semua komentar untuk satu resep
 * Kita juga mengambil 'username' dari tabel 'profiles'
 */
export const getComments = async (recipeId) => {
  if (!recipeId) return [];

  const { data, error } = await supabase
    .from('comments')
    .select(`
      id,
      created_at,
      comment,
      profiles ( username ) 
    `)
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false }); // Komentar terbaru di atas

  if (error) {
    console.error("❌ Error mengambil komentar:", error.message);
    return [];
  }

  return data;
};

/**
 * FUNGSI (DIMODIFIKASI): Menambahkan komentar baru
 * Kita tambahkan alert dan return null agar lebih jelas
 */
export const addComment = async (recipeId, comment) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("Anda harus login untuk menambahkan komentar.");
    console.error("❌ Pengguna belum login.");
    return null; // Hentikan fungsi
  }

  if (!comment?.trim()) {
    alert("Komentar tidak boleh kosong.");
    console.error("❌ Komentar tidak boleh kosong.");
    return null; // Hentikan fungsi
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      comment,
    })
    .select(`
      id,
      created_at,
      comment,
      profiles ( username )
    `) // Ambil data lengkap setelah insert
    .single(); // Kembalikan sebagai satu objek

  if (error) {
    console.error("❌ Error saat menyimpan komentar:", error);
    alert("Gagal mengirim komentar: " + error.message);
    return null;
  }

  console.log("✅ Komentar berhasil tersimpan:", data);
  return data; // Kembalikan data komentar baru
};