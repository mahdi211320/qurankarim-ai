import { useState } from 'react'
import { Users, TrendingUp } from 'lucide-react'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import { mockAdminClasses } from '../../lib/adminMockData.js'

const TEACHERS = ['خانم رضایی', 'آقای موسوی']

export default function ClassManagement() {
  const [classes, setClasses] = useState(mockAdminClasses)

  function reassignTeacher(classId, teacherName) {
    // TODO: در نسخهٔ نهایی، به‌روزرسانی ستون teacher_id در جدول classes
    setClasses((prev) => prev.map((c) => (c.id === classId ? { ...c, teacherName } : c)))
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-bold text-xl text-ink">کلاس‌ها</h1>
        <p className="text-sm text-ink-soft mt-1">مشاهده و مدیریت همهٔ کلاس‌ها در تمام پایه‌ها</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {classes.map((c) => (
          <div key={c.id} className="card-surface p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-ink">{c.class_name}</h3>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-semibold">
                پایه {toPersianDigits(c.grade_level)}
              </span>
            </div>

            <label className="flex flex-col gap-1 text-xs text-ink-faint">
              معلم مسئول
              <select
                value={c.teacherName}
                onChange={(e) => reassignTeacher(c.id, e.target.value)}
                className="rounded-lg border border-paper-soft bg-paper px-2.5 py-2 text-sm text-ink
                           focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {TEACHERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-4 pt-2 border-t border-paper-soft">
              <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                <Users size={15} /> {toPersianDigits(c.studentCount)} دانش‌آموز
              </span>
              <span className="flex items-center gap-1.5 text-sm text-ink-soft">
                <TrendingUp size={15} /> {toPersianDigits(c.avgScore)}٪
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
