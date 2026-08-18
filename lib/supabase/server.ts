import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  return { url, key };
}

export async function requireAuthenticatedClient(request: Request): Promise<{
  user: User;
  supabase: ReturnType<typeof createClient<Database>>;
}> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) throw Response.json({ error: "Authentication required" }, { status: 401 });
  const { url, key } = config();
  const authClient = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error?.status === 0) {
    throw Response.json({ error: "StayAI could not reach the authentication service. Please try again." }, { status: 503 });
  }
  if (error || !data.user) throw Response.json({ error: "Invalid or expired session" }, { status: 401 });
  const supabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { user: data.user, supabase };
}

export function jsonError(error: unknown, fallback = "Something went wrong") {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : fallback;
  return Response.json({ error: message }, { status: 500 });
}
