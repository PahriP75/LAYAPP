import { supabase } from "../supabaseClient";

// REGISTER
const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
};

// LOGIN
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
};

// LOGOUT
const signOut = async () => {
  await supabase.auth.signOut();
};
