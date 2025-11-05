// public/js/supabaseClient.js
const SUPABASE_URL = "https://hhehpepsavdndtrdeukk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWhwZXBzYXZkbmR0cmRldWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODY1NTcsImV4cCI6MjA3NTY2MjU1N30.m3ydFm-U02oDMgWyCAhQ4ZSf5L8i4tlENu4YyZcJ-oU";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
