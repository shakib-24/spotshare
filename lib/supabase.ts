import { createBrowserClient } from '@supabase/ssr';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient(url?: string, key?: string) {
  return createBrowserClient(
    url || supabaseUrl,
    key || supabaseAnonKey
  );
}

export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers');
  const { createServerClient } = await import('@supabase/ssr');
  const cookieStore = await cookies();
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}