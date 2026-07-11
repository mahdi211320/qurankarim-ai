// Edge Function: grade-quiz
// ورودی:  { quiz_id: string, student_answers: { question_index: number, answer: string }[] }
// خروجی:  { final_score: number, results: { question_index, correct, feedback }[] }
//
// سؤالات چندگزینه‌ای به‌صورت محلی (بدون هزینهٔ API) تصحیح می‌شوند.
// سؤالات تشریحی با GPT-4o در برابر پاسخ نمونه ارزیابی می‌شوند.
// اگر نمرهٔ نهایی ≥ ۷۰ باشد، student_progress.quiz_score نیز به‌روزرسانی می‌شود.

import { handleOptions, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { createUserClient } from '../_shared/supabaseClients.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!

Deno.serve(async (req) => {
  const preflight = handleOptions(req)
  if (preflight) return preflight

  try {
    const { quiz_id, student_answers } = await req.json()
    if (!quiz_id || !Array.isArray(student_answers)) {
      return errorResponse('quiz_id و student_answers الزامی هستند.', 400)
    }

    const supabase = createUserClient(req)

    const { data: quiz, error: quizError } = await supabase
      .from('ai_generated_quizzes')
      .select('id, lesson_id, student_id, questions')
      .eq('id', quiz_id)
      .single()

    if (quizError || !quiz) {
      return errorResponse('آزمون پیدا نشد.', 404, quizError)
    }

    const answerByIndex = new Map(student_answers.map((a: any) => [a.question_index, a.answer]))
    const results: { question_index: number; correct: boolean; feedback: string }[] = []
    const shortAnswerJobs: { index: number; question: string; expected: string; given: string }[] = []

    quiz.questions.forEach((q: any, index: number) => {
      const given = String(answerByIndex.get(index) ?? '').trim()
      if (q.type === 'mcq') {
        const correct = given.trim() === String(q.answer).trim()
        results[index] = { question_index: index, correct, feedback: correct ? 'پاسخ صحیح بود.' : `پاسخ صحیح: ${q.answer}` }
      } else {
        // ارزیابی سؤالات تشریحی به GPT-4o واگذار می‌شود
        shortAnswerJobs.push({ index, question: q.question, expected: q.answer, given })
      }
    })

    if (shortAnswerJobs.length > 0) {
      const gradingPrompt = `برای هرکدام از پاسخ‌های زیر، مشخص کن آیا از نظر مفهومی با پاسخ نمونه هم‌خوانی دارد یا نه (نیازی به تطابق کلمه‌به‌کلمه نیست) و یک بازخورد کوتاه فارسی بده. خروجی را فقط به‌صورت { "results": [{ "index": number, "correct": boolean, "feedback": "..." }] } برگردان.

${shortAnswerJobs
  .map((j) => `سؤال ${j.index}: ${j.question}\nپاسخ نمونه: ${j.expected}\nپاسخ دانش‌آموز: ${j.given || '(بدون پاسخ)'}`)
  .join('\n\n')}`

      const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: gradingPrompt }]
        })
      })

      if (!aiResponse.ok) {
        const detail = await aiResponse.text()
        return errorResponse('خطا در تصحیح هوش مصنوعی.', 502, detail)
      }

      const aiData = await aiResponse.json()
      const parsed = JSON.parse(aiData.choices[0].message.content)
      for (const r of parsed.results ?? []) {
        results[r.index] = { question_index: r.index, correct: r.correct, feedback: r.feedback }
      }
    }

    const correctCount = results.filter((r) => r?.correct).length
    const finalScore = Math.round((correctCount / quiz.questions.length) * 100)

    const { error: updateQuizError } = await supabase
      .from('ai_generated_quizzes')
      .update({ student_answers, final_score: finalScore })
      .eq('id', quiz_id)

    if (updateQuizError) {
      return errorResponse('ثبت نتیجهٔ آزمون با خطا مواجه شد.', 500, updateQuizError)
    }

    // نمرهٔ آزمون همیشه ثبت می‌شود (نه فقط در صورت قبولی)؛ upsert چون ممکن است این
    // اولین فعالیتی باشد که برای این درس ثبت می‌شود
    await supabase
      .from('student_progress')
      .upsert(
        { student_id: quiz.student_id, lesson_id: quiz.lesson_id, quiz_score: finalScore },
        { onConflict: 'student_id,lesson_id' }
      )

    return jsonResponse({ final_score: finalScore, results })
  } catch (err) {
    return errorResponse('خطای غیرمنتظره در تصحیح آزمون.', 500, String(err))
  }
})
