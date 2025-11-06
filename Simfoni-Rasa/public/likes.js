const likeRecipe = async (recipeId, type) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("❌ Pengguna belum login. Tidak bisa melakukan like/dislike.");
    return;
  }

  if (!["like", "dislike"].includes(type)) {
    console.error("❌ Tipe like tidak valid:", type);
    return;
  }

  const { data, error } = await supabase
    .from("likes")
    .upsert(
      {
        recipe_id: recipeId,
        user_id: user.id,
        type,
      },
      { onConflict: "recipe_id,user_id" }
    )
    .select();

  if (error) {
    console.error("❌ Error saat menyimpan like/dislike:", error);
  } else {
    console.log("✅ Like/Dislike berhasil tersimpan:", data);
  }

  return data;
};
