// Edge Function: process-recitation
// ورودی:  { audio_path: string, lesson_id: string, student_id: string, duration_seconds?: number }
//   audio_path مسیر فایلی است که فرانت‌اند از قبل در باکت Storage به نام «recitations» آپلود کرده.
// خروجی:  { similarity_score: number, feedback: string, transcript: string }
//
// مراحل: دانلود فایل از Storage → رونویسی با Whisper → مقایسهٔ متن با آیات اصلی درس →
// ذخیره در audio_recordings → به‌روزرسانی student_progress.recitation_score

import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createUserClient } from '../_shared/supabaseClients.ts'
import { calculateSimilarityScore, feedbackForScore } from '../_shared/similarity.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { audio_path, lesson_id, student_id, duration_seconds } = await req.json()
    if (!audio_path || !lesson_id || !student_id) {
      return errorResponse('audio_path، lesson_id و student_id الزامی هستند.', 400)
    }

    const supabase = createUserClient(req)

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('quran_text_arabic')
      .eq('id', lesson_id)
      .single()
    if (lessonError || !lesson) {
      return errorResponse('درس مورد نظر پیدا نشد.', 404, lessonError)
    }

    const { data: audioBlob, error: downloadError } = await supabase.storage
      .from('recitations')
      .download(audio_path)
    if (downloadError || !audioBlob) {
      return errorResponse('دانلود فایل صوتی از Storage ناموفق بود.', 500, downloadError)
    }

    // فراخوانی Whisper برای رونویسی صوت
    const whisperForm = new FormData()
    whisperForm.append('file', audioBlob, 'recitation.webm')
    whisperForm.append('model', 'whisper-1')
    whisperForm.append('language', 'ar')

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: whisperForm
    })

    if (!whisperResponse.ok) {
      const detail = await whisperResponse.text()
      return errorResponse('خطا در رونویسی صوت (Whisper).', 502, detail)
    }

    const whisperData = await whisperResponse.json()
    const transcript: string = whisperData.text ?? ''

    const similarityScore = calculateSimilarityScore(lesson.quran_text_arabic, transcript)
    const feedback = feedbackForScore(similarityScore)

    const { data: publicUrlData } = supabase.storage.from('recitations').getPublicUrl(audio_path)

    const { error: insertError } = await supabase.from('audio_recordings').insert({
      student_id,
      lesson_id,
      audio_url: publicUrlData.publicUrl,
      whisper_transcript: transcript,
      similarity_score: similarityScore,
      ai_feedback: feedback,
      duration_seconds: duration_seconds ?? null
    })
    if (insertError) {
      return errorResponse('ذخیرهٔ نتیجهٔ تلاوت با خطا مواجه شد.', 500, insertError)
    }

    // ثبت/به‌روزرسانی امتیاز تلاوت در پیشرفت درس (upsert، چون ممکن است این
    // اولین فعالیتی باشد که دانش‌آموز برای این درس انجام می‌دهد)
    await supabase
      .from('student_progress')
      .upsert(
        { student_id, lesson_id, act2_done: true, recitation_score: similarityScore },
        { onConflict: 'student_id,lesson_id' }
      )

    return jsonResponse({ similarity_score: similarityScore, feedback, transcript })
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در پردازش تلاوت.', 500, String(err))
  }
})
