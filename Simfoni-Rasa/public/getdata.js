const getRecipeDetail = async (recipeId) => {
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      likes(type),
      comments(comment, created_at, user_id)
    `)
    .eq("id", recipeId);

  return data;
};
