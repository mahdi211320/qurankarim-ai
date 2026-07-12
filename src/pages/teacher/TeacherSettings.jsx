import { LogOut } from 'lucide-react'
import { mockTeacher } from '../../lib/teacherMockData.js'
import { useAuth } from '../../context/AuthContext.jsx'

// تنظیمات کامل‌تر (اعلان‌ها، حالت تیره و ...) بعداً اضافه می‌شود.
export default function TeacherSettings() {
  const { profile, signOut } = useAuth()
  const displayName = profile?.full_name || mockTeacher.full_name

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-xl text-ink">تنظیمات</h1>
      <div className="card-surface p-5 flex flex-col gap-3">
        <div>
          <p className="text-xs text-ink-faint mb-1">نام</p>
          <p className="text-sm font-medium text-ink">{displayName}</p>
        </div>
        <div>
          <p className="text-xs text-ink-faint mb-1">تخصص</p>
          <p className="text-sm font-medium text-ink">{mockTeacher.specialization}</p>
        </div>
      </div>

      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 card-surface p-4 text-red-500 font-semibold text-sm w-fit px-6"
      >
        <LogOut size={16} /> خروج از حساب
      </button>
    </div>
  )
}
