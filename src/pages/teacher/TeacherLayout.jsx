import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/teacher/Sidebar.jsx'
import TeacherBottomNav from '../../components/teacher/TeacherBottomNav.jsx'

export default function TeacherLayout() {
  return (
    <div className="min-h-screen flex bg-paper" dir="rtl">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-5xl mx-auto px-5 py-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <TeacherBottomNav />
    </div>
  )
}
