import { supabase } from './supabaseClient.js'

// لایهٔ یکپارچهٔ فراخوانی Edge Functionها. هر تابع همیشه شکل
// { data, error } را برمی‌گرداند تا کامپوننت‌ها مجبور به try/catch پراکنده نباشند.

const DEFAULT_RETRIES = 2

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function invokeWithRetry(functionName, body, retries = DEFAULT_RETRIES) {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body })
      if (error) {
        lastError = error
        // مکث کوتاه و فزاینده قبل از تلاش بعدی؛ برای خطاهای موقت مثل محدودیت نرخ
        // درخواست (rate limit) وقتی چند دانش‌آموز هم‌زمان درخواست می‌فرستند مفید است
        if (attempt < retries) await wait(700 * (attempt + 1))
        continue
      }
      return { data, error: null }
    } catch (err) {
      lastError = err
      if (attempt < retries) await wait(700 * (attempt + 1))
    }
  }

  return {
    data: null,
    error: {
      message: lastError?.message || 'خطا در ارتباط با سرور. اتصال اینترنت را بررسی کنید.',
      raw: lastError
    }
  }
}

/** تولید آزمون هوش‌مصنوعی برای یک درس */
export async function generateQuiz(lessonId, studentId) {
  return invokeWithRetry('generate-quiz', { lesson_id: lessonId, student_id: studentId })
}

/** ارسال پاسخ‌های دانش‌آموز برای تصحیح */
export async function gradeQuiz(quizId, studentAnswers) {
  return invokeWithRetry('grade-quiz', { quiz_id: quizId, student_answers: studentAnswers })
}

/**
 * آپلود فایل صوتی به Storage و سپس فراخوانی process-recitation.
 * @param {Blob} audioBlob
 * @param {{ lessonId: string, studentId: string, durationSeconds?: number }} meta
 */
export async function uploadAndProcessRecitation(audioBlob, { lessonId, studentId, durationSeconds }) {
  const path = `${studentId}/${lessonId}/${Date.now()}.webm`

  const { error: uploadError } = await supabase.storage
    .from('recitations')
    .upload(path, audioBlob, { contentType: 'audio/webm' })

  if (uploadError) {
    return { data: null, error: { message: 'آپلود فایل صوتی ناموفق بود.', raw: uploadError } }
  }

  return invokeWithRetry('process-recitation', {
    audio_path: path,
    lesson_id: lessonId,
    student_id: studentId,
    duration_seconds: durationSeconds
  })
}

/** گزارش استفادهٔ فعلی از فضای ذخیره‌سازی (فقط ادمین) */
export async function getStorageUsage() {
  return invokeWithRetry('storage-manager', { action: 'usage' })
}

/** پیش‌نمایش پاک‌سازی هوشمند بدون حذف واقعی (فقط ادمین) */
export async function previewCleanup() {
  return invokeWithRetry('storage-manager', { action: 'cleanup-preview' })
}

/** اجرای واقعی پاک‌سازی هوشمند (فقط ادمین) */
export async function runCleanup() {
  return invokeWithRetry('storage-manager', { action: 'cleanup' })
}

/**
 * ورود گروهی دانش‌آموزان از فهرست پارس‌شدهٔ CSV (فقط معلمِ صاحب کلاس یا ادمین).
 * @param {string} classId
 * @param {{ full_name: string, national_id: string, student_code: string, parent_phone?: string }[]} students
 */
export async function bulkImportStudents(classId, students) {
  return invokeWithRetry('bulk-import-students', { class_id: classId, students })
}

/** فهرست واقعی کاربران یک نقش (فقط ادمین) */
export async function listAdminUsers(role) {
  return invokeWithRetry('admin-manage-users', { action: 'list', role })
}

/** ساخت واقعی یک کاربر جدید (دانش‌آموز/معلم/مدیر) - فقط ادمین */
export async function createAdminUser(payload) {
  return invokeWithRetry('admin-manage-users', { action: 'create', ...payload })
}

/** حذف واقعی یک کاربر (و همهٔ داده‌های وابسته، به‌خاطر cascade) - فقط ادمین */
export async function deleteAdminUser(userId) {
  return invokeWithRetry('admin-manage-users', { action: 'delete', user_id: userId })
}
