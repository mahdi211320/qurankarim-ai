// Edge Function: generate-quiz
// ورودی:  { lesson_id: string, student_id: string }
// خروجی:  { quiz_id: string, questions: { type, question, options? }[] }  (بدون پاسخ صحیح)
//
// این تابع فعالیت‌های ۱ تا ۳ درس را می‌خواند، به GPT-4o می‌دهد تا ۵ سؤال چندگزینه‌ای
// و ۲ سؤال تشریحی کوتاه بسازد، نتیجه را در ai_generated_quizzes ذخیره می‌کند و
// نسخه‌ای بدون پاسخ صحیح را برای فرانت‌اند برمی‌گرداند (تا تقلب ممکن نباشد).

import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createUserClient } from '../_shared/supabaseClients.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { lesson_id, student_id } = await req.json()
    if (!lesson_id || !student_id) {
      return errorResponse('lesson_id و student_id الزامی هستند.', 400)
    }

    const supabase = createUserClient(req)

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('title, activity_1_text, activity_2_text, activity_3_text')
      .eq('id', lesson_id)
      .single()

    if (lessonError || !lesson) {
      return errorResponse('درس مورد نظر پیدا نشد.', 404, lessonError)
    }

    const prompt = `شما یک دبیر قرآن در دورهٔ اول متوسطه هستید. بر اساس فعالیت‌های زیر از درس «${lesson.title}»، دقیقاً ۵ سؤال چندگزینه‌ای (هرکدام ۴ گزینه) و ۲ سؤال تشریحی کوتاه به زبان فارسی طراحی کن. سؤالات باید فقط بر اساس همین متن باشند، نه اطلاعات بیرونی.

فعالیت ۱ (درک معنا): ${lesson.activity_1_text}
فعالیت ۲ (تلاوت): ${lesson.activity_2_text}
فعالیت ۳ (تدبر): ${lesson.activity_3_text}

فقط یک آرایهٔ JSON معتبر برگردان، دقیقاً با این ساختار و بدون هیچ متن اضافه:
[
  { "type": "mcq", "question": "...", "options": ["...", "...", "...", "..."], "answer": "متن گزینهٔ صحیح" },
  { "type": "short", "question": "...", "answer": "پاسخ نمونهٔ کوتاه برای مبنای تصحیح" }
]`

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'خروجی را همیشه به‌صورت { "questions": [...] } برگردان.'
          },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!aiResponse.ok) {
      const detail = await aiResponse.text()
      return errorResponse('خطا در ارتباط با سرویس هوش مصنوعی.', 502, detail)
    }

    const aiData = await aiResponse.json()
    const parsed = JSON.parse(aiData.choices[0].message.content)
    const questions = parsed.questions ?? parsed

    if (!Array.isArray(questions) || questions.length === 0) {
      return errorResponse('پاسخ هوش مصنوعی معتبر نبود.', 502)
    }

    const { data: inserted, error: insertError } = await supabase
      .from('ai_generated_quizzes')
      .insert({ student_id, lesson_id, questions })
      .select('id, questions')
      .single()

    if (insertError) {
      return errorResponse('ذخیرهٔ آزمون با خطا مواجه شد.', 500, insertError)
    }

    // حذف پاسخ صحیح پیش از ارسال به فرانت‌اند
    const safeQuestions = inserted.questions.map(({ type, question, options }: any) => ({
      type,
      question,
      options: options ?? null
    }))

    return jsonResponse({ quiz_id: inserted.id, questions: safeQuestions })
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در تولید آزمون.', 500, String(err))
  }
})
