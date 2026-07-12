import { BookMarked } from 'lucide-react'

/**
 * سربرگ بالای صفحه - نمایش خوش‌آمدگویی، نام دانش‌آموز و نشان پایه تحصیلی.
 * @param {{ studentName: string, gradeLevel: number, className: string }} props
 */
export default function Header({ studentName, gradeLevel, className }) {
  const greeting = getGreeting()

  return (
    <header className="px-5 pt-6 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ink-soft text-sm">{greeting}،</p>
          <h1 className="text-xl font-bold text-ink mt-0.5">{studentName}</h1>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-xs font-semibold">
          <BookMarked size={14} />
          <span>پایه {toPersianDigits(gradeLevel)} · {className}</span>
        </div>
      </div>
      <div className="motif-border mt-4 rounded-full" />
    </header>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'صبح بخیر'
  if (hour < 17) return 'ظهر بخیر'
  if (hour < 20) return 'عصر بخیر'
  return 'شب بخیر'
}

const persianDigitMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
export function toPersianDigits(input) {
  return String(input).replace(/[0-9]/g, (d) => persianDigitMap[Number(d)])
}
