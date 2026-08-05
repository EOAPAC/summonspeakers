import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY — the service key bypasses RLS, so
 * it must never be importable from a component. Reach it from a server
 * function (createServerFn) the way roster.server.ts reaches the roster.
 *
 * Two unprefixed env vars, both server-side:
 *   SUPABASE_URL               — same value as VITE_SUPABASE_URL; kept separate
 *                                so the server never depends on a build-time var.
 *   SUPABASE_SERVICE_ROLE_KEY  — secret. Never VITE_-prefixed, never logged.
 *
 * Returns null when unconfigured rather than throwing at import time: the site
 * must still build and render without the backend present (CI does exactly
 * that), and the failure belongs at the call site that needed the backend.
 */
let cached: SupabaseClient | null | undefined;

export function getServiceClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  cached =
    url && key
      ? createClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;
  return cached;
}

/**
 * Resolve the auth user behind an access token submitted with a form. Returns
 * null for a missing or invalid token — callers decide whether an anonymous
 * submission is acceptable (it is for the listing form's email fallback).
 */
export async function userFromToken(
  accessToken: string,
): Promise<{ id: string; email: string | null } | null> {
  const client = getServiceClient();
  if (!client || !accessToken) return null;
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email ?? null };
}

/**
 * Public (anon-key) Supabase client, for reading data RLS already allows
 * anyone to see — e.g. published speaker profiles. SERVER ONLY by convention,
 * not by necessity: this key is the same one shipped to the browser for
 * sign-in (supabase-auth.ts), so nothing leaks by reading it here too. Kept
 * separate from that browser client because this one has to work outside a
 * browser, where there is no window and no localStorage to persist a session.
 *
 * VITE_SUPABASE_ANON_KEY is read via process.env rather than import.meta.env:
 * the VITE_ prefix controls what Vite inlines into the client bundle, not
 * what a Node/Nitro server process can read from its own environment, and
 * this file never reaches the client bundle regardless.
 */
let publicCached: SupabaseClient | null | undefined;

export function getPublicClient(): SupabaseClient | null {
  if (publicCached !== undefined) return publicCached;
  const url = process.env["SUPABASE_URL"];
  const anonKey = process.env["VITE_SUPABASE_ANON_KEY"];
  publicCached =
    url && anonKey
      ? createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } })
      : null;
  return publicCached;
}
