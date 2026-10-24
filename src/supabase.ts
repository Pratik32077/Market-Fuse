import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';

export const supabase = createBrowserSupabaseClient();
