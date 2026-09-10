// Supabase project URL and publishable key are public client configuration.
// Security is enforced by Row Level Security (RLS), never by hiding this key.
const DEFAULT_SUPABASE_URL = 'https://ovtnbytzbahokxlwbmkm.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qG1fKvyXeWgoFYqcBqCp2Q__6CxVAVe';

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}
