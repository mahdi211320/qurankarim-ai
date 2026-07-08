import { Link } from 'react-router-dom'
import { BookOpenCheck } from 'lucide-react'

/**
 * ویجت «انس روزانه» - پیشنهاد تلاوت روزانه از یک درس مشخص.
 * @param {{ lessonId: string, text: string }} props
 */
export default function DailyReadingCard({ lessonId, text }) {
  return (
    <div className="bg-emerald-700 text-white rounded-xl2 p-4 flex items-center gap-3 relative overflow-hidden">
      <div className="motif-border absolute bottom-0 right-0 left-0" />
      <div className="w-11 h-11 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
        <BookOpenCheck size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-emerald-50/80 mb-0.5">خواندن روزانه</p>
        <p className="text-sm leading-6 line-clamp-2">{text}</p>
      </div>
      <Link
        to={lessonId ? `/lessons/${lessonId}` : '/lessons'}
        className="shrink-0 bg-white text-emerald-700 text-xs font-bold rounded-lg px-3 py-2"
      >
        خواندن روزانه
      </Link>
    </div>
  )
}
