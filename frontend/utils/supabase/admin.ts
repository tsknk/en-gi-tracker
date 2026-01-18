import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client (サーバーサイド専用)
 * Service Role Keyを使用するため、クライアント側では使用しないでください
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase admin environment variables. Please check your .env.local file.');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
