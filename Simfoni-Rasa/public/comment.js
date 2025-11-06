const addComment = async (recipeId, comment) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("❌ Pengguna belum login. Tidak bisa menambahkan komentar.");
    return;
  }

  if (!comment?.trim()) {
    console.error("❌ Komentar tidak boleh kosong.");
    return;
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      recipe_id: recipeId,
      user_id: user.id,
      comment,
    })
    .select();

  if (error) {
    console.error("❌ Error saat menyimpan komentar:", error);
  } else {
    console.log("✅ Komentar berhasil tersimpan:", data);
  }

  return data;
};
