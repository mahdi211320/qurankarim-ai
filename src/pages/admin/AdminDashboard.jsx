import { Users, School, BookOpen, ShieldCheck } from 'lucide-react'
import StatCard from '../../components/teacher/StatCard.jsx'
import StorageWidget from '../../components/admin/StorageWidget.jsx'
import { getOverviewCounts, mockAdminClasses } from '../../lib/adminMockData.js'
import { mockLessons } from '../../lib/mockData.js'

export default function AdminDashboard() {
  const counts = getOverviewCounts()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-xl text-ink">داشبورد مدیریت</h1>
        <p className="text-sm text-ink-soft mt-1">نمای کلی از کاربران، کلاس‌ها و منابع سامانه</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="دانش‌آموزان" value={counts.totalStudents} />
        <StatCard icon={ShieldCheck} label="معلم‌ها" value={counts.totalTeachers} color="gold" />
        <StatCard icon={School} label="کلاس‌ها" value={mockAdminClasses.length} />
        <StatCard icon={BookOpen} label="دروس ثبت‌شده" value={mockLessons.length} color="gold" />
      </div>

      <StorageWidget />
    </div>
  )
}
