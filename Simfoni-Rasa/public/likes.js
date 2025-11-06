const likeRecipe = async (recipeId, type) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("likes")
    .upsert({
      recipe_id: recipeId,
      user_id: user.id,
      type: type,
    }, { onConflict: "recipe_id,user_id" });

  if (error) {
    console.error("❌ Error saat menyimpan like/dislike:", error);
  } else {
    console.log("✅ Like/Dislike berhasil tersimpan:", data);
  }
};
