import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client, used for speaker sign-in (Google / Microsoft OAuth)
 * on /for-speakers/join.
 *
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are VITE_-prefixed ON PURPOSE:
 * both are public by design. The anon key sits in every Supabase client app on
 * the internet; it grants nothing that row-level security does not allow, and
 * the migration's policies are the enforcement. They are the only VITE_ vars
 * besides VITE_SITE_URL, and the only ones CI permits. Anything that would be a
 * problem to publish — the service-role key, Resend's key — stays unprefixed
 * and server-side.
 *
 * Returns null when unconfigured so the site builds and runs without the
 * backend; the join page then falls back to its email-only path.
 */
let cached: SupabaseClient | null | undefined;

export function getBrowserClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  // supabase-js persists sessions to localStorage, which does not exist during
  // SSR — and the route components importing this module are server-rendered.
  if (typeof window === "undefined") return null;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  cached = url && anonKey ? createClient(url, anonKey) : null;
  return cached;
}

export type OAuthProvider = "google" | "azure";

/**
 * Start an OAuth sign-in. Supabase's provider for Microsoft accounts is
 * "azure" (Entra ID). The redirect lands back on the current page, where the
 * client picks the session up from the URL hash.
 */
export async function signInWithOAuth(provider: OAuthProvider): Promise<void> {
  const client = getBrowserClient();
  if (!client) throw new Error("Supabase is not configured");
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw error;
}
