import { createClient } from "@supabase/supabase-js";

// Ensure these environment variables are set in .env.local and Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
// We use the SERVICE_ROLE_KEY to bypass Row Level Security (RLS) since these uploads are performed by authenticated Admin Server Actions/API routes.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ [Supabase Storage] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
