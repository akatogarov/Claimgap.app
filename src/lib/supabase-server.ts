import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client. Prefer `SUPABASE_SERVICE_ROLE_KEY`: it bypasses RLS.
 * Using only the anon key often makes `insert` into `claims` fail when RLS has no INSERT policy.
 */
export function getServiceSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const key = serviceKey ?? anonKey;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase configuration: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in .env.local"
    );
  }
  if (!serviceKey && process.env.NODE_ENV === "development") {
    console.warn(
      "[ClaimGap] SUPABASE_SERVICE_ROLE_KEY is not set; using anon key. If inserts fail with row-level security, add the service role key from Supabase → Project Settings → API."
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
