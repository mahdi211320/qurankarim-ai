import { mockClasses as teacherClasses, getClassStats } from './teacherMockData.js'

// داده‌های نمونه برای پنل ادمین - در نسخهٔ نهایی از Supabase (با نقش admin) واکشی می‌شوند.

export const mockAdmin = {
  id: 'adm_001',
  full_name: 'محمد مهدی خراسانی',
  role: 'admin'
}

export const mockUsers = [
  { id: 'u1', full_name: 'محمدرضا احمدی', role: 'student', code: '70234', email: '—' },
  { id: 'u2', full_name: 'علی حسینی', role: 'student', code: '70235', email: '—' },
  { id: 'u3', full_name: 'سارا محمدی', role: 'student', code: '80112', email: '—' },
  { id: 'u4', full_name: 'یاسمن قاسمی', role: 'student', code: '90045', email: '—' },
  { id: 'u5', full_name: 'خانم رضایی', role: 'teacher', code: '—', email: 'rezaei@example.com' },
  { id: 'u6', full_name: 'آقای موسوی', role: 'teacher', code: '—', email: 'mousavi@example.com' },
  { id: 'u7', full_name: 'محمد مهدی خراسانی', role: 'admin', code: '—', email: 'admin@example.com' }
]

// وضعیت فضای ذخیره‌سازی Supabase Storage (سقف رایگان: ۵۰۰ مگابایت)
export const mockStorage = {
  usedMB: 372,
  limitMB: 500,
  breakdown: [
    { label: 'فایل‌های تلاوت (audio_recordings)', mb: 340 },
    { label: 'تصاویر پروفایل', mb: 22 },
    { label: 'سایر', mb: 10 }
  ]
}

export const mockCleanupHistory = [
  { id: 'cl1', date: '۱۴۰۴/۰۳/۱۲', filesRemoved: 48, mbFreed: 96 },
  { id: 'cl2', date: '۱۴۰۴/۰۲/۰۵', filesRemoved: 63, mbFreed: 121 }
]

// پیش‌نمایش پاک‌سازی هوشمند: حذف فایل‌های صوتی قدیمی‌تر از ۳۰ روز
// (فقط آخرین تلاوت هر دانش‌آموز برای هر درس نگه داشته می‌شود)
export function getCleanupPreview() {
  return { filesToRemove: 37, mbToFree: 84 }
}

export const mockActivityLogs = [
  { id: 'l1', type: 'activity', text: 'یاسمن قاسمی آزمون درس ۶ را با نمرهٔ ۹۳ گذراند.', time: '۱۰ دقیقه پیش' },
  { id: 'l2', type: 'ai', text: 'درخواست تولید آزمون برای درس ۳ پایهٔ هشتم (GPT-4o) ارسال شد.', time: '۲۵ دقیقه پیش' },
  { id: 'l3', type: 'activity', text: 'معلم «خانم رضایی» کلاس «هفتم - ب» را ایجاد کرد.', time: '۱ ساعت پیش' },
  { id: 'l4', type: 'error', text: 'خطا در فراخوانی Whisper API برای فایل صوتی student_st3_l2.webm (Timeout).', time: '۳ ساعت پیش' },
  { id: 'l5', type: 'ai', text: 'تصحیح تلاوت درس ۲ برای محمدرضا احمدی با امتیاز ۸۸ انجام شد.', time: '۲ ساعت پیش' },
  { id: 'l6', type: 'activity', text: 'دانش‌آموز جدید «زهرا نوری» به کلاس «هشتم - ب» پیوست.', time: 'دیروز' }
]

export function getOverviewCounts() {
  const totalStudents = mockUsers.filter((u) => u.role === 'student').length
  const totalTeachers = mockUsers.filter((u) => u.role === 'teacher').length
  const totalAdmins = mockUsers.filter((u) => u.role === 'admin').length
  return { totalStudents, totalTeachers, totalAdmins, totalUsers: mockUsers.length }
}

// کلاس‌ها به همراه معلم مسئول (برای مدیریت کلاس‌ها در پنل ادمین)
export const mockAdminClasses = teacherClasses.map((c) => ({
  ...c,
  teacherName: c.grade_level === 8 ? 'آقای موسوی' : 'خانم رضایی',
  ...getClassStats(c.id)
}))
