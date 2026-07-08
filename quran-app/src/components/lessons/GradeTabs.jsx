import { motion } from 'framer-motion'
import { toPersianDigits } from '../layout/Header.jsx'

const GRADES = [7, 8, 9]
const GRADE_LABELS = { 7: 'پایه هفتم', 8: 'پایه هشتم', 9: 'پایه نهم' }

/**
 * تب‌های انتخاب پایه تحصیلی با نشانگر متحرک زمردی.
 * @param {{ active: number, onChange: (grade: number) => void }} props
 */
export default function GradeTabs({ active, onChange }) {
  return (
    <div className="flex bg-paper-soft rounded-full p-1 relative" role="tablist">
      {GRADES.map((grade) => {
        const isActive = grade === active
        return (
          <button
            key={grade}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(grade)}
            className="relative flex-1 py-2 text-xs font-semibold z-10"
          >
            {isActive && (
              <motion.span
                layoutId="grade-pill"
                className="absolute inset-0 bg-emerald-500 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={isActive ? 'text-white' : 'text-ink-soft'}>
              {GRADE_LABELS[grade]}
            </span>
          </button>
        )
      })}
      <span className="sr-only">{toPersianDigits(active)}</span>
    </div>
  )
}
