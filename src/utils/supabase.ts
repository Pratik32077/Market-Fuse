import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Simple in‑memory mock that mimics the subset of Supabase client we use in this MVP.
 * It is used when the required environment variables are not present (local dev).
 */
interface RecordMap {
  [table: string]: any[];
}

const mockDB: RecordMap = {};

function getTable(table: string) {
  if (!mockDB[table]) mockDB[table] = [];
  return mockDB[table];
}

function mockFrom(table: string) {
  const arr = getTable(table);
  return {
    select: () => ({ data: arr, error: null } as any),
    insert: async (data: any) => {
      const records = Array.isArray(data) ? data : [data];
      records.forEach((r) => {
        if (!r.id) r.id = crypto.randomUUID();
        arr.push(r);
      });
      return { data: records, error: null } as any;
    },
    update: (updates: any) => ({
      eq: (col: string, val: any) => {
        const matches = arr.filter((r) => r[col] === val);
        matches.forEach((r) => Object.assign(r, updates));
        return { data: matches, error: null } as any;
      },
    } as any),
    delete: () => ({
      eq: (col: string, val: any) => {
        const before = arr.length;
        mockDB[table] = arr.filter((r) => r[col] !== val);
        const after = mockDB[table].length;
        return { data: [], error: null, count: before - after } as any;
      },
    } as any),
    eq: (col: string, val: any) => {
      const filtered = arr.filter((r) => r[col] === val);
      return {
        select: () => ({ data: filtered, error: null } as any),
        order: (col2: string, opts: any) => {
          const sorted = [...filtered].sort((a, b) => {
            if (a[col2] < b[col2]) return opts.ascending ? -1 : 1;
            if (a[col2] > b[col2]) return opts.ascending ? 1 : -1;
            return 0;
          });
          return {
            limit: (n: number) => ({ data: sorted.slice(0, n), error: null } as any),
          } as any;
        },
        limit: (n: number) => ({ data: filtered.slice(0, n), error: null } as any),
      } as any;
    },
  } as any;
}

/**
 * Export a SupabaseClient‑like object.
 * If the required env vars are present, use the real client; otherwise fall back to the mock.
 * In production (NODE_ENV==="production"), missing env vars are treated as a configuration error.
 */
let supabase: SupabaseClient;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
} else {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Supabase environment variables are missing – cannot run in production without real credentials.');
  }
  // Minimal mock sufficient for our UI and tests.
  supabase = {
    from: mockFrom,
    // Minimal auth stub – always returns no session.
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({ error: { message: 'Mock auth – no real login' } }),
      signUp: async () => ({ data: { user: { id: crypto.randomUUID() } }, error: null }),
    },
  } as unknown as SupabaseClient;
}

export { supabase };
