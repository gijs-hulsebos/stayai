import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const DEMO_USERNAME = "IO-DEMO";
const DEMO_INTERNAL_EMAIL = "io-demo@stayai.local";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;
  if (body?.username?.trim().toUpperCase() !== DEMO_USERNAME || !body.password) {
    return Response.json({ error: "Use the assigned StayAI demo account." }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return Response.json({ error: "StayAI authentication is not configured." }, { status: 503 });
  const supabase = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.signInWithPassword({ email: DEMO_INTERNAL_EMAIL, password: body.password });
  if (error?.status === 0) return Response.json({ error: "StayAI could not reach the authentication service. Please try again." }, { status: 503 });
  if (error || !data.session) return Response.json({ error: "Those details were not recognised." }, { status: 401 });
  return Response.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  }, { headers: { "Cache-Control": "no-store" } });
}
