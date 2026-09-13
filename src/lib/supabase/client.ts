import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase client — used in Client Components (forms, live
// editing). Reads the public URL + anon key from env vars set in
// .env.local (dev) or the Vercel project settings (prod).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
