import { supabase } from './supabaseClient.js'

// لایهٔ یکپارچهٔ فراخوانی Edge Functionها. هر تابع همیشه شکل
// { data, error } را برمی‌گرداند تا کامپوننت‌ها مجبور به try/catch پراکنده نباشند.

const DEFAULT_RETRIES = 1

async function invokeWithRetry(functionName, body, retries = DEFAULT_RETRIES) {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body })
      if (error) {
        lastError = error
        continue
      }
      return { data, error: null }
    } catch (err) {
      lastError = err
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
