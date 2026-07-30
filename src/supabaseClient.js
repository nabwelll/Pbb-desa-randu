import { createClient } from '@supabase/supabase-js'

const normalizeEnvValue = (value) => value?.trim().replace(/^\[(.*)\]$/, '$1').replace(/^['"](.*)['"]$/, '$1')

const supabaseUrl = normalizeEnvValue(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = normalizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY harus diisi di .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)