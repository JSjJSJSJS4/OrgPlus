import { createClient } from '@supabase/supabase-js'

// Environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. Please configure them in a .env file.'
  )
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl || 'https://placeholder-url.supabase.co', supabaseAnonKey || 'placeholder-anon-key')
