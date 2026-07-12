import { LogOut } from 'lucide-react'
import { mockStudent } from '../lib/mockData.js'
import ThemeToggle from '../components/shared/ThemeToggle.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { profile, signOut } = useAuth()
  const displayName = profile?.full_name || mockStudent.full_name

  return (
    <div className="px-5 pt-6 flex flex-col gap-3">
      <h1 className="font-bold text-lg text-ink mb-1">پروفایل</h1>
      <div className="card-surface p-4">
        <p className="font-semibold text-ink">{displayName}</p>
        <p className="text-sm text-ink-soft mt-1">{mockStudent.class_name}</p>
      </div>

      <ThemeToggle />

      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 card-surface p-4 text-red-500 font-semibold text-sm"
      >
        <LogOut size={16} /> خروج از حساب
      </button>
    </div>
  )
}
