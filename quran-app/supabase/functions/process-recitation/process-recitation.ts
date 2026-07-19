// نسخهٔ خوداتکا (بدون import از _shared) برای Paste مستقیم در Supabase Dashboard
// همان عملکرد supabase/functions/process-recitation/index.ts

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

function normalizeArabicText(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ی')
    .replace(/[^\p{L}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}
function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }
  return dp[a.length][b.length]
}
function calculateSimilarityScore(original: string, transcript: string): number {
  const a = normalizeArabicText(original)
  const b = normalizeArabicText(transcript)
  if (!a.length && !b.length) return 100
  const distance = levenshteinDistance(a, b)
  const maxLen = Math.max(a.length, b.length, 1)
  return Math.max(0, Math.round((1 - distance / maxLen) * 100))
}
function findWordMistakes(original: string, transcript: string, maxMistakes = 6) {
  const a = normalizeArabicText(original).split(' ').filter(Boolean)
  const b = normalizeArabicText(transcript).split(' ').filter(Boolean)

  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
    }
  }

  const mistakes: { type: 'substituted' | 'omitted' | 'extra'; expected?: string; said?: string }[] = []
  let i = a.length
  let j = b.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      i--; j--
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      mistakes.unshift({ type: 'substituted', expected: a[i - 1], said: b[j - 1] })
      i--; j--
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      mistakes.unshift({ type: 'omitted', expected: a[i - 1] })
      i--
    } else {
      mistakes.unshift({ type: 'extra', said: b[j - 1] })
      j--
    }
  }
  return mistakes.slice(0, maxMistakes)
}

function buildRecitationFeedback(
  score: number,
  mistakes: { type: 'substituted' | 'omitted' | 'extra'; expected?: string; said?: string }[]
): string {
  if (mistakes.length === 0) {
    return score >= 95 ? 'عالی بود! تلفظ کاملاً درست بود.' : 'خوب بود، تفاوت محسوسی با متن اصلی پیدا نشد.'
  }
  const parts = mistakes.slice(0, 3).map((m) => {
    if (m.type === 'substituted') return `به‌جای «${m.expected}» گفتید «${m.said}»`
    if (m.type === 'omitted') return `کلمهٔ «${m.expected}» را نخواندید`
    return `کلمهٔ اضافهٔ «${m.said}» گفتید`
  })
  const more = mistakes.length > 3 ? ` و ${mistakes.length - 3} مورد دیگر` : ''
  return `نیاز به تمرین دارد: ${parts.join('، ')}${more}.`
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { audio_path, lesson_id, student_id, duration_seconds } = await req.json()
    if (!audio_path || !lesson_id || !student_id) {
      return errorResponse('audio_path، lesson_id و student_id الزامی هستند.', 400)
    }

    const supabase = createUserClient(req)

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons').select('quran_text_arabic').eq('id', lesson_id).single()
    if (lessonError || !lesson) return errorResponse('درس مورد نظر پیدا نشد.', 404, lessonError)

    const { data: audioBlob, error: downloadError } = await supabase.storage.from('recitations').download(audio_path)
    if (downloadError || !audioBlob) return errorResponse('دانلود فایل صوتی از Storage ناموفق بود.', 500, downloadError)

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
    const mistakes = findWordMistakes(lesson.quran_text_arabic, transcript)
    const feedback = buildRecitationFeedback(similarityScore, mistakes)

    const { data: publicUrlData } = supabase.storage.from('recitations').getPublicUrl(audio_path)

    const { error: insertError } = await supabase.from('audio_recordings').insert({
      student_id, lesson_id,
      audio_url: publicUrlData.publicUrl,
      whisper_transcript: transcript,
      similarity_score: similarityScore,
      ai_feedback: feedback,
      duration_seconds: duration_seconds ?? null
    })
    if (insertError) return errorResponse('ذخیرهٔ نتیجهٔ تلاوت با خطا مواجه شد.', 500, insertError)

    await supabase.from('student_progress').upsert(
      { student_id, lesson_id, act2_done: true, recitation_score: similarityScore },
      { onConflict: 'student_id,lesson_id' }
    )

    return jsonResponse({ similarity_score: similarityScore, feedback, transcript, mistakes })
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در پردازش تلاوت.', 500, String(err))
  }
})
