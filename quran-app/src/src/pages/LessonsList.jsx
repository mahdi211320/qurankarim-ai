import { useEffect, useMemo, useState } from 'react'
import LessonCard from '../components/lessons/LessonCard.jsx'
import { LessonCardSkeleton } from '../components/shared/Skeleton.jsx'
import { mockStudent, mockLessons, mockProgress, computeLessonStatus, getLessonsByGrade } from '../lib/mockData.js'

export default function LessonsList() {
  const student = mockStudent
  const [loading, setLoading] = useState(true)

  // شبیه‌سازی کوتاه واکشی از سرور تا حالت اسکلت لودینگ نمایش داده شود
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const lessonsWithStatus = useMemo(
    () => computeLessonStatus(getLessonsByGrade(mockLessons, student.grade_level), mockProgress, student.grade_level),
    [student.grade_level]
  )

  return (
    <div className="px-5 pt-6">
      <h1 className="font-bold text-lg text-ink mb-4">درس‌های من</h1>
      <div className="flex flex-col gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <LessonCardSkeleton key={i} />)
          : lessonsWithStatus.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
      </div>
    </div>
  )
}
