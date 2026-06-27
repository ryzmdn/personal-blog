import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes("dummy")) {
  console.warn(
    "Supabase credentials are not configured or are placeholder keys. " +
    "Please update .env.local with your real Supabase URL and Anon Key."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
