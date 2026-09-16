import { createClient } from '@supabase/supabase-js'

// 使用环境变量或安全兜底值，确保构建阶段（Next.js static export / Tauri build）不报空值错误
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
