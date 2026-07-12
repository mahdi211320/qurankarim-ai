// شبیه‌سازی سبک تولید و تصحیح آزمون، برای زمانی که Edge Function واقعی
// (`generate-quiz` / `grade-quiz`) در دسترس نیست - مثلاً در همین محیط پیش‌نمایش
// که هنوز به یک پروژهٔ واقعی Supabase وصل نشده است. رابط خروجی مشابه API واقعی است
// تا جایگزینی بعدی بدون تغییر در کامپوننت‌ها ممکن باشد.

export function generateMockQuiz(lesson) {
  const act1 = lesson.activities?.act1
  const act2 = lesson.activities?.act2
  const act3 = lesson.activities?.act3
  const verses = lesson.verses || []
  const verse = verses[0]
  const verse2 = verses[1]

  const mcqQuestions = [
    {
      type: 'mcq',
      question: `درس «${lesson.title}» دربارهٔ کدام موضوع است؟`,
      options: [lesson.title, 'قصهٔ حضرت موسی', 'احکام نماز', 'تاریخ اسلام'],
      answer: lesson.title
    },
    verse && {
      type: 'mcq',
      question: 'ترجمهٔ صحیح کدام آیه در این درس آمده است؟',
      options: [verse.translation, 'ترجمهٔ نامرتبط اول', 'ترجمهٔ نامرتبط دوم', 'ترجمهٔ نامرتبط سوم'],
      answer: verse.translation
    },
    {
      type: 'mcq',
      question: 'فعالیت دوم این درس به کدام مهارت مربوط است؟',
      options: ['تلاوت و تمرین قرائت', 'حل مسئلهٔ ریاضی', 'نگارش انشا', 'ورزش'],
      answer: 'تلاوت و تمرین قرائت'
    },
    verse2 && {
      type: 'mcq',
      question: 'ترجمهٔ صحیح کدام‌یک از آیات زیر در این درس آمده است؟',
      options: [verse2.translation, 'ترجمهٔ نامرتبط اول', 'ترجمهٔ نامرتبط دوم', 'ترجمهٔ نامرتبط سوم'],
      answer: verse2.translation
    },
    {
      type: 'mcq',
      question: 'کدام‌یک از موارد زیر جزو فعالیت‌های این درس نیست؟',
      options: ['نقاشی آزاد', 'درک معنا (فعالیت ۱)', 'تلاوت (فعالیت ۲)', 'تدبر (فعالیت ۳)'],
      answer: 'نقاشی آزاد'
    }
  ].filter(Boolean)

  const shortQuestions = [
    {
      type: 'short',
      question: act1?.prompt || 'به نظر شما پیام اصلی این درس چیست؟',
      answer: act1?.explanation || 'پاسخ باید به مضمون اصلی درس اشاره کند.'
    },
    {
      type: 'short',
      question: act3?.prompt || 'یک نمونهٔ عملی از زندگی خودتان مرتبط با این درس بنویسید.',
      answer: 'هر پاسخ مرتبط و متناسب با موضوع درس قابل قبول است.'
    },
    {
      type: 'short',
      question: 'خلاصه‌ای از راهنمای تلاوت (فعالیت ۲) این درس را در چند جمله بنویسید.',
      answer: act2?.instruction || 'پاسخ باید نکات اصلی تمرین قرائت این درس را بازگو کند.'
    },
    {
      type: 'short',
      question: 'یکی از آیات این درس را همراه با معنای آن توضیح دهید.',
      answer: verse ? `${verse.arabic} — ${verse.translation}` : 'پاسخ باید به یکی از آیات درس و معنای آن اشاره کند.'
    },
    {
      type: 'short',
      question: 'چرا انس روزانه با قرآن اهمیت دارد؟ نظر خود را بنویسید.',
      answer: lesson.dailyReading || 'پاسخ باید دربارهٔ اهمیت تلاوت و انس روزانه با قرآن باشد.'
    }
  ]

  const questions = [...mcqQuestions.slice(0, 5), ...shortQuestions.slice(0, 5)]

  return { quiz_id: `mock_${lesson.id}`, questions }
}

/** حذف پاسخ صحیح پیش از نمایش به دانش‌آموز (مشابه رفتار Edge Function واقعی) */
export function stripAnswers(questions) {
  return questions.map(({ type, question, options }) => ({ type, question, options: options ?? null }))
}

/** تصحیح محلی: MCQ دقیق، تشریحی صرفاً بر اساس طول/وجود پاسخ (شبیه‌سازی سخاوتمندانه) */
export function gradeMockQuiz(questions, studentAnswers) {
  const answerByIndex = new Map(studentAnswers.map((a) => [a.question_index, a.answer]))
  const results = questions.map((q, index) => {
    const given = String(answerByIndex.get(index) ?? '').trim()
    if (q.type === 'mcq') {
      const correct = given === q.answer
      return { question_index: index, correct, feedback: correct ? 'پاسخ صحیح بود.' : `پاسخ صحیح: ${q.answer}` }
    }
    const correct = given.length >= 8
    return {
      question_index: index,
      correct,
      feedback: correct ? 'پاسخ قابل‌قبولی ارائه شده است.' : 'لطفاً پاسخ کامل‌تری بنویسید.'
    }
  })
  const finalScore = Math.round((results.filter((r) => r.correct).length / questions.length) * 100)
  return { final_score: finalScore, results }
}
