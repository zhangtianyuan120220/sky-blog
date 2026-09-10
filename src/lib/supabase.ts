import { createClient } from '@supabase/supabase-js'

// 使用兜底字符串，防止打包（next build / ssg）预渲染阶段报错
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)