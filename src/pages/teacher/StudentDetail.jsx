import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Play, Lock, CheckCircle2, Clock } from 'lucide-react'
import { toPersianDigits } from '../../components/layout/Header.jsx'
import ProgressLineChart from '../../components/teacher/ProgressLineChart.jsx'
import {
  getStudentById,
  getClassById,
  getStudentProgressHistory,
  getStudentLessonStatus,
  getStudentAudioRecordings
} from '../../lib/teacherMockData.js'

const STATUS_LABEL = {
  completed: { text: 'تکمیل‌شده', icon: CheckCircle2, className: 'text-emerald-600' },
  in_progress: { text: 'در حال انجام', icon: Clock, className: 'text-gold-600' },
  available: { text: 'آماده شروع', icon: Clock, className: 'text-emerald-600' },
  locked: { text: 'قفل', icon: Lock, className: 'text-ink-faint' },
  term_locked: { text: 'ترم بعد', icon: Lock, className: 'text-ink-faint' }
}

export default function StudentDetail() {
  const { studentId } = useParams()
  const student = getStudentById(studentId)
  const [unlockedIds, setUnlockedIds] = useState(() => new Set())

  const progressHistory = useMemo(() => (student ? getStudentProgressHistory(student.id) : []), [student])
  const lessons = useMemo(() => (student ? getStudentLessonStatus(student) : []), [student])
  const audioRecordings = useMemo(() => (student ? getStudentAudioRecordings(student.id) : []), [student])

  if (!student) {
    return (
      <div className="text-center py-10">
        <p className="text-ink-soft">دانش‌آموزی با این شناسه پیدا نشد.</p>
        <Link to="/teacher/students" className="text-emerald-600 font-semibold text-sm mt-2 inline-block">
          بازگشت به لیست دانش‌آموزان
        </Link>
      </div>
    )
  }

  const classInfo = getClassById(student.class_id)

  function forceUnlock(lessonId) {
    // TODO: در نسخهٔ نهایی این عملیات باید در جدول student_progress یک ردیف
    // با act1_done/act2_done/act3_done=false ولی بدون قفل توالی بسازد (باز کردن دستی توسط معلم)
    setUnlockedIds((prev) => new Set(prev).add(lessonId))
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/teacher/students" className="flex items-center gap-1.5 text-sm text-ink-soft w-fit">
        <ArrowRight size={16} /> بازگشت
      </Link>

      {/* پروفایل */}
      <div className="card-surface p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
          {student.full_name.slice(0, 1)}
        </div>
        <div>
          <h1 className="font-bold text-lg text-ink">{student.full_name}</h1>
          <p className="text-xs text-ink-faint mt-0.5">
            کد {toPersianDigits(student.student_code)} · {classInfo?.class_name}
          </p>
        </div>
        <div className="mr-auto text-left">
          <p className="text-xl font-extrabold text-emerald-600">{toPersianDigits(student.progress_percent)}٪</p>
          <p className="text-[11px] text-ink-faint">پیشرفت کلی</p>
        </div>
      </div>

      {/* نمودار پیشرفت */}
      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-2">روند نمرات</h2>
        <ProgressLineChart data={progressHistory} />
      </div>

      {/* لیست درس‌ها */}
      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-3">وضعیت درس‌ها</h2>
        <ul className="flex flex-col divide-y divide-paper-soft">
          {lessons.map((lesson) => {
            const isUnlockedByTeacher = unlockedIds.has(lesson.id)
            const status = isUnlockedByTeacher && lesson.status === 'locked' ? 'available' : lesson.status
            const cfg = STATUS_LABEL[status]
            const Icon = cfg.icon
            return (
              <li key={lesson.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={cfg.className} />
                  <span className="text-sm text-ink">
                    درس {toPersianDigits(lesson.lesson_number)}: {lesson.title}
                  </span>
                </div>
                {status === 'locked' ? (
                  <button
                    onClick={() => forceUnlock(lesson.id)}
                    className="text-xs font-semibold text-emerald-600 shrink-0"
                  >
                    باز کردن درس
                  </button>
                ) : (
                  <span className={`text-xs font-medium shrink-0 ${cfg.className}`}>{cfg.text}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      {/* ضبط‌های صوتی */}
      <div className="card-surface p-4">
        <h2 className="font-bold text-ink mb-3">ضبط‌های تلاوت</h2>
        {audioRecordings.length === 0 ? (
          <p className="text-sm text-ink-faint">هنوز تلاوتی ثبت نشده است.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-paper-soft">
            {audioRecordings.map((rec) => (
              <li key={rec.id} className="py-3 flex items-center gap-3">
                <button
                  className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
                  aria-label="پخش تلاوت"
                >
                  <Play size={15} />
                </button>
                <div className="flex-1">
                  <p className="text-sm text-ink">{rec.lessonTitle}</p>
                  <p className="text-[11px] text-ink-faint">{rec.date}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                  {toPersianDigits(rec.score)}٪
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
