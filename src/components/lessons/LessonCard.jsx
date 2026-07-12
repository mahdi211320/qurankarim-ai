import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, CheckCircle2, PlayCircle, Info, Clock } from 'lucide-react'
import { toPersianDigits } from '../layout/Header.jsx'

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    badge: 'تکمیل‌شده',
    badgeClass: 'bg-emerald-50 text-emerald-700'
  },
  in_progress: {
    icon: PlayCircle,
    iconClass: 'text-gold-500',
    badge: 'در حال انجام',
    badgeClass: 'bg-gold-50 text-gold-600'
  },
  available: {
    icon: PlayCircle,
    iconClass: 'text-emerald-500',
    badge: 'آماده شروع',
    badgeClass: 'bg-emerald-50 text-emerald-700'
  },
  locked: {
    icon: Lock,
    iconClass: 'text-ink-faint',
    badge: 'قفل',
    badgeClass: 'bg-paper-soft text-ink-faint'
  },
  term_locked: {
    icon: Clock,
    iconClass: 'text-ink-faint',
    badge: 'ترم بعد',
    badgeClass: 'bg-paper-soft text-ink-faint'
  }
}

/**
 * کارت هر درس در لیست درس‌های دانش‌آموز.
 * @param {{ lesson: ReturnType<typeof import('../../lib/mockData').computeLessonStatus>[number] }} props
 */
export default function LessonCard({ lesson }) {
  const [showReason, setShowReason] = useState(false)
  const config = STATUS_CONFIG[lesson.status]
  const Icon = config.icon
  const isLocked = lesson.status === 'locked' || lesson.status === 'term_locked'

  const lockReason =
    lesson.status === 'term_locked'
      ? 'این درس در ترم اول ارائه نمی‌شود و در ترم بعد باز خواهد شد.'
      : 'برای باز شدن این درس، باید فعالیت‌های ۱، ۲ و ۳ درس قبل را کامل کنید.'

  const CardInner = (
    <div className="relative card-surface p-4 flex items-center gap-3">
      <div className="motif-border absolute top-0 right-4 left-4 rounded-full" />

      <div
        className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center
                    ${isLocked ? 'bg-paper-soft' : 'bg-emerald-50'}`}
      >
        <Icon size={22} className={config.iconClass} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-faint mb-0.5">
          درس {toPersianDigits(lesson.lesson_number)}
        </p>
        <h3 className={`font-semibold truncate ${isLocked ? 'text-ink-faint' : 'text-ink'}`}>
          {lesson.title}
        </h3>
      </div>

      <span className={`shrink-0 text-[11px] font-medium rounded-full px-2.5 py-1 ${config.badgeClass}`}>
        {config.badge}
      </span>

      {isLocked && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowReason((v) => !v)
          }}
          className="shrink-0 text-ink-faint p-1 -m-1"
          aria-label="دلیل قفل بودن درس"
        >
          <Info size={16} />
        </button>
      )}
    </div>
  )

  return (
    <div>
      {isLocked ? (
        <div className="opacity-90">{CardInner}</div>
      ) : (
        <Link to={`/lessons/${lesson.id}`}>{CardInner}</Link>
      )}

      <AnimatePresence>
        {showReason && isLocked && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="text-xs text-ink-soft bg-paper-soft rounded-lg px-3 py-2 mt-1.5 overflow-hidden"
          >
            {lockReason}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
