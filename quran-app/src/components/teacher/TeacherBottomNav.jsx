import { NavLink } from 'react-router-dom'
import { LayoutDashboard, School, Users, BarChart3, Settings } from 'lucide-react'

const items = [
  { to: '/teacher', label: 'داشبورد', icon: LayoutDashboard, end: true },
  { to: '/teacher/classes', label: 'کلاس‌ها', icon: School },
  { to: '/teacher/students', label: 'دانش‌آموزان', icon: Users },
  { to: '/teacher/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { to: '/teacher/settings', label: 'تنظیمات', icon: Settings }
]

export default function TeacherBottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-paper-card border-t border-paper-soft
                 pb-[env(safe-area-inset-bottom)]"
      aria-label="ناوبری پنل معلم"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium
                 ${isActive ? 'text-emerald-500' : 'text-ink-faint'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
