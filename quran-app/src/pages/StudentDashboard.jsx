import { useMemo, useState } from 'react'
import { Quote } from 'lucide-react'
import { toPersianDigits } from '../components/layout/Header.jsx'
import GradeTabs from '../components/lessons/GradeTabs.jsx'
import LessonGridCard from '../components/lessons/LessonGridCard.jsx'
import DailyReadingCard from '../components/lessons/DailyReadingCard.jsx'
import AnimatedCounter from '../components/lessons/AnimatedCounter.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  mockStudent,
  mockLessons,
  mockProgress,
  mockStats,
  getTermLimit,
  getLessonsByGrade,
  computeLessonStatus,
  getDailyQuote
} from '../lib/mockData.js'

// در نسخهٔ نهایی این داده‌ها از Supabase (lessons / student_progress) واکشی می‌شوند.
export default function StudentDashboard() {
  const student = mockStudent
  const { profile } = useAuth()
  const displayFirstName = (profile?.full_name || student.full_name).split(' ')[0]
  const [selectedGrade, setSelectedGrade] = useState(student.grade_level)
  const quote = useMemo(() => getDailyQuote(), [])

  // آمار پایهٔ فعلی دانش‌آموز (صرف‌نظر از پایه‌ای که در حال مشاهدهٔ آن است)
  const ownLessons = useMemo(
    () => computeLessonStatus(getLessonsByGrade(mockLessons, student.grade_level), mockProgress, student.grade_level),
    [student.grade_level]
  )
  const ownTermLimit = getTermLimit(student.grade_level)
  const ownCompletedCount = ownLessons.filter((l) => l.status === 'completed').length

  // درس‌های پایهٔ انتخاب‌شده در تب‌ها (ممکن است با پایهٔ خود دانش‌آموز فرق کند)
  const isEnrolledInSelected = selectedGrade === student.grade_level
  const selectedLessons = useMemo(() => {
    const lessons = computeLessonStatus(
      getLessonsByGrade(mockLessons, selectedGrade),
      isEnrolledInSelected ? mockProgress : {},
      selectedGrade
    )
    return isEnrolledInSelected ? lessons : lessons.map((l) => ({ ...l, status: 'not_enrolled' }))
  }, [selectedGrade, isEnrolledInSelected])

  const continueLesson = ownLessons.find((l) => l.status === 'available' || l.status === 'in_progress')
  const dailyLesson = continueLesson || ownLessons[0]

  return (
    <div className="pb-4">
      {/* بخش خوش‌آمدگویی */}
      <section className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink">سلام {displayFirstName} عزیز 👋</h1>
            <p className="text-xs text-ink-soft mt-1">
              پایه {toPersianDigits(student.grade_level)} · {student.class_name}
            </p>
          </div>
          <div className="text-left shrink-0">
            <p className="text-xl font-extrabold text-emerald-600 leading-none">
              {toPersianDigits(ownCompletedCount)}
              <span className="text-ink-faint text-sm">/{toPersianDigits(ownTermLimit)}</span>
            </p>
            <p className="text-[11px] text-ink-faint mt-1">درس تکمیل‌شده</p>
          </div>
        </div>

        {/* نقل‌قول انگیزشی روزانه */}
        <div className="mt-4 bg-gold-50 rounded-xl2 p-4 flex gap-2.5">
          <Quote size={18} className="text-gold-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-ink leading-6">{quote.text}</p>
            <p className="text-[11px] text-gold-600 font-medium mt-1">{quote.source}</p>
          </div>
        </div>
      </section>

      {/* انس روزانه */}
      {dailyLesson && (
        <section className="px-5 mb-5">
          <DailyReadingCard
            lessonId={dailyLesson.id}
            text={dailyLesson.dailyReading || `تلاوت درس «${dailyLesson.title}» را امروز مرور کنید.`}
          />
        </section>
      )}

      {/* تب‌های انتخاب پایه */}
      <section className="px-5 mb-4">
        <GradeTabs active={selectedGrade} onChange={setSelectedGrade} />
      </section>

      {/* گرید درس‌ها */}
      <section className="px-5">
        {!isEnrolledInSelected && (
          <p className="text-[11px] text-ink-faint mb-3">
            شما در پایهٔ {toPersianDigits(selectedGrade)} ثبت‌نام نکرده‌اید؛ این دروس فقط برای پیش‌نمایش است.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {selectedLessons.map((lesson) => (
            <LessonGridCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      {/* آمار */}
      <section className="px-5 mt-6">
        <h2 className="font-bold text-ink mb-3">آمار من</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="میانگین تلاوت" value={mockStats.avgRecitationScore} suffix="٪" />
          <StatBox label="میانگین آزمون" value={mockStats.avgQuizScore} suffix="٪" />
          <StatBox label="این هفته" value={mockStats.completedThisWeek} suffix=" درس" />
        </div>
      </section>
    </div>
  )
}

function StatBox({ label, value, suffix }) {
  return (
    <div className="card-surface p-3.5 text-center">
      <p className="text-lg font-extrabold text-emerald-600">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="text-[10px] text-ink-faint mt-1">{label}</p>
    </div>
  )
}
