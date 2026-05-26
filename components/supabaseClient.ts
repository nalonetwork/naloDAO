import { createClient } from '@supabase/supabase-js';

// Retrieve your cloud database connection credentials from your hidden environment file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Quick safety check: If you forgot to paste them into .env.local, this will warn you in the console
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ NaloDAO Warning: Supabase credentials missing! " +
    "Make sure your .env.local file has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY filled out."
  );
}

// Export the initialized database bridge tool
export const supabase = createClient(supabaseUrl, supabaseAnonKey);