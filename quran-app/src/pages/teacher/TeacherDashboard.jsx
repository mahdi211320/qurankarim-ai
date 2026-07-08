import { Users, School, TrendingUp, Activity } from 'lucide-react'
import StatCard from '../../components/teacher/StatCard.jsx'
import { getOverviewStats, mockRecentActivity } from '../../lib/teacherMockData.js'

export default function TeacherDashboard() {
  const stats = getOverviewStats()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-bold text-xl text-ink">داشبورد</h1>
        <p className="text-sm text-ink-soft mt-1">خلاصه‌ای از عملکرد کلاس‌ها و دانش‌آموزان شما</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Users} label="تعداد دانش‌آموزان" value={stats.totalStudents} />
        <StatCard icon={School} label="تعداد کلاس‌ها" value={stats.totalClasses} />
        <StatCard icon={TrendingUp} label="میانگین عملکرد کلاس‌ها" value={stats.avgPerformance} suffix="٪" color="gold" />
      </div>

      <div className="card-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={18} className="text-emerald-600" />
          <h2 className="font-bold text-ink">فعالیت‌های اخیر</h2>
        </div>
        <ul className="flex flex-col divide-y divide-paper-soft">
          {mockRecentActivity.map((item) => (
            <li key={item.id} className="py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-ink">
                <span className="font-semibold">{item.studentName}</span> {item.action}
              </p>
              <span className="text-[11px] text-ink-faint shrink-0">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
