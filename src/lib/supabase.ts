import { createClient } from '@supabase/supabase-js';

// STAR CHAIN LABS CRM - Supabase Configuration (Supports Vercel & Local Vite Env)
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://yvmjnwwxhdvfzhtrlyuk.supabase.co';

export const SUPABASE_PUBLISHABLE_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_6vUGBCSiGgKGfWBrOED7Bg_i0Z7LIjA';

export const SUPABASE_SECRET_KEY = 
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  import.meta.env.VITE_SUPABASE_SECRET_KEY || 
  '';

// Standard client for authenticated / public browser operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin / Service client for server-side authority, schema verification & privileged sync
export const supabaseAdmin = SUPABASE_SECRET_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;

export interface SupabaseHealthStatus {
  connected: boolean;
  latencyMs: number;
  tablesFound: string[];
  error?: string;
  mode: 'supabase_live' | 'supabase_sync_fallback';
}

/**
 * Checks connectivity to the Supabase PostgreSQL backend
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const startTime = performance.now();
  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/', {
      headers: {
        'apikey': SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY,
        'Authorization': 'Bearer ' + (SUPABASE_SECRET_KEY || SUPABASE_PUBLISHABLE_KEY),
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const definitions = Object.keys(data?.definitions || {});
      return {
        connected: true,
        latencyMs,
        tablesFound: definitions,
        mode: definitions.includes('attendance_events') ? 'supabase_live' : 'supabase_sync_fallback',
      };
    }

    return {
      connected: false,
      latencyMs,
      tablesFound: [],
      error: 'HTTP ' + res.status + ': ' + res.statusText,
      mode: 'supabase_sync_fallback',
    };
  } catch (err: any) {
    return {
      connected: false,
      latencyMs: Math.round(performance.now() - startTime),
      tablesFound: [],
      error: err?.message || 'Network unreachable',
      mode: 'supabase_sync_fallback',
    };
  }
}
