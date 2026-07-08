import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, XCircle } from 'lucide-react'
import CircularProgress from '../components/lessons/CircularProgress.jsx'
import { toPersianDigits } from '../components/layout/Header.jsx'
import { mockLessons, mockStudent, getLessonById } from '../lib/mockData.js'
import { generateQuiz, gradeQuiz } from '../lib/api.js'
import { generateMockQuiz, stripAnswers, gradeMockQuiz } from '../lib/mockQuiz.js'

export default function QuizPage() {
  const { lessonId } = useParams()
  const lesson = getLessonById(mockLessons, lessonId)

  const [phase, setPhase] = useState('loading') // loading | taking | submitting | result | error
  const [questions, setQuestions] = useState([])
  const [quizId, setQuizId] = useState(null)
  const [isMock, setIsMock] = useState(false)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const mockQuestionsRef = useRef([])

  useEffect(() => {
    if (!lesson) return
    let cancelled = false

    async function load() {
      setPhase('loading')
      const { data, error } = await generateQuiz(lesson.id, mockStudent.id)

      if (!cancelled) {
        if (error || !data) {
          // Edge Function واقعی هنوز دیپلوی/پیکربندی نشده؛ از تولیدکنندهٔ محلی استفاده می‌شود
          const mock = generateMockQuiz(lesson)
          mockQuestionsRef.current = mock.questions
          setQuestions(stripAnswers(mock.questions))
          setQuizId(mock.quiz_id)
          setIsMock(true)
        } else {
          setQuestions(data.questions)
          setQuizId(data.quiz_id)
          setIsMock(false)
        }
        setPhase('taking')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [lesson])

  if (!lesson) {
    return (
      <div className="px-5 pt-6 text-center">
        <p className="text-ink-soft">درسی با این شناسه پیدا نشد.</p>
      </div>
    )
  }

  function setAnswer(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }))
  }

  async function handleSubmit() {
    setPhase('submitting')
    const studentAnswers = Object.entries(answers).map(([index, answer]) => ({
      question_index: Number(index),
      answer
    }))

    if (isMock) {
      await new Promise((r) => setTimeout(r, 1200))
      const graded = gradeMockQuiz(mockQuestionsRef.current, studentAnswers)
      setResult(graded)
      setPhase('result')
      return
    }

    const { data, error } = await gradeQuiz(quizId, studentAnswers)
    if (error || !data) {
      setPhase('error')
      return
    }
    setResult(data)
    setPhase('result')
  }

  const allAnswered = questions.length > 0 && questions.every((_, i) => (answers[i] ?? '').toString().trim())

  return (
    <div className="px-5 pt-6 pb-10">
      <Link to={`/lessons/${lessonId}`} className="inline-flex items-center gap-1 text-ink-soft text-sm mb-4">
        <ArrowRight size={18} /> بازگشت به درس
      </Link>

      <h1 className="font-bold text-lg text-ink mb-1">آزمون درس</h1>
      <p className="text-sm text-ink-soft mb-5">{lesson.title}</p>

      {phase === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-10">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}>
            <Sparkles size={28} className="text-gold-500" />
          </motion.div>
          <p className="text-sm text-ink-soft">در حال تولید آزمون توسط هوش مصنوعی...</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="card-surface p-6 text-center">
          <p className="text-sm text-red-600">تصحیح آزمون با خطا مواجه شد. لطفاً دوباره تلاش کنید.</p>
          <button onClick={handleSubmit} className="btn-secondary mt-3">
            تلاش دوباره
          </button>
        </div>
      )}

      {(phase === 'taking' || phase === 'submitting') && (
        <div className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={i} className="card-surface p-4">
              <p className="text-sm font-semibold text-ink mb-3">
                {toPersianDigits(i + 1)}. {q.question}
              </p>

              {q.type === 'mcq' ? (
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm cursor-pointer
                                  ${answers[i] === opt ? 'border-emerald-500 bg-emerald-50' : 'border-paper-soft'}`}
                    >
                      <input
                        type="radio"
                        name={`q_${i}`}
                        checked={answers[i] === opt}
                        onChange={() => setAnswer(i, opt)}
                        className="accent-emerald-500"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[i] || ''}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  rows={3}
                  placeholder="پاسخ خود را بنویسید..."
                  className="w-full rounded-xl border border-paper-soft bg-paper p-3 text-sm resize-none
                             focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || phase === 'submitting'}
            className="btn-primary mt-2"
          >
            {phase === 'submitting' ? 'در حال تصحیح...' : 'ثبت نهایی آزمون'}
          </button>
        </div>
      )}

      {phase === 'result' && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
          <div className="card-surface p-6 flex flex-col items-center gap-2">
            <CircularProgress value={result.final_score} label="نمرهٔ آزمون" />
            <p className="text-sm text-ink-soft">
              {result.final_score >= 70 ? 'آفرین! درس را با موفقیت گذراندید. 🎉' : 'برای تکمیل درس نیاز به تلاش بیشتری دارید.'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {result.results.map((r) => (
              <div key={r.question_index} className="card-surface p-3 flex items-start gap-2">
                {r.correct ? (
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                )}
                <p className="text-xs text-ink-soft leading-6">{r.feedback}</p>
              </div>
            ))}
          </div>

          <Link to={`/lessons/${lessonId}`} className="btn-secondary text-center">
            بازگشت به درس
          </Link>
        </motion.div>
      )}
    </div>
  )
}
