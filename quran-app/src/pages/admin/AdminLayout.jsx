import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import AdminBottomNav from '../../components/admin/AdminBottomNav.jsx'

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-paper" dir="rtl">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-5xl mx-auto px-5 py-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
      <AdminBottomNav />
    </div>
  )
}
