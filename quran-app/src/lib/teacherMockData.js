import { mockLessons, computeLessonStatus, getTermLimit } from './mockData.js'

// داده‌های نمونه برای پنل معلم - هم‌ساختار با جداول Supabase (classes / students / ...)
// در نسخهٔ نهایی همه از Supabase با فیلتر teacher_id واکشی می‌شوند.

export const mockTeacher = {
  id: 'tch_001',
  full_name: 'خانم رضایی',
  bio: 'دبیر قرآن دورهٔ اول متوسطه',
  specialization: 'تجوید و روخوانی'
}

export const mockClasses = [
  { id: '701', class_name: 'هفتم ۱', grade_level: 7, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q7T1XA' },
  { id: '702', class_name: 'هفتم ۲', grade_level: 7, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q7T2XB' },
  { id: '703', class_name: 'هفتم ۳', grade_level: 7, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q7T3XC' },
  { id: '704', class_name: 'هفتم ۴', grade_level: 7, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q7T4XD' },
  { id: '801', class_name: 'هشتم ۱', grade_level: 8, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q8T1YA' },
  { id: '802', class_name: 'هشتم ۲', grade_level: 8, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q8T2YB' },
  { id: '803', class_name: 'هشتم ۳', grade_level: 8, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q8T3YC' },
  { id: '804', class_name: 'هشتم ۴', grade_level: 8, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q8T4YD' },
  { id: '901', class_name: 'نهم ۱', grade_level: 9, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q9T1ZA' },
  { id: '902', class_name: 'نهم ۲', grade_level: 9, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q9T2ZB' },
  { id: '903', class_name: 'نهم ۳', grade_level: 9, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q9T3ZC' },
  { id: '904', class_name: 'نهم ۴', grade_level: 9, academic_year: '۱۴۰۴-۱۴۰۵', access_code: 'Q9T4ZD' }
]

export const mockStudentsList = [
  { id: 'st1', full_name: 'محمدرضا احمدی', student_code: '70234', class_id: '701', progress_percent: 100, last_activity: '۲ ساعت پیش', recitation_avg: 88, quiz_avg: 90 },
  { id: 'st2', full_name: 'علی حسینی', student_code: '70235', class_id: '701', progress_percent: 67, last_activity: 'دیروز', recitation_avg: 74, quiz_avg: 80 },
  { id: 'st3', full_name: 'امیرحسین کریمی', student_code: '70236', class_id: '702', progress_percent: 33, last_activity: '۳ روز پیش', recitation_avg: 65, quiz_avg: 70 },
  { id: 'st4', full_name: 'سارا محمدی', student_code: '80112', class_id: '801', progress_percent: 83, last_activity: '۱ ساعت پیش', recitation_avg: 91, quiz_avg: 85 },
  { id: 'st5', full_name: 'فاطمه رضایی', student_code: '80113', class_id: '801', progress_percent: 50, last_activity: 'دیروز', recitation_avg: 78, quiz_avg: 72 },
  { id: 'st6', full_name: 'زهرا نوری', student_code: '80114', class_id: '802', progress_percent: 17, last_activity: '۵ روز پیش', recitation_avg: 60, quiz_avg: 55 },
  { id: 'st7', full_name: 'یاسمن قاسمی', student_code: '90045', class_id: '901', progress_percent: 100, last_activity: 'امروز', recitation_avg: 95, quiz_avg: 93 },
  { id: 'st8', full_name: 'نگار صادقی', student_code: '90046', class_id: '901', progress_percent: 60, last_activity: '۲ روز پیش', recitation_avg: 82, quiz_avg: 79 }
]

export const mockRecentActivity = [
  { id: 'a1', studentName: 'یاسمن قاسمی', action: 'آزمون درس را با نمرهٔ ۹۳ گذراند', time: '۱۰ دقیقه پیش' },
  { id: 'a2', studentName: 'محمدرضا احمدی', action: 'تلاوت درس ۲ را ثبت کرد', time: '۲ ساعت پیش' },
  { id: 'a3', studentName: 'سارا محمدی', action: 'فعالیت ۱ درس ۳ را تکمیل کرد', time: '۳ ساعت پیش' },
  { id: 'a4', studentName: 'علی حسینی', action: 'درس ۲ را شروع کرد', time: 'دیروز' },
  { id: 'a5', studentName: 'زهرا نوری', action: 'به کلاس «هشتم ۲» پیوست', time: '۲ روز پیش' }
]

export function getClassById(classId) {
  return mockClasses.find((c) => c.id === classId) || null
}

export function getStudentsByClass(classId) {
  return mockStudentsList.filter((s) => s.class_id === classId)
}

export function getClassStats(classId) {
  const students = getStudentsByClass(classId)
  const studentCount = students.length
  const avgScore = studentCount
    ? Math.round(students.reduce((sum, s) => sum + (s.quiz_avg + s.recitation_avg) / 2, 0) / studentCount)
    : 0
  return { studentCount, avgScore }
}

export function getOverviewStats() {
  const totalStudents = mockStudentsList.length
  const totalClasses = mockClasses.length
  const avgPerformance = Math.round(
    mockStudentsList.reduce((sum, s) => sum + (s.quiz_avg + s.recitation_avg) / 2, 0) / totalStudents
  )
  return { totalStudents, totalClasses, avgPerformance }
}

export function getStudentById(studentId) {
  return mockStudentsList.find((s) => s.id === studentId) || null
}

// تاریخچهٔ نمرات دانش‌آموز برای نمودار خطی (شبیه‌سازی‌شده به‌صورت قطعی بر اساس id)
export function getStudentProgressHistory(studentId) {
  const seed = studentId.charCodeAt(2) || 5
  const labels = ['درس ۱', 'درس ۲', 'درس ۳', 'درس ۴', 'درس ۵', 'درس ۶']
  return labels.map((label, i) => ({
    lesson: label,
    quiz: Math.min(100, 55 + ((seed * (i + 2)) % 40) + i * 3),
    recitation: Math.min(100, 60 + ((seed * (i + 3)) % 35) + i * 2)
  }))
}

export function getStudentLessonStatus(student) {
  const progressMap = {}
  const gradeLevel = getGradeFromClass(student.class_id)
  const termLimit = getTermLimit(gradeLevel)
  const doneCount = Math.round((student.progress_percent / 100) * termLimit)
  const lessonsForGrade = mockLessons.filter((l) => l.grade_level === gradeLevel)
  lessonsForGrade
    .sort((a, b) => a.lesson_number - b.lesson_number)
    .forEach((lesson, i) => {
      progressMap[lesson.id] = {
        act1_done: i < doneCount,
        act2_done: i < doneCount,
        act3_done: i < doneCount,
        is_completed: i < doneCount,
        quiz_score: i < doneCount ? student.quiz_avg : null,
        recitation_score: i < doneCount ? student.recitation_avg : null
      }
    })
  return computeLessonStatus(lessonsForGrade, progressMap, gradeLevel)
}

function getGradeFromClass(classId) {
  return getClassById(classId)?.grade_level || 7
}

export function getStudentAudioRecordings(studentId) {
  const student = getStudentById(studentId)
  if (!student) return []
  const termLimit = getTermLimit(getGradeFromClass(student.class_id))
  const doneCount = Math.round((student.progress_percent / 100) * termLimit)
  return Array.from({ length: doneCount }, (_, i) => ({
    id: `${studentId}_audio_${i + 1}`,
    lessonTitle: `درس ${i + 1}`,
    date: `${i + 1} روز پیش`,
    score: Math.min(100, student.recitation_avg + (i % 2 === 0 ? 3 : -2))
  }))
}
