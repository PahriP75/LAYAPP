const likeRecipe = async (recipeId, type) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("likes").upsert({
    recipe_id: recipeId,
    user_id: user.id,
    type: type, // 'like' atau 'dislike'
  }, { onConflict: "recipe_id,user_id" });
};
