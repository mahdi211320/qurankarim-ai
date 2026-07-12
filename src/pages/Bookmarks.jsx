import { Link } from 'react-router-dom'
import { Bookmark, ArrowLeft } from 'lucide-react'
import { toPersianDigits } from '../components/layout/Header.jsx'
import { mockLessons, mockBookmarks } from '../lib/mockData.js'

export default function Bookmarks() {
  const bookmarkedLessons = mockLessons.filter((l) => mockBookmarks.has(l.id))

  return (
    <div className="px-5 pt-6">
      <h1 className="font-bold text-lg text-ink mb-4">نشان‌ها</h1>

      {bookmarkedLessons.length === 0 ? (
        <div className="card-surface p-8 flex flex-col items-center gap-2 text-center">
          <Bookmark size={28} className="text-ink-faint" />
          <p className="text-sm text-ink-soft">هنوز درسی را نشان نکرده‌اید.</p>
          <Link to="/lessons" className="text-emerald-600 text-sm font-semibold mt-1">
            مشاهدهٔ درس‌ها
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookmarkedLessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/lessons/${lesson.id}`}
              className="card-surface p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-[11px] text-ink-faint mb-0.5">
                  پایه {toPersianDigits(lesson.grade_level)} · درس {toPersianDigits(lesson.lesson_number)}
                </p>
                <h3 className="font-semibold text-ink">{lesson.title}</h3>
              </div>
              <ArrowLeft size={18} className="text-ink-faint shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
