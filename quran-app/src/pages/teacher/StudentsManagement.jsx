import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus, Upload, ChevronLeft } from 'lucide-react'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockClasses, mockStudentsList } from '../../lib/teacherMockData.js'

export default function StudentsManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const classFilter = searchParams.get('class') || 'all'
  const [showImportInfo, setShowImportInfo] = useState(false)

  const filteredStudents = useMemo(
    () =>
      classFilter === 'all'
        ? mockStudentsList
        : mockStudentsList.filter((s) => s.class_id === classFilter),
    [classFilter]
  )

  function classNameOf(classId) {
    return mockClasses.find((c) => c.id === classId)?.class_name || '—'
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-xl text-ink">دانش‌آموزان</h1>
          <p className="text-sm text-ink-soft mt-1">مدیریت و مشاهدهٔ پیشرفت دانش‌آموزان</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImportInfo((v) => !v)} className="btn-secondary flex items-center gap-1.5 !py-2.5">
            <Upload size={16} /> ورود گروهی CSV
          </button>
          <button className="btn-primary flex items-center gap-1.5 !py-2.5">
            <Plus size={16} /> افزودن دانش‌آموز
          </button>
        </div>
      </div>

      {showImportInfo && (
        <div className="card-surface p-4 text-sm text-ink-soft leading-6">
          فایل CSV باید ستون‌های <code className="text-emerald-700">full_name</code>،{' '}
          <code className="text-emerald-700">student_code</code> و{' '}
          <code className="text-emerald-700">parent_phone</code> را داشته باشد. پس از انتخاب فایل،
          دانش‌آموزان به‌صورت گروهی به کلاس انتخاب‌شده اضافه می‌شوند.
          <br />
          <span className="text-xs text-ink-faint">
            (این بخش در پرامپت مربوط به Edge Function و اتصال کامل به Supabase Storage تکمیل می‌شود.)
          </span>
        </div>
      )}

      {/* فیلتر کلاس */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterPill active={classFilter === 'all'} onClick={() => setSearchParams({})}>
          همهٔ کلاس‌ها
        </FilterPill>
        {mockClasses.map((c) => (
          <FilterPill key={c.id} active={classFilter === c.id} onClick={() => setSearchParams({ class: c.id })}>
            {c.class_name}
          </FilterPill>
        ))}
      </div>

      {/* جدول دانش‌آموزان */}
      <div className="card-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-xs text-ink-faint border-b border-paper-soft">
              <th className="px-4 py-3 font-medium">نام</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">کلاس</th>
              <th className="px-4 py-3 font-medium">کد دانش‌آموزی</th>
              <th className="px-4 py-3 font-medium">پیشرفت</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">آخرین فعالیت</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} className="border-b border-paper-soft last:border-0 hover:bg-paper-soft/50">
                <td className="px-4 py-3 font-medium text-ink">{student.full_name}</td>
                <td className="px-4 py-3 text-ink-soft hidden sm:table-cell">{classNameOf(student.class_id)}</td>
                <td className="px-4 py-3 text-ink-soft tabular-nums">{toPersianDigits(student.student_code)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 w-28">
                    <div className="h-1.5 flex-1 bg-paper-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${student.progress_percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-faint tabular-nums">
                      {toPersianDigits(student.progress_percent)}٪
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-faint hidden md:table-cell">{student.last_activity}</td>
                <td className="px-4 py-3">
                  <Link
                    to={`/teacher/students/${student.id}`}
                    className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"
                  >
                    مشاهده <ChevronLeft size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs font-semibold rounded-full px-3.5 py-2 transition-colors
                  ${active ? 'bg-emerald-500 text-white' : 'bg-paper-soft text-ink-soft'}`}
    >
      {children}
    </button>
  )
}
