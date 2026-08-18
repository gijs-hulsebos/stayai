import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  browserClient = createClient<Database>(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return browserClient;
}
