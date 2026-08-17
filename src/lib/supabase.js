import { createClient } from '@supabase/supabase-js'

// Strip any trailing path segments (like /rest/v1/) — the client
// needs the bare project URL and appends service paths itself.
const rawUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = rawUrl.replace(/\/(rest|auth|storage|realtime)\/v\d+\/?$/, '')

// Supabase recently renamed "anon key" → "publishable key".
// We check both env var names so it works either way.
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)