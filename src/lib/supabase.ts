import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Export null if credentials are missing so the app can show a configuration warning
// instead of crashing completely.
export const supabase = isDemoMode 
  ? null as any
  : createClient(supabaseUrl, supabaseAnonKey);


