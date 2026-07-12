import { Link } from 'react-router-dom'
import { Users, TrendingUp } from 'lucide-react'
import { toPersianDigits } from '../layout/Header.jsx'
import { getClassStats } from '../../lib/teacherMockData.js'

export default function ClassCard({ classItem }) {
  const { studentCount, avgScore } = getClassStats(classItem.id)

  return (
    <Link to={`/teacher/students?class=${classItem.id}`} className="card-surface p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-ink">{classItem.class_name}</h3>
        <span className="text-[11px] bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-semibold">
          پایه {toPersianDigits(classItem.grade_level)}
        </span>
      </div>
      <p className="text-xs text-ink-faint">سال تحصیلی {classItem.academic_year}</p>
      <div className="flex items-center gap-4 pt-2 border-t border-paper-soft">
        <span className="flex items-center gap-1.5 text-sm text-ink-soft">
          <Users size={15} /> {toPersianDigits(studentCount)} دانش‌آموز
        </span>
        <span className="flex items-center gap-1.5 text-sm text-ink-soft">
          <TrendingUp size={15} /> میانگین {toPersianDigits(avgScore)}٪
        </span>
      </div>
    </Link>
  )
}
