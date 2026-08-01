import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * クライアントコンポーネント / 一般用 Supabase クライアント
 */
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * ブラウザコンポーネント明示用 Supabase クライアント作成関数
 */
export function createBrowserClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey
  );
}

/**
 * サーバー側 (API Routes / Server Actions) 用 Supabase クライアント作成関数
 * (管理者権限が必要なオペレーション時に SERVICE_ROLE_KEY を使用)
 */
export function createServerAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Falling back to anon key.');
  }
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl,
    serviceRoleKey || supabaseAnonKey
  );
}
