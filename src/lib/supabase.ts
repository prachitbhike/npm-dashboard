import { createClient } from '@supabase/supabase-js'

// Support both Vite (import.meta.env) and Node.js (process.env) environments
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface PackageDownloads {
  id: string
  package_name: string
  downloads: number
  date: string
  created_at: string
}

export interface Package {
  id: string
  name: string
  description: string | null
  repository: string | null
  last_updated: string
  created_at: string
}
