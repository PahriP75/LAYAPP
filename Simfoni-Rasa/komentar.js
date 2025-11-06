const addComment = async (recipeId, comment) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase.from("comments").insert({
    recipe_id: recipeId,
    user_id: user.id,
    comment: comment,
  });
};
