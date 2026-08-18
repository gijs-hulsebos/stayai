import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and a temporary SUPABASE_SERVICE_ROLE_KEY before provisioning.");
}

const admin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email: "io-demo@stayai.local",
  password: "IO-DEMO1",
  email_confirm: true,
  user_metadata: { username: "IO-DEMO" },
});

if (error) throw error;
console.log(`Provisioned IO-DEMO (${data.user.id}). Remove SUPABASE_SERVICE_ROLE_KEY from the shell now.`);
