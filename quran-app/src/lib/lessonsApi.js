import { supabase } from './supabaseClient.js'

// این ماژول محتوای واقعی دروس (متن قرآن، فعالیت‌ها، صوت قاری) را از جدول
// Supabase «lessons» می‌خواند/می‌نویسد. برای سازگاری با بقیهٔ اپ (که هنوز از
// mockData.js برای فهرست/وضعیت دروس استفاده می‌کند)، شناسهٔ هر درس در سمت
// کلاینت همان الگوی موجود `l{grade_level}_{lesson_number}` است، نه UUID واقعی
// ردیف؛ upsert/select همیشه بر اساس (grade_level, lesson_number) انجام می‌شود.

function toAppLesson(row) {
  const arabicLines = (row.quran_text_arabic || '').split('\n').filter(Boolean)
  const translationLines = (row.translation_fa || '').split('\n').filter(Boolean)
  const verses = arabicLines.map((a, i) => ({ arabic: a, translation: translationLines[i] || '' }))

  return {
    id: `l${row.grade_level}_${row.lesson_number}`,
    dbId: row.id, // UUID واقعی ردیف؛ برای فراخوانی Edge Functionهای آزمون/تلاوت لازم است
    grade_level: row.grade_level,
    lesson_number: row.lesson_number,
    title: row.title,
    is_term1_limited: row.is_term1_limited,
    verses,
    activities: {
      act1: { prompt: row.activity_1_text || '', placeholder: 'پاسخ خود را اینجا بنویسید...' },
      act2: { instruction: row.activity_2_text || '' },
      act3: { prompt: row.activity_3_text || '', placeholder: 'تدبر خود را اینجا بنویسید...' }
    },
    dailyReading: row.daily_reading_text || '',
    audioUrl: row.audio_url || null
  }
}

/** واکشی محتوای واقعی یک درس بر اساس پایه و شمارهٔ درس (نه mock id) */
export async function fetchLessonContent(gradeLevel, lessonNumber) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('grade_level', gradeLevel)
    .eq('lesson_number', lessonNumber)
    .maybeSingle()

  if (error || !data) return { data: null, error }
  return { data: toAppLesson(data), error: null }
}

/** واکشی همهٔ دروس واقعی یک پایه (برای پنل مدیریت دروس) */
export async function fetchLessonsForGrade(gradeLevel) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('grade_level', gradeLevel)
    .order('lesson_number')

  if (error || !data) return { data: null, error }
  return { data: data.map(toAppLesson), error: null }
}

/**
 * ذخیرهٔ متن درس (عنوان، آیات، ترجمه، فعالیت‌ها، انس روزانه) در دیتابیس واقعی.
 * چون ممکن است این درس هنوز هیچ ردیفی در دیتابیس نداشته باشد (فقط در mockData
 * تعریف شده)، از upsert بر اساس (grade_level, lesson_number) استفاده می‌شود.
 */
export async function saveLessonContent(lesson) {
  const payload = {
    grade_level: lesson.grade_level,
    lesson_number: lesson.lesson_number,
    title: lesson.title,
    quran_text_arabic: lesson.verses.map((v) => v.arabic).join('\n'),
    translation_fa: lesson.verses.map((v) => v.translation).join('\n'),
    activity_1_text: lesson.activities?.act1?.prompt || '',
    activity_2_text: lesson.activities?.act2?.instruction || '',
    activity_3_text: lesson.activities?.act3?.prompt || '',
    daily_reading_text: lesson.dailyReading || '',
    is_term1_limited: lesson.is_term1_limited ?? true
  }

  const { data, error } = await supabase
    .from('lessons')
    .upsert(payload, { onConflict: 'grade_level,lesson_number' })
    .select()
    .single()

  if (error || !data) return { data: null, error }
  return { data: toAppLesson(data), error: null }
}

/**
 * آپلود فایل صوتی قاری به باکت عمومی «lesson-audio» و ثبت لینک آن روی درس.
 * باید پس از اطمینان از وجود ردیف درس در دیتابیس فراخوانی شود (یعنی بعد از
 * saveLessonContent) چون این تابع فقط UPDATE می‌کند، نه upsert.
 */
export async function uploadLessonAudio(gradeLevel, lessonNumber, file) {
  const path = `${gradeLevel}-${lessonNumber}.mp3`

  const { error: uploadError } = await supabase.storage
    .from('lesson-audio')
    .upload(path, file, { upsert: true, contentType: file.type || 'audio/mpeg' })

  if (uploadError) return { data: null, error: uploadError }

  const { data: publicUrlData } = supabase.storage.from('lesson-audio').getPublicUrl(path)

  const { data, error } = await supabase
    .from('lessons')
    .update({ audio_url: publicUrlData.publicUrl })
    .eq('grade_level', gradeLevel)
    .eq('lesson_number', lessonNumber)
    .select()
    .single()

  if (error || !data) return { data: null, error }
  return { data: toAppLesson(data), error: null }
}
