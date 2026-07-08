import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle2, Info } from 'lucide-react'
import { toPersianDigits } from '../layout/Header.jsx'

const STATUS_BADGE = {
  completed: { text: 'تکمیل شده ✅', className: 'bg-emerald-50 text-emerald-700' },
  in_progress: { text: 'در حال انجام ⏳', className: 'bg-gold-50 text-gold-600' },
  available: { text: 'آماده شروع', className: 'bg-emerald-50 text-emerald-700' },
  locked: { text: 'قفل 🔒', className: 'bg-paper-soft text-ink-faint' },
  term_locked: { text: 'ترم بعد', className: 'bg-paper-soft text-ink-faint' },
  not_enrolled: { text: 'قفل 🔒', className: 'bg-paper-soft text-ink-faint' }
}

/**
 * کارت شبکه‌ای درس برای گرید داشبورد (۲ ستون موبایل / ۳ ستون تبلت).
 * @param {{ lesson: object }} props
 */
export default function LessonGridCard({ lesson }) {
  const [showTip, setShowTip] = useState(false)
  const badge = STATUS_BADGE[lesson.status]
  const isLocked = lesson.status !== 'completed' && lesson.status !== 'in_progress' && lesson.status !== 'available'

  const doneCount = ['act1_done', 'act2_done', 'act3_done'].filter((k) => lesson.progress?.[k]).length

  const tooltip =
    lesson.status === 'not_enrolled'
      ? 'این پایه، پایهٔ فعلی شما نیست.'
      : lesson.status === 'term_locked'
        ? 'این درس در ترم اول ارائه نمی‌شود.'
        : 'ابتدا درس قبلی را کامل کنید.'

  const CardBody = (
    <div className="relative card-surface p-3.5 h-full flex flex-col gap-2 overflow-hidden">
      <div className="motif-border absolute top-0 right-3 left-3 rounded-full" />

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink-faint">درس {toPersianDigits(lesson.lesson_number)}</span>
        {lesson.status === 'completed' && <CheckCircle2 size={16} className="text-emerald-500" />}
      </div>

      <h3 className={`text-sm font-bold leading-6 line-clamp-2 ${isLocked ? 'text-ink-faint' : 'text-ink'}`}>
        {lesson.title}
      </h3>

      <div className="mt-auto flex flex-col gap-1.5 pt-1">
        {doneCount > 0 && !isLocked && (
          <p className="text-[11px] text-emerald-600">
            {doneCount === 3 ? 'همهٔ فعالیت‌ها انجام شد ✓' : `فعالیت ${toPersianDigits(doneCount)} انجام شد ✓`}
          </p>
        )}
        <span className={`self-start text-[10px] font-semibold rounded-full px-2 py-1 ${badge.className}`}>
          {badge.text}
        </span>
      </div>

      {isLocked && (
        <div className="absolute inset-0 bg-paper-card/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1">
          <Lock size={20} className="text-ink-faint" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowTip((v) => !v)
            }}
            className="text-ink-faint p-1"
            aria-label="دلیل قفل بودن"
          >
            <Info size={14} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative">
      {isLocked ? (
        <div className="aspect-[4/3]">{CardBody}</div>
      ) : (
        <Link to={`/lessons/${lesson.id}`} className="block aspect-[4/3]">
          {CardBody}
        </Link>
      )}

      <AnimatePresence>
        {showTip && isLocked && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute z-20 -bottom-2 translate-y-full inset-x-0 text-[11px] text-white bg-ink rounded-lg px-2.5 py-1.5 text-center shadow-card"
          >
            {tooltip}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
