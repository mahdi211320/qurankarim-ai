import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Bookmark, User } from 'lucide-react'

// نوار پایین ویژهٔ دانش‌آموزان: خانه، دروس من، نشان‌ها، پروفایل
const items = [
  { to: '/', label: 'خانه', icon: Home, end: true },
  { to: '/lessons', label: 'دروس من', icon: BookOpen },
  { to: '/bookmarks', label: 'نشان‌ها', icon: Bookmark },
  { to: '/profile', label: 'پروفایل', icon: User }
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-paper-card border-t border-paper-soft
                 pb-[env(safe-area-inset-bottom)]"
      aria-label="ناوبری اصلی"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium
                 transition-colors duration-150
                 ${isActive ? 'text-emerald-500' : 'text-ink-faint'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
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
