import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav.jsx'

/**
 * چارچوب اصلی صفحات دانش‌آموز. هر صفحه (Home، Lessons، Profile) با Outlet
 * جای‌گذاری می‌شود و نوار پایین همیشه ثابت باقی می‌ماند.
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-paper" dir="rtl">
      <main className="flex-1 pb-24 max-w-lg w-full mx-auto">
        <Outlet />
        <footer className="text-center py-6">
          <p className="text-[11px] text-ink-faint">
            طراحی و توسعه توسط محمد مهدی خراسانی
          </p>
        </footer>
      </main>
      <BottomNav />
    </div>
  )
}
