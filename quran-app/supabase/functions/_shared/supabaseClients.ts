import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

/**
 * کلاینتی که با JWT خود کاربر ساخته می‌شود؛ همهٔ سیاست‌های RLS روی آن اعمال می‌شود.
 * برای عملیات‌هایی که باید محدود به داده‌های خود دانش‌آموز/معلم باشند استفاده کنید.
 */
export function createUserClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? ''
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } }
  })
}

/**
 * کلاینت با service_role که RLS را دور می‌زند. فقط برای عملیات‌های سرتاسری
 * (مثل مدیریت فضای ذخیره‌سازی توسط ادمین) و پس از احراز نقش کاربر استفاده شود.
 * SUPABASE_SERVICE_ROLE_KEY باید فقط به‌صورت secret روی Edge Function تنظیم شود،
 * هرگز در فرانت‌اند قرار نگیرد.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}

/** بررسی اینکه آیا کاربر جاری (بر اساس JWT) نقش ادمین دارد یا نه */
export async function isRequestFromAdmin(req: Request): Promise<boolean> {
  const userClient = createUserClient(req)
  const {
    data: { user }
  } = await userClient.auth.getUser()
  if (!user) return false

  const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}
