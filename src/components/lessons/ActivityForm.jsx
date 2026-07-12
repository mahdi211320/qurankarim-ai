import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Lightbulb } from 'lucide-react'

/**
 * فرم فعالیت متنی (فعالیت ۱: درک معنا / فعالیت ۳: تدبر).
 * @param {{
 *   prompt: string,
 *   placeholder?: string,
 *   explanation?: string,
 *   done: boolean,
 *   onSubmit: (answer: string) => void
 * }} props
 */
export default function ActivityForm({ prompt, placeholder, explanation, done, onSubmit }) {
  const [answer, setAnswer] = useState('')
  const [submitted, setSubmitted] = useState(done)

  function handleSubmit() {
    if (!answer.trim()) return
    setSubmitted(true)
    onSubmit(answer.trim())
  }

  if (!prompt) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-sm text-ink-faint">محتوای این فعالیت هنوز بارگذاری نشده است.</p>
      </div>
    )
  }

  return (
    <div className="card-surface p-4 flex flex-col gap-3">
      <p className="text-sm leading-7 text-ink">{prompt}</p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={placeholder}
        disabled={submitted}
        rows={4}
        className="w-full rounded-xl border border-paper-soft bg-paper p-3 text-sm text-ink
                   focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-70 resize-none"
      />

      {!submitted ? (
        <button type="button" onClick={handleSubmit} disabled={!answer.trim()} className="btn-primary self-start">
          ثبت پاسخ
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <CheckCircle2 size={16} /> پاسخ شما ثبت شد
            </p>
            {explanation && (
              <div className="flex gap-2 bg-gold-50 text-ink rounded-xl p-3 text-xs leading-6">
                <Lightbulb size={16} className="text-gold-600 shrink-0 mt-0.5" />
                <span>{explanation}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
