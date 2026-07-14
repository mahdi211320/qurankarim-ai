// نسخهٔ خوداتکا (بدون import از _shared) برای Paste مستقیم در Supabase Dashboard
// همان عملکرد supabase/functions/admin-manage-users/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ error: { message, details: details ?? null } }, status)
}
function createUserClient(req: Request) {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
  })
}
function createServiceClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}
async function isRequestFromAdmin(req: Request): Promise<boolean> {
  const userClient = createUserClient(req)
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return false
  const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

const STUDENT_EMAIL_DOMAIN = 'students.quranapp.internal'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!(await isRequestFromAdmin(req))) {
      return errorResponse('این عملیات فقط برای مدیر سامانه مجاز است.', 403)
    }

    const body = await req.json()
    const service = createServiceClient()

    if (body.action === 'list') return await listUsers(service, body.role)
    if (body.action === 'create') return await createUser(service, body)
    if (body.action === 'delete') return await deleteUser(service, body.user_id)
    return errorResponse('action نامعتبر است.', 400)
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در مدیریت کاربران.', 500, String(err))
  }
})

async function listUsers(service: ReturnType<typeof createServiceClient>, role: string) {
  const { data: profiles, error } = await service
    .from('profiles').select('id, full_name, role, created_at').eq('role', role).order('created_at', { ascending: false })
  if (error) return errorResponse('واکشی کاربران ناموفق بود.', 500, error)

  let extra = new Map<string, Record<string, unknown>>()
  if (role === 'student') {
    const { data: students } = await service.from('students').select('profile_id, student_code, national_id, class_id')
    extra = new Map((students ?? []).map((s) => [s.profile_id, s]))
  }

  let teacherRowIdByProfile = new Map<string, string>()
  if (role === 'teacher') {
    const { data: teacherRows } = await service.from('teachers').select('id, profile_id')
    teacherRowIdByProfile = new Map((teacherRows ?? []).map((t) => [t.profile_id, t.id]))
  }

  let emailById = new Map<string, string>()
  if (role !== 'student') {
    const { data: authUsers } = await service.auth.admin.listUsers({ perPage: 1000 })
    emailById = new Map((authUsers?.users ?? []).map((u) => [u.id, u.email ?? '']))
  }

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name,
    role: p.role,
    code: extra.get(p.id)?.student_code ?? '—',
    national_id: extra.get(p.id)?.national_id ?? null,
    class_id: extra.get(p.id)?.class_id ?? null,
    teacher_row_id: teacherRowIdByProfile.get(p.id) ?? null,
    email: emailById.get(p.id) ?? '—'
  }))

  return jsonResponse({ users })
}

async function createUser(service: ReturnType<typeof createServiceClient>, body: any) {
  const { role, full_name, email, password, national_id, student_code, class_id, parent_phone } = body
  if (!full_name || !role) return errorResponse('نام و نقش الزامی هستند.', 400)

  let finalEmail = email
  let finalPassword = password

  if (role === 'student') {
    if (!national_id || !student_code) return errorResponse('کد ملی و کد دانش‌آموزی الزامی هستند.', 400)
    finalEmail = `${national_id}@${STUDENT_EMAIL_DOMAIN}`
    finalPassword = student_code
  } else if (!email || !password) {
    return errorResponse('ایمیل و رمز عبور الزامی هستند.', 400)
  }

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: finalEmail, password: finalPassword, email_confirm: true,
    user_metadata: { full_name, role }
  })

  if (createError || !created?.user) {
    return errorResponse(
      createError?.message?.includes('already been registered') ? 'این ایمیل/کد قبلاً ثبت شده است.' : 'ساخت حساب ناموفق بود.',
      400, createError
    )
  }

  if (role === 'student') {
    const { error: studentError } = await service.from('students').insert({
      profile_id: created.user.id, class_id: class_id || null, national_id, student_code, parent_phone: parent_phone || null
    })
    if (studentError) return errorResponse('حساب ساخته شد ولی ثبت در جدول دانش‌آموزان ناموفق بود.', 500, studentError)
  }

  if (role === 'teacher') {
    const { error: teacherError } = await service.from('teachers').insert({ profile_id: created.user.id })
    if (teacherError) return errorResponse('حساب ساخته شد ولی ثبت در جدول معلم‌ها ناموفق بود.', 500, teacherError)
  }

  return jsonResponse({ id: created.user.id })
}

async function deleteUser(service: ReturnType<typeof createServiceClient>, userId: string) {
  if (!userId) return errorResponse('user_id الزامی است.', 400)
  const { error } = await service.auth.admin.deleteUser(userId)
  if (error) return errorResponse('حذف کاربر ناموفق بود.', 500, error)
  return jsonResponse({ deleted: true })
}
