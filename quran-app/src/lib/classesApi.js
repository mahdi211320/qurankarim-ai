import { supabase } from './supabaseClient.js'

// این ماژول کلاس‌های واقعی را از جدول Supabase «classes» می‌خواند/می‌سازد.
// برای دسترسی همگانی (هم ادمین هم معلم) از select عادی با RLS استفاده می‌شود.

/** فهرست واقعی همهٔ کلاس‌ها (برای پنل ادمین) */
export async function fetchClasses() {
  const { data, error } = await supabase
    .from('classes')
    .select('id, class_name, grade_level, academic_year, teacher_id')
    .order('grade_level')
    .order('class_name')
  return { data, error }
}

/** ساخت یک کلاس واقعی جدید (فقط ادمین یا معلم صاحب آن، طبق RLS) */
export async function createClass({ className, gradeLevel, academicYear, teacherId }) {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      class_name: className,
      grade_level: gradeLevel,
      academic_year: academicYear || undefined,
      teacher_id: teacherId || null
    })
    .select()
    .single()
  return { data, error }
}

/** تخصیص/تغییر معلمِ یک کلاس (فقط ادمین) */
export async function assignClassTeacher(classId, teacherId) {
  const { data, error } = await supabase.from('classes').update({ teacher_id: teacherId }).eq('id', classId).select().single()
  return { data, error }
}
