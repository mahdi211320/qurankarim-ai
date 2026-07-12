import { supabase } from './supabaseClient.js'

// این ماژول پیشرفت واقعی دانش‌آموز (فعالیت‌های ۱ تا ۳، نمرهٔ آزمون، نمرهٔ تلاوت) را
// در جدول Supabase «student_progress» می‌خواند/می‌نویسد. نوشتن مستقیماً از سمت
// کلاینت با کلید anon انجام می‌شود چون RLS از قبل تضمین می‌کند دانش‌آموز فقط
// می‌تواند رکورد خودش را بخواند/ویرایش کند.

/** واکشی پیشرفت یک دانش‌آموز برای یک درس (بر اساس UUID واقعی هر دو) */
export async function fetchStudentProgress(studentId, lessonDbId) {
  if (!studentId || !lessonDbId) return { data: null, error: null }
  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonDbId)
    .maybeSingle()
  return { data, error }
}

/**
 * ثبت/به‌روزرسانی بخشی از پیشرفت (مثلاً فقط act1_done، یا فقط recitation_score).
 * چون ممکن است این اولین فعالیت ثبت‌شده برای این درس باشد، از upsert استفاده می‌شود.
 */
export async function upsertStudentProgress(studentId, lessonDbId, updates) {
  if (!studentId || !lessonDbId) {
    return { data: null, error: { message: 'شناسهٔ دانش‌آموز یا درس در دسترس نیست.' } }
  }
  const { data, error } = await supabase
    .from('student_progress')
    .upsert({ student_id: studentId, lesson_id: lessonDbId, ...updates }, { onConflict: 'student_id,lesson_id' })
    .select()
    .single()
  return { data, error }
}
