import { createClient } from '@supabase/supabase-js'

// مقادیر را در فایل .env قرار دهید (نمونه در .env.example موجود است)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasRealConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasRealConfig) {
  console.warn(
    '[Supabase] متغیرهای محیطی VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY تنظیم نشده‌اند. ' +
      'اپ در حالت پیش‌نمایش (فقط دکمه‌های ورود آزمایشی) کار می‌کند.'
  )
}

// اگر تنظیم نشده باشند، یک آدرس ساختگی ولی معتبر (از نظر فرمت URL) استفاده می‌شود
// تا createClient خطا ندهد و کل اپ کرش نکند؛ فراخوانی‌های واقعی Supabase صرفاً
// با خطای شبکه مواجه می‌شوند که همه‌جا با try/catch مدیریت شده است.
export const supabase = createClient(
  hasRealConfig ? supabaseUrl : 'https://placeholder.supabase.co',
  hasRealConfig ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)

export const isSupabaseConfigured = hasRealConfig
