import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // App still works as guest if Supabase isn't configured
  if (!client) client = createClient(url, key);
  return client;
}
