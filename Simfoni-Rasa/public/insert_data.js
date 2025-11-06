async function handleLike(type) {
  console.log("Mengirim like:", type);
  await supabase.from("likes").delete().eq("recipe_id", recipeId).eq("user_id", userId);
  const { error } = await supabase.from("likes").insert([
    { recipe_id: recipeId, user_id: userId, type }
  ]);
  if (error) console.error("Insert gagal:", error);
  else console.log("Insert sukses!");
  await loadLikes();
}
