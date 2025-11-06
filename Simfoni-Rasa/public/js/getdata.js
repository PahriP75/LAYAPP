const getRecipeDetail = async (recipeId) => {
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      likes(type),
      comments(comment, created_at, user_id)
    `)
    .eq("id", recipeId)
    .single();

  if (error) {
    console.error("❌ Gagal mengambil detail resep:", error);
    return null;
  }

  console.log("✅ Detail resep berhasil diambil:", data);
  return data;
};
