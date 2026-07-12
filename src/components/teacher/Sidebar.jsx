import { NavLink } from 'react-router-dom'
import { LayoutDashboard, School, Users, BarChart3, Settings, GraduationCap } from 'lucide-react'
import { mockTeacher } from '../../lib/teacherMockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

const items = [
  { to: '/teacher', label: 'داشبورد', icon: LayoutDashboard, end: true },
  { to: '/teacher/classes', label: 'کلاس‌های من', icon: School },
  { to: '/teacher/students', label: 'دانش‌آموزان', icon: Users },
  { to: '/teacher/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { to: '/teacher/settings', label: 'تنظیمات', icon: Settings }
]

export default function Sidebar() {
  const { profile } = useAuth()
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 min-h-screen bg-paper-card border-l border-paper-soft px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <GraduationCap size={18} />
        </div>
        <div>
          <p className="font-bold text-sm text-ink">پنل معلم</p>
          <p className="text-[11px] text-ink-faint">{profile?.full_name || mockTeacher.full_name}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
               ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-ink-soft hover:bg-paper-soft'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
