import { createClient } from "@supabase/supabase-js";

/**
 * Public client, anon key only -- used for reads everywhere except one
 * deliberate exception (submitLead in src/lib/actions.ts, the contact-form
 * submission), which relies on the `leads` table's anon-INSERT-only RLS
 * policy rather than a service-role key.
 *
 * There is no service-role client anywhere in this app on purpose. RLS
 * (001_initial_schema.sql) already restricts anon reads to published pages
 * on active sites, so the queries here don't need their own
 * status = 'published' checks scattered throughout -- one less place to
 * get that condition wrong.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function publicImageUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/page-images/${storagePath}`;
}
