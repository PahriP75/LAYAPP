// 1. Import the 'createClient' function from the Supabase ESM (Module) CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// 2. Add your project URL and Key
// (Make sure to replace these with your actual keys)
const SUPABASE_URL = 'https://hhehpepsavdndtrdeukk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWhwZXBzYXZkbmR0cmRldWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODY1NTcsImV4cCI6MjA3NTY2MjU1N30.m3ydFm-U02oDMgWyCAhQ4ZSf5L8i4tlENu4YyZcJ-oU';

// 3. Create and export the client
// This is the line that was failing (it's now fixed)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;