// Edge Function: bulk-import-students
// ورودی:  { class_id: string, students: { full_name: string, national_id: string, student_code: string, parent_phone?: string }[] }
// خروجی:  { created_count: number, failed: { national_id: string, reason: string }[] }
//
// فقط ادمین سامانه می‌تواند این عملیات را انجام دهد (معلم فقط نقش نظارتی دارد
// و اجازهٔ افزودن/حذف دانش‌آموز ندارد).
// نام کاربری ورود = کد ملی دانش‌آموز (یکتا و قابل‌اعتماد). چون دانش‌آموزان ایمیل
// شخصی ندارند، برای هر کد ملی یک ایمیل داخلی به‌صورت
// `{national_id}@students.quranapp.internal` ساخته می‌شود که کاربر هرگز آن را
// نمی‌بیند. رمز عبور پیش‌فرض همان student_code است.
// (توصیه می‌شود بعداً امکان تغییر رمز عبور برای دانش‌آموز اضافه شود.)

import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createUserClient, createServiceClient, isRequestFromAdmin } from '../_shared/supabaseClients.ts'

const EMAIL_DOMAIN = 'students.quranapp.internal'

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { class_id, students } = await req.json()
    if (!class_id || !Array.isArray(students) || students.length === 0) {
      return errorResponse('class_id و فهرست students الزامی هستند.', 400)
    }

    if (!(await isRequestFromAdmin(req))) {
      return errorResponse('این عملیات فقط برای مدیر سامانه مجاز است.', 403)
    }

    const userClient = createUserClient(req)
    const { data: cls, error: clsError } = await userClient
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .single()
    if (clsError || !cls) return errorResponse('کلاس پیدا نشد.', 404, clsError)

    const service = createServiceClient()
    const failed: { national_id: string; reason: string }[] = []
    let createdCount = 0

    for (const raw of students) {
      const fullName = String(raw.full_name ?? '').trim()
      const nationalId = String(raw.national_id ?? '').trim()
      const studentCode = String(raw.student_code ?? '').trim()

      if (!fullName || !nationalId || !studentCode) {
        failed.push({
          national_id: nationalId || '—',
          reason: 'نام، کد ملی یا کد دانش‌آموزی خالی است.'
        })
        continue
      }

      const email = `${nationalId}@${EMAIL_DOMAIN}`

      const { data: created, error: createError } = await service.auth.admin.createUser({
        email,
        password: studentCode,
        email_confirm: true,
        user_metadata: { full_name: fullName, role: 'student' }
      })

      if (createError || !created?.user) {
        failed.push({
          national_id: nationalId,
          reason: createError?.message?.includes('already been registered')
            ? 'این کد ملی قبلاً ثبت شده است.'
            : createError?.message ?? 'خطای نامشخص در ساخت حساب.'
        })
        continue
      }

      const { error: insertError } = await service.from('students').insert({
        profile_id: created.user.id,
        class_id,
        national_id: nationalId,
        student_code: studentCode,
        parent_phone: raw.parent_phone || null
      })

      if (insertError) {
        failed.push({ national_id: nationalId, reason: 'حساب ساخته شد ولی ثبت در کلاس ناموفق بود.' })
        continue
      }

      createdCount++
    }

    return jsonResponse({ created_count: createdCount, failed })
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در ورود گروهی دانش‌آموزان.', 500, String(err))
  }
})
