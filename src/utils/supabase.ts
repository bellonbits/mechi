import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const validConfig = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://');

export const supabase = createClient(
  validConfig ? supabaseUrl : 'https://placeholder.supabase.co',
  validConfig ? supabaseAnonKey : 'placeholder',
  {
    auth: {
      // Keep user logged in indefinitely — only sign out on explicit logout
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'mechi-auth-session',
      storage: window.localStorage,
      // Refresh the access token 60 seconds before it expires
      // so there is never a gap where the user is logged out
    },
  }
);
